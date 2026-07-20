import express from 'express';
import {
  engineerCrud,
  contractorCrud,
  categoryCrud,
  getSettings,
  updateSettings,
} from '../controllers/masterDataController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.route('/engineers').get(engineerCrud.list).post(authorize('admin'), engineerCrud.create);
router
  .route('/engineers/:id')
  .put(authorize('admin'), engineerCrud.update)
  .delete(authorize('admin'), engineerCrud.remove);

router.route('/contractors').get(contractorCrud.list).post(authorize('admin'), contractorCrud.create);
router
  .route('/contractors/:id')
  .put(authorize('admin'), contractorCrud.update)
  .delete(authorize('admin'), contractorCrud.remove);

router.route('/categories').get(categoryCrud.list).post(authorize('admin'), categoryCrud.create);
router
  .route('/categories/:id')
  .put(authorize('admin'), categoryCrud.update)
  .delete(authorize('admin'), categoryCrud.remove);

router.route('/settings').get(getSettings).put(authorize('admin'), updateSettings);

export default router;
