import mongoose from 'mongoose';

// Append-only audit log. No update/delete routes are ever exposed for this collection.
const complaintHistorySchema = new mongoose.Schema(
  {
    complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true, index: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    previousStatus: { type: String },
    newStatus: { type: String, required: true },
    remarks: { type: String, trim: true },
  },
  { timestamps: true } // createdAt doubles as the date/time of the log entry
);

export default mongoose.model('ComplaintHistory', complaintHistorySchema);
