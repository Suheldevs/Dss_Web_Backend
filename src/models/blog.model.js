import mongoose from "mongoose";
import slugify from "slugify";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      url: { type: String },
      public_url: { type: String},
      public_id: { type: String},
    },
    category: {
      type: [String],
    },
    tags: {
      type: [String],
    },
    // postedBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    // },
  },
  { timestamps: true }
);

blogSchema.pre("save", function (next) {
  if (!this.isModified("title")) return next();
  this.slug = slugify(this.title, {
    lower: true,
    strict: true,
    trim: true,
  });
  next();
});

export const Blog = mongoose.model("Blog", blogSchema);
