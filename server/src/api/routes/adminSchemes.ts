// server/src/api/routes/adminSchemes.ts
import { Router } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth';
import { AdminSchemesController } from '../controllers/SchemesController';

const router = Router();

router.get('/', requireAuth, requireAdmin, AdminSchemesController.list);
router.post('/', requireAuth, requireAdmin, AdminSchemesController.create);

export { router as adminSchemesRouter };