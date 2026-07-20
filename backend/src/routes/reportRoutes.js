import express from 'express';
import { exportExcel, exportCsv, exportPdf } from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/excel', exportExcel);
router.get('/csv', exportCsv);
router.get('/pdf', exportPdf);

export default router;
