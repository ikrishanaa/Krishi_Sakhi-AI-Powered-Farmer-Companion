// server/src/api/controllers/HardwareController.ts
import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import crypto from 'crypto';

function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

function generateApiKey(): string {
  return `ksk_${crypto.randomBytes(24).toString('hex')}`;
}

export class HardwareController {
  /**
   * POST /api/hardware/register-device
   * Register a new ESP32 sensor device for a farm. Returns the plain API key once (user must save it).
   * Body: { farm_id: number, device_name?: string }
   * Requires user auth.
   */
  static async registerDevice(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user?.sub) return res.status(401).json({ error: 'Unauthorized' });
      const userId = parseInt(String(user.sub), 10);
      const { farm_id, device_name } = req.body || {};

      if (!farm_id) return res.status(400).json({ error: 'farm_id is required' });

      // Verify farm belongs to user
      const farm = await prisma.farm.findFirst({ where: { id: Number(farm_id), user_id: userId } });
      if (!farm) return res.status(404).json({ error: 'Farm not found or not owned by you' });

      const plainKey = generateApiKey();
      const hashed = hashKey(plainKey);

      const device = await prisma.sensorDevice.create({
        data: {
          farm_id: Number(farm_id),
          device_name: device_name || 'ESP32 Sensor Kit',
          api_key_hash: hashed,
        },
      });

