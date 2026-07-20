import express from 'express';
import {
  createComplaint,
  trackComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  updateComplaintStatus,
  uploadAfterImages,
  deleteComplaint,
  getAllHistory,
} from '../controllers/complaintController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Every complaint route requires authentication
router.use(protect);

// Track complaint
router.get('/track/:complaintNumber', trackComplaint);

// Complaint history
router.get('/history/all', getAllHistory);

// Get all complaints and create a complaint
router
  .route('/')
  .get(getComplaints)
  .post(createComplaint);

// Get, update and delete complaint by ID
router
  .route('/:id')
  .get(getComplaintById)
  .put(updateComplaint)
  .delete(authorize('admin'), deleteComplaint);

// Update complaint status
router.patch('/:id/status', updateComplaintStatus);

// Upload after images (temporarily without image upload middleware)
router.post('/:id/after-images', uploadAfterImages);

export default router;
