import  Gallery  from "../models/gallery.model.js";
import ApiError from "../utils/ApiError.js";
import { uploadFiles, deleteFile, deleteLocalFile } from "../utils/cloudinary.js";

// ✅ Create Gallery Item
export const createGallery = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next(new ApiError(400, "At least one image is required"));
    }

    let result;
    if (process.env.USE_CLOUDINARY === "true") {
      result = await uploadFiles(req.files);
      if (!result.success) {
        return next(new ApiError(400, "Unable to upload Images"));
      }
    } else {
      result = {
        success: true,
        files: req.files.map(file => ({
          url: file.path.replace(/\\/g, "/"),
          public_url: null,
          public_id: null,
        })),
      };
    }

    const gallery = new Gallery({
      image: result.files[0], // single image required
      category: req.body.category || null,
      projectName: req.body.projectName || null,
      productName: req.body.productName || null,
    });

    const saved = await gallery.save();

    return res.api(res, 201, "Gallery item created successfully", saved);
  } catch (err) {
    return next(new ApiError(500, err?.message || "Internal Server Error"));
  }
};

// ✅ Update Gallery Item
export const updateGallery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const gallery = await Gallery.findById(id);
    if (!gallery) return next(new ApiError(404, "Gallery item not found"));

    let updatedImage = gallery.image;

    // अगर नई image upload हुई है
    if (req.files && req.files.length > 0) {
      if (gallery.image?.public_id) {
        try {
          await deleteFile(gallery.image.public_id);
        } catch (e) {
          console.error("Image delete failed:", e.message);
        }
      }

      let result;
      if (process.env.USE_CLOUDINARY === "true") {
        result = await uploadFiles(req.files);
        if (!result.success) {
          return next(new ApiError(400, "Unable to upload Images"));
        }
      } else {
        result = {
          success: true,
          files: req.files.map(file => ({
            url: file.path.replace(/\\/g, "/"),
            public_url: null,
            public_id: null,
          })),
        };
      }

      updatedImage = result.files[0];
    }

    gallery.image = updatedImage;
    gallery.category = req.body.category || gallery.category;
    gallery.projectName = req.body.projectName || gallery.projectName;
    gallery.productName = req.body.productName || gallery.productName;

    const updated = await gallery.save();

    return res.api(res, 200, "Gallery item updated successfully", updated);
  } catch (err) {
    return next(new ApiError(500, err?.message || "Internal Server Error"));
  }
};

// ✅ Get All Gallery Items
export const getAllGallery = async (req, res, next) => {
  try {
    const galleries = await Gallery.find().sort({ createdAt: -1 });
    return res.api(res, 200, "Gallery items fetched successfully", galleries);
  } catch (err) {
    return next(new ApiError(500, err?.message || "Internal Server Error"));
  }
};

// ✅ Get Gallery Item by ID
export const getGalleryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const gallery = await Gallery.findById(id);
    if (!gallery) return next(new ApiError(404, "Gallery item not found"));
    return res.api(res, 200, "Gallery item fetched successfully", gallery);
  } catch (err) {
    return next(new ApiError(500, err?.message || "Internal Server Error"));
  }
};

// ✅ Delete Gallery Item
export const deleteGallery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const gallery = await Gallery.findById(id);
    if (!gallery) return next(new ApiError(404, "Gallery item not found"));

    if (gallery.image?.public_id) {
      try {
        await deleteFile(gallery.image.public_id);
      } catch (e) {
        console.error("Image delete failed:", e.message);
      }
    }

    await gallery.deleteOne();

    return res.api(res, 200, "Gallery item deleted successfully", null);
  } catch (err) {
    return next(new ApiError(500, err?.message || "Internal Server Error"));
  }
};
