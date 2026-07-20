import mongoose from 'mongoose';

const contractorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    firmName: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    tradeType: { type: String, trim: true }, // e.g. Plumbing, Masonry, Electrical
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Contractor', contractorSchema);
