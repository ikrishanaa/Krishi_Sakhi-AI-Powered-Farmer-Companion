import { api } from './api';

export interface SensorReading {
  id?: number;
  recorded_at: string;
  temperature: number | null;
  humidity: number | null;
  soil_moisture: number | null;
  soil_temp: number | null;
  nitrogen: number | null;
  phosphorus: number | null;
  potassium: number | null;
}

export interface SensorDevice {
  id: number;
  device_name: string;
  last_seen_at: string | null;
}

export async function getLatestReading(farmId: number): Promise<{ farm_id: number; device: SensorDevice | null; reading: SensorReading | null }> {
  const { data } = await api.get(`/hardware/latest/${farmId}`);
  return data;
}

export async function getReadingHistory(farmId: number, limit = 50): Promise<{ farm_id: number; readings: SensorReading[] }> {
  const { data } = await api.get(`/hardware/history/${farmId}?limit=${limit}`);
  return data;
}

export async function registerDevice(farmId: number, deviceName?: string): Promise<{ device_id: number; device_name: string; api_key: string; message: string }> {
  const { data } = await api.post('/hardware/register-device', { farm_id: farmId, device_name: deviceName });
  return data;
}

export async function listDevices(farmId: number): Promise<{ farm_id: number; devices: SensorDevice[] }> {
  const { data } = await api.get(`/hardware/devices/${farmId}`);
  return data;
}
