// models/team.model.js
import mongoose from "mongoose";
import slugify from "slugify";

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, default: null  },     
    public_url: { type: String, default: null },
    public_id: { type: String, default: null }, 
  },
  { _id: false }
);

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    image: { type: imageSchema, required: true }, 
    designation: { type: String, default: null, trim: true },
    department: { type: String, default: null, trim: true },
    description: { type: String, default: null }, 
  },
  { timestamps: true }
);

teamSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

const Team = mongoose.model("Team", teamSchema);
export default Team;
