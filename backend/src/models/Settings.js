import mongoose from 'mongoose';

// Single document collection holding app-wide configuration.
const settingsSchema = new mongoose.Schema(
  {
    applicationName: { type: String, default: 'NJHPS Civil Complaint Cell' },
    logoUrl: { type: String },
    secondaryLogoUrl: { type: String },
    notifications: {
      smsEnabled: { type: Boolean, default: false },
      emailEnabled: { type: Boolean, default: false },
      whatsappEnabled: { type: Boolean, default: false },
    },
    quarterTypes: [{ type: String }],
    departments: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model('Settings', settingsSchema);
