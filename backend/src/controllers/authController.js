import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400);
    throw new Error('Username and password are required');
  }

  const user = await User.findOne({ username: username.toLowerCase() }).select('+password');

  if (!user || !user.isActive || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid username or password');
  }

  user.lastLogin = new Date();
  await user.save();

  res.json({
    success: true,
    token: generateToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
    },
  });
});

// @desc    Get logged-in user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

// @desc    Create a new user (admin only)
// @route   POST /api/auth/users
// @access  Private/Admin
export const createUser = asyncHandler(async (req, res) => {
  const { name, username, password, role, phone, email } = req.body;

  const exists = await User.findOne({ username: username?.toLowerCase() });
  if (exists) {
    res.status(400);
    throw new Error('Username already exists');
  }

  const user = await User.create({ name, username, password, role, phone, email });

  res.status(201).json({
    success: true,
    user: { id: user._id, name: user.name, username: user.username, role: user.role },
  });
});

// @desc    List all users (admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
export const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ success: true, users });
});

// @desc    Update a user's active status / role (admin only)
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { name, role, isActive, phone, email } = req.body;
  if (name !== undefined) user.name = name;
  if (role !== undefined) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  if (phone !== undefined) user.phone = phone;
  if (email !== undefined) user.email = email;

  await user.save();
  res.json({ success: true, user });
});
