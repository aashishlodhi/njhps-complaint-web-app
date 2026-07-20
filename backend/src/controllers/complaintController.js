import asyncHandler from 'express-async-handler';
import QRCode from 'qrcode';
import Complaint from '../models/Complaint.js';
import ComplaintHistory from '../models/ComplaintHistory.js';
import { generateComplaintNumber } from '../utils/generateComplaintNumber.js';

// @desc    Register a new complaint
// @route   POST /api/complaints
// @access  Private (admin, operator)
export const createComplaint = asyncHandler(async (req, res) => {
  const complaintNumber = await generateComplaintNumber();

  const beforeImages = (req.files?.beforeImages || []).map((f) => ({
    url: f.path,
    publicId: f.filename,
  }));

  const complaint = await Complaint.create({
    ...req.body,
    complaintNumber,
    beforeImages,
    registeredBy: req.user._id,
  });

  await ComplaintHistory.create({
    complaint: complaint._id,
    updatedBy: req.user._id,
    previousStatus: null,
    newStatus: 'Registered',
    remarks: 'Complaint registered',
  });

  const qrDataUrl = await QRCode.toDataURL(complaint.complaintNumber);

  res.status(201).json({ success: true, complaint, qrCode: qrDataUrl });
});

// @desc    Get complaint by complaint number (public status check)
// @route   GET /api/complaints/track/:complaintNumber
// @access  Private (admin, operator) — tighten/loosen per deployment needs
export const trackComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findOne({ complaintNumber: req.params.complaintNumber })
    .populate('assignedEngineer', 'name phone')
    .populate('assignedContractor', 'name firmName phone');

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  res.json({ success: true, complaint });
});

// @desc    List / search / filter complaints with pagination
// @route   GET /api/complaints
// @access  Private (admin, operator)
export const getComplaints = asyncHandler(async (req, res) => {
  const {
    search,
    status,
    priority,
    category,
    engineer,
    contractor,
    quarterNumber,
    dateFrom,
    dateTo,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { complaintNumber: { $regex: search, $options: 'i' } },
      { complainantName: { $regex: search, $options: 'i' } },
      { phoneNumber: { $regex: search, $options: 'i' } },
      { quarterNumber: { $regex: search, $options: 'i' } },
    ];
  }
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (category) query.category = category;
  if (engineer) query.assignedEngineer = engineer;
  if (contractor) query.assignedContractor = contractor;
  if (quarterNumber) query.quarterNumber = { $regex: quarterNumber, $options: 'i' };
  if (dateFrom || dateTo) {
    query.date = {};
    if (dateFrom) query.date.$gte = new Date(dateFrom);
    if (dateTo) query.date.$lte = new Date(dateTo);
  }

  const pageNum = Math.max(parseInt(page, 10), 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10), 1), 100);

  const [complaints, total] = await Promise.all([
    Complaint.find(query)
      .populate('assignedEngineer', 'name')
      .populate('assignedContractor', 'name firmName')
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Complaint.countDocuments(query),
  ]);

  res.json({
    success: true,
    complaints,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// @desc    Get single complaint by id
// @route   GET /api/complaints/:id
// @access  Private (admin, operator)
export const getComplaintById = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('assignedEngineer', 'name phone email')
    .populate('assignedContractor', 'name firmName phone email')
    .populate('registeredBy', 'name username');

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  const history = await ComplaintHistory.find({ complaint: complaint._id })
    .populate('updatedBy', 'name username')
    .sort({ createdAt: 1 });

  res.json({ success: true, complaint, history });
});

// @desc    Update complaint details / assignment (does not directly change status)
// @route   PUT /api/complaints/:id
// @access  Private (admin, operator)
export const updateComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  const allowedFields = [
    'assignedEngineer',
    'assignedContractor',
    'materialRequired',
    'estimatedCost',
    'targetDate',
    'engineerRemarks',
    'priority',
    'category',
    'description',
    'location',
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) complaint[field] = req.body[field];
  });

  await complaint.save();
  res.json({ success: true, complaint });
});

// @desc    Update complaint status (always logs to history)
// @route   PATCH /api/complaints/:id/status
// @access  Private (admin, operator)
export const updateComplaintStatus = asyncHandler(async (req, res) => {
  const { status, remarks } = req.body;
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }
  if (!status) {
    res.status(400);
    throw new Error('New status is required');
  }

  const previousStatus = complaint.status;
  complaint.status = status;
  if (status === 'Completed' && !complaint.completionDate) {
    complaint.completionDate = new Date();
  }
  await complaint.save();

  await ComplaintHistory.create({
    complaint: complaint._id,
    updatedBy: req.user._id,
    previousStatus,
    newStatus: status,
    remarks,
  });

  res.json({ success: true, complaint });
});

// @desc    Upload "after repair" images to a complaint
// @route   POST /api/complaints/:id/after-images
// @access  Private (admin, operator)
export const uploadAfterImages = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  const afterImages = (req.files || []).map((f) => ({ url: f.path, publicId: f.filename }));
  complaint.afterImages.push(...afterImages);
  await complaint.save();

  res.json({ success: true, complaint });
});

// @desc    List complaint history across all complaints (paginated, most recent first)
// @route   GET /api/complaints/history/all
// @access  Private (admin, operator)
export const getAllHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 25 } = req.query;
  const pageNum = Math.max(parseInt(page, 10), 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10), 1), 100);

  const [entries, total] = await Promise.all([
    ComplaintHistory.find()
      .populate('updatedBy', 'name username')
      .populate('complaint', 'complaintNumber complainantName')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    ComplaintHistory.countDocuments(),
  ]);

  res.json({
    success: true,
    entries,
    pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

// @desc    Delete a complaint (admin only)
// @route   DELETE /api/complaints/:id
// @access  Private/Admin
export const deleteComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }
  await complaint.deleteOne();
  // History is intentionally retained for audit purposes even after deletion.
  res.json({ success: true, message: 'Complaint deleted' });
});
