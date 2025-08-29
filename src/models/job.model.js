import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    jobProfile: {
      type: String,
      required: true,
      trim: true,
    },
    resume: {
      url: { type: String, required: true },
      public_url: { type: String },
      public_id: { type: String },
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

const Job = mongoose.model('Job', jobSchema);

export default Job;
