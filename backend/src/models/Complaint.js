import mongoose from 'mongoose';

const STATUS_VALUES = [
  'Registered',
  'Assigned',
  'Material Ordered',
  'Under Process',
  'Waiting For Material',
  'Inspection Pending',
  'Completed',
  'Closed',
];

const PRIORITY_VALUES = ['Emergency', 'High', 'Medium', 'Normal'];

const COLONY_TYPES = [
  'Type I',
  'Type II',
  'Type III',
  'Bachelor Hostel',
  'Transit Camp',
  'Guest House',
  'Office',
  'Other',
];

const complaintSchema = new mongoose.Schema(
  {
    complaintNumber: { type: String, required: true, unique: true, index: true },
    date: { type: Date, default: Date.now },

    // Complainant details
    complainantName: { type: String, required: true, trim: true },
    employeeNumber: { type: String, trim: true },
    department: { type: String, trim: true },
    quarterNumber: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },

    colonyType: { type: String, enum: COLONY_TYPES, required: true },
    category: { type: String, required: true },
    priority: { type: String, enum: PRIORITY_VALUES, default: 'Normal', required: true },
    description: { type: String, required: true },
    location: { type: String, trim: true },

    beforeImages: [{ url: String, publicId: String }],
    afterImages: [{ url: String, publicId: String }],

    status: { type: String, enum: STATUS_VALUES, default: 'Registered', index: true },

    assignedEngineer: { type: mongoose.Schema.Types.ObjectId, ref: 'Engineer' },
    assignedContractor: { type: mongoose.Schema.Types.ObjectId, ref: 'Contractor' },
    materialRequired: { type: String, trim: true },
    estimatedCost: { type: Number },
    targetDate: { type: Date },
    completionDate: { type: Date },
    engineerRemarks: { type: String, trim: true },

    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

complaintSchema.index({ complainantName: 'text', quarterNumber: 'text', description: 'text' });

export const STATUS_OPTIONS = STATUS_VALUES;
export const PRIORITY_OPTIONS = PRIORITY_VALUES;
export const COLONY_TYPE_OPTIONS = COLONY_TYPES;

export default mongoose.model('Complaint', complaintSchema);
