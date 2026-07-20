import asyncHandler from 'express-async-handler';
import Engineer from '../models/Engineer.js';
import Contractor from '../models/Contractor.js';
import Category from '../models/Category.js';
import Settings from '../models/Settings.js';

// Generic factory for simple master-data CRUD (Engineer, Contractor, Category)
function buildCrud(Model, label) {
  return {
    list: asyncHandler(async (req, res) => {
      const items = await Model.find().sort({ name: 1 });
      res.json({ success: true, items });
    }),
    create: asyncHandler(async (req, res) => {
      const item = await Model.create(req.body);
      res.status(201).json({ success: true, item });
    }),
    update: asyncHandler(async (req, res) => {
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!item) {
        res.status(404);
        throw new Error(`${label} not found`);
      }
      res.json({ success: true, item });
    }),
    remove: asyncHandler(async (req, res) => {
      const item = await Model.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
      if (!item) {
        res.status(404);
        throw new Error(`${label} not found`);
      }
      res.json({ success: true, message: `${label} deactivated` });
    }),
  };
}

export const engineerCrud = buildCrud(Engineer, 'Engineer');
export const contractorCrud = buildCrud(Contractor, 'Contractor');
export const categoryCrud = buildCrud(Category, 'Category');

// @desc    Get application settings (creates default doc on first call)
// @route   GET /api/settings
// @access  Private (admin, operator)
export const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  res.json({ success: true, settings });
});

// @desc    Update application settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = new Settings({});
  Object.assign(settings, req.body);
  await settings.save();
  res.json({ success: true, settings });
});
