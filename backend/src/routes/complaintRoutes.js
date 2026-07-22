import express from 'express';
import {
  createComplaint,
  trackComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  updateComplaintStatus,
  deleteComplaint,
  getAllHistory,
} from '../controllers/complaintController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/track/:complaintNumber', trackComplaint);
router.get('/history/all', getAllHistory);

router
  .route('/')
  .get(getComplaints)
  .post(createComplaint);

router
  .route('/:id')
  .get(getComplaintById)
  .put(updateComplaint)
  .delete(authorize('admin'), deleteComplaint);

router.patch('/:id/status', updateComplaintStatus);

export default router;
