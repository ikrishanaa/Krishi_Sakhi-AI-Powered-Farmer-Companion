// server/src/api/routes/hardware.ts
import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { HardwareController } from '../controllers/HardwareController';

const router = Router();

// ESP32 data ingestion (device auth via X-Device-Key header, no user auth)
router.post('/ingest', HardwareController.ingest);

// User-authenticated endpoints
router.post('/register-device', requireAuth, HardwareController.registerDevice);
router.get('/latest/:farmId', requireAuth, HardwareController.latest);
router.get('/history/:farmId', requireAuth, HardwareController.history);
router.get('/devices/:farmId', requireAuth, HardwareController.listDevices);

export { router as hardwareRouter };
