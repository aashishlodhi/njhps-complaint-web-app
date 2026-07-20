import asyncHandler from 'express-async-handler';
import Complaint from '../models/Complaint.js';

// @desc    Aggregate dashboard stats and chart data
// @route   GET /api/dashboard/stats
// @access  Private (admin, operator)
export const getDashboardStats = asyncHandler(async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    totalComplaints,
    todaysComplaints,
    pendingComplaints,
    completedComplaints,
    closedComplaints,
    emergencyComplaints,
    highPriorityComplaints,
    overdueComplaints,
    monthlyTrend,
    byCategory,
    byStatus,
    byPriority,
    engineerWorkload,
    contractorWorkload,
  ] = await Promise.all([
    Complaint.countDocuments(),
    Complaint.countDocuments({ date: { $gte: startOfToday } }),
    Complaint.countDocuments({ status: { $nin: ['Completed', 'Closed'] } }),
    Complaint.countDocuments({ status: 'Completed' }),
    Complaint.countDocuments({ status: 'Closed' }),
    Complaint.countDocuments({ priority: 'Emergency', status: { $nin: ['Completed', 'Closed'] } }),
    Complaint.countDocuments({ priority: 'High', status: { $nin: ['Completed', 'Closed'] } }),
    Complaint.countDocuments({
      targetDate: { $lt: new Date() },
      status: { $nin: ['Completed', 'Closed'] },
    }),
    Complaint.aggregate([
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]),
    Complaint.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Complaint.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
    Complaint.aggregate([
      { $match: { assignedEngineer: { $ne: null } } },
      { $group: { _id: '$assignedEngineer', count: { $sum: 1 } } },
      { $lookup: { from: 'engineers', localField: '_id', foreignField: '_id', as: 'engineer' } },
      { $unwind: '$engineer' },
      { $project: { name: '$engineer.name', count: 1 } },
    ]),
    Complaint.aggregate([
      { $match: { assignedContractor: { $ne: null } } },
      { $group: { _id: '$assignedContractor', count: { $sum: 1 } } },
      { $lookup: { from: 'contractors', localField: '_id', foreignField: '_id', as: 'contractor' } },
      { $unwind: '$contractor' },
      { $project: { name: '$contractor.name', count: 1 } },
    ]),
  ]);

  const completionPercentage =
    totalComplaints === 0 ? 0 : Math.round(((completedComplaints + closedComplaints) / totalComplaints) * 100);

  res.json({
    success: true,
    cards: {
      totalComplaints,
      todaysComplaints,
      pendingComplaints,
      completedComplaints,
      closedComplaints,
      emergencyComplaints,
      highPriorityComplaints,
      overdueComplaints,
    },
    charts: {
      monthlyTrend,
      byCategory,
      byStatus,
      byPriority,
      engineerWorkload,
      contractorWorkload,
      completionPercentage,
    },
  });
});
