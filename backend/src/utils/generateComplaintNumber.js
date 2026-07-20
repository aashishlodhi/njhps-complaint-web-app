import Complaint from '../models/Complaint.js';

/**
 * Generates the next sequential complaint number for the current year
 * in the format NJHPS-YYYY-XXXXXX (e.g. NJHPS-2026-000001).
 * Uses a per-year count query; safe for moderate concurrency because
 * duplicate key errors on the unique index would surface on insert.
 */
export async function generateComplaintNumber() {
  const year = new Date().getFullYear();
  const prefix = `NJHPS-${year}-`;

  const lastComplaint = await Complaint.findOne({
    complaintNumber: { $regex: `^${prefix}` },
  })
    .sort({ complaintNumber: -1 })
    .lean();

  let nextSeq = 1;
  if (lastComplaint) {
    const lastSeq = parseInt(lastComplaint.complaintNumber.split('-')[2], 10);
    nextSeq = lastSeq + 1;
  }

  return `${prefix}${String(nextSeq).padStart(6, '0')}`;
}
