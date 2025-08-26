
import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },      
    public_url: { type: String, default: null },
    public_id: { type: String, default: null },
  },
  { _id: false }
);

const gallerySchema = new mongoose.Schema(
  {
    image: { type: imageSchema, required: true }, 
    category: { type: String, trim: true, default: null }
  },
  { timestamps: true }
);

 const Gallery = mongoose.model("Gallery", gallerySchema);
export default Gallery