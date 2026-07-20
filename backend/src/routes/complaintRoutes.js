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

router.use(protect); // every complaint route requires authentication

router.get('/track/:complaintNumber', trackComplaint);
router.get('/history/all', getAllHistory); // must be registered before the /:id route

router
  .route('/')
  .get(getComplaints)
  .post(upload.fields([{ name: 'beforeImages', maxCount: 10 }]), createComplaint);

router
  .route('/:id')
  .get(getComplaintById)
  .put(updateComplaint)
  .delete(authorize('admin'), deleteComplaint);

router.patch('/:id/status', updateComplaintStatus);
router.post('/:id/after-images', upload.array('afterImages', 10), uploadAfterImages);

export default router;
