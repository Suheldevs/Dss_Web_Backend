import mongoose from "mongoose";
import slugify from "slugify";
const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    slug: { type: String, unique: true, index: true },
    images: [{ url: { type: String, } , public_url:{ type: String, } , public_id:{ type: String, } }],
    category: { type: String, required: true },
    tags: [String],
  },
  { timestamps: true }
);

productSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

const Product = mongoose.model("Product", productSchema);

export default Product;
