import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_url: { type: String },
  public_id: { type: String },
});

const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    requirement: {
      type: String,
      required: [true, "Requirement is required"],
      trim: true,
    },
    sitePhotos: {
      type: [fileSchema], 
      default: [],
    },
    message: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

 const Inquiry = mongoose.model("Inquiry", inquirySchema);
 export default Inquiry