      return res.status(201).json({
        device_id: device.id,
        device_name: device.device_name,
        api_key: plainKey, // shown only once
        message: 'Save this API key! It will not be shown again. Use it as the X-Device-Key header when sending data from ESP32.',
      });
    } catch (e: any) {
      return res.status(500).json({ error: e?.message || 'Failed to register device' });
    }
  }

  /**
   * POST /api/hardware/ingest
   * ESP32 sends sensor data here. Authenticated by X-Device-Key header.
   * Body: { temperature?, humidity?, soil_moisture?, soil_temp?, nitrogen?, phosphorus?, potassium? }
   */
  static async ingest(req: Request, res: Response) {
    try {
      const apiKey = req.headers['x-device-key'] as string;
      if (!apiKey) return res.status(401).json({ error: 'Missing X-Device-Key header' });

      const hashed = hashKey(apiKey);
      const device = await prisma.sensorDevice.findUnique({ where: { api_key_hash: hashed } });
      if (!device) return res.status(401).json({ error: 'Invalid device key' });
      if (!device.is_active) return res.status(403).json({ error: 'Device is deactivated' });

      const body = req.body || {};

      // Validate sensor values are finite numbers within realistic ranges
      const sensorVal = (v: any, min: number, max: number): number | null => {
        if (v == null) return null;
        const n = Number(v);
        if (!Number.isFinite(n)) return null;
        if (n < min || n > max) return null;
        return n;
      };

      const data = {
        device_id: device.id,
        temperature: sensorVal(body.temperature, -50, 80),
        humidity: sensorVal(body.humidity, 0, 100),
        soil_moisture: sensorVal(body.soil_moisture, 0, 100),
        soil_temp: sensorVal(body.soil_temp, -30, 80),
        nitrogen: sensorVal(body.nitrogen, 0, 1000),
        phosphorus: sensorVal(body.phosphorus, 0, 1000),
        potassium: sensorVal(body.potassium, 0, 1000),
      };

      const reading = await prisma.sensorReading.create({ data });

      // Update last_seen_at
      await prisma.sensorDevice.update({
        where: { id: device.id },
        data: { last_seen_at: new Date() },
      });

      return res.status(201).json({ ok: true, reading_id: reading.id, recorded_at: reading.recorded_at });
    } catch (e: any) {
      return res.status(500).json({ error: e?.message || 'Failed to store reading' });
    }
  }

  /**
   * GET /api/hardware/latest/:farmId
   * Get the latest sensor reading for a farm. Requires user auth.
   */
  static async latest(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user?.sub) return res.status(401).json({ error: 'Unauthorized' });
      const userId = parseInt(String(user.sub), 10);
      const farmId = parseInt(String(req.params.farmId), 10);

      // Verify farm belongs to user
      const farm = await prisma.farm.findFirst({ where: { id: farmId, user_id: userId } });
      if (!farm) return res.status(404).json({ error: 'Farm not found' });

      // Find devices for this farm
      const devices = await prisma.sensorDevice.findMany({
        where: { farm_id: farmId, is_active: true },
        select: { id: true, device_name: true, last_seen_at: true },
      });

      if (devices.length === 0) {
        return res.json({ farm_id: farmId, device: null, reading: null });
      }

      // Get latest reading from the most recently active device
      const deviceIds = devices.map(d => d.id);
      const reading = await prisma.sensorReading.findFirst({
        where: { device_id: { in: deviceIds } },
        orderBy: { recorded_at: 'desc' },
        include: { device: { select: { id: true, device_name: true, last_seen_at: true } } },
      });

      return res.json({
        farm_id: farmId,
        device: reading?.device || devices[0],
        reading: reading ? {
          id: reading.id,
          recorded_at: reading.recorded_at,
          temperature: reading.temperature,
          humidity: reading.humidity,
          soil_moisture: reading.soil_moisture,
          soil_temp: reading.soil_temp,
          nitrogen: reading.nitrogen,
          phosphorus: reading.phosphorus,
          potassium: reading.potassium,
        } : null,
      });
    } catch (e: any) {
      return res.status(500).json({ error: e?.message || 'Failed to fetch latest reading' });
    }
  }

  /**
   * GET /api/hardware/history/:farmId
   * Get recent sensor history (last 50 readings) for a farm. Requires user auth.
   * Query: ?limit=50
   */
  static async history(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user?.sub) return res.status(401).json({ error: 'Unauthorized' });
      const userId = parseInt(String(user.sub), 10);
      const farmId = parseInt(String(req.params.farmId), 10);
      const limit = Math.min(parseInt(String(req.query.limit || '50'), 10), 200);

      const farm = await prisma.farm.findFirst({ where: { id: farmId, user_id: userId } });
      if (!farm) return res.status(404).json({ error: 'Farm not found' });

      const devices = await prisma.sensorDevice.findMany({
        where: { farm_id: farmId, is_active: true },
        select: { id: true },
      });

      if (devices.length === 0) {
        return res.json({ farm_id: farmId, readings: [] });
      }

      const deviceIds = devices.map(d => d.id);
      const readings = await prisma.sensorReading.findMany({
        where: { device_id: { in: deviceIds } },
        orderBy: { recorded_at: 'desc' },
        take: limit,
      });

      return res.json({
        farm_id: farmId,
        readings: readings.map(r => ({
          id: r.id,
          recorded_at: r.recorded_at,
          temperature: r.temperature,
          humidity: r.humidity,
          soil_moisture: r.soil_moisture,
          soil_temp: r.soil_temp,
          nitrogen: r.nitrogen,
          phosphorus: r.phosphorus,
          potassium: r.potassium,
        })),
      });
    } catch (e: any) {
      return res.status(500).json({ error: e?.message || 'Failed to fetch history' });
    }
  }

  /**
   * GET /api/hardware/devices/:farmId
   * List all sensor devices for a farm. Requires user auth.
   */
  static async listDevices(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user?.sub) return res.status(401).json({ error: 'Unauthorized' });
      const userId = parseInt(String(user.sub), 10);
      const farmId = parseInt(String(req.params.farmId), 10);

      const farm = await prisma.farm.findFirst({ where: { id: farmId, user_id: userId } });
      if (!farm) return res.status(404).json({ error: 'Farm not found' });

      const devices = await prisma.sensorDevice.findMany({
        where: { farm_id: farmId },
        select: { id: true, device_name: true, is_active: true, last_seen_at: true, created_at: true, sensor_types: true },
        orderBy: { id: 'asc' },
      });

      return res.json({ farm_id: farmId, devices });
    } catch (e: any) {
      return res.status(500).json({ error: e?.message || 'Failed to list devices' });
    }
  }
}
