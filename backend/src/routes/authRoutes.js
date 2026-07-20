import express from 'express';
import { login, getMe, createUser, listUsers, updateUser } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.get('/me', protect, getMe);

router.get('/users', protect, authorize('admin'), listUsers);
router.post('/users', protect, authorize('admin'), createUser);
router.put('/users/:id', protect, authorize('admin'), updateUser);

export default router;
