import mongoose from "mongoose";
import Gallery from "../models/gallery.model.js";
import ApiError from "../utils/ApiError.js";
import { uploadFiles, deleteFile, deleteLocalFile } from "../utils/cloudinary.js";

// Create Gallery
export const createGallery = async (req, res, next) => {
  let uploadedFileId = null;
  let uploadedFileUrl = null;

  try {
    if (!req.file) {
      return next(new ApiError(400, "Image is required"));
    }

    let result = null;
    if (process.env.USE_CLOUDINARY === "true") {
      result = await uploadFiles([req.file]);
      if (!result.success || !result.files[0].url) {
        return next(new ApiError(400, "Unable to upload Image"));
      }
    } else {
      result = {
        success: true,
        files: [
          {
            url: req.file?.path?.replace(/\\/g, "/"),
            public_url: null,
            public_id: null,
          },
        ],
      };
    }

    uploadedFileId = result.files[0].public_id || null;
    uploadedFileUrl = result.files[0].url || null;

    const gallery = new Gallery({
      image: result.files[0],
      category: req.body.category || null,
      projectName: req.body.projectName || null,
      productName: req.body.productName || null,
    });

    const savedGallery = await gallery.save();

    const { public_id, ...imageWithoutId } = savedGallery.image.toObject();
    const responseData = {
      ...savedGallery.toObject(),
      image: imageWithoutId,
    };

    return res.api(201, "Gallery item created successfully", responseData);
  } catch (err) {
    if (uploadedFileId) {
      try {
        await deleteFile(uploadedFileId);
      } catch {}
    }
    if (uploadedFileUrl) {
      try {
        deleteLocalFile(uploadedFileUrl);
      } catch {}
    }
    return next(new ApiError(500, err?.message || "Internal Server Error"));
  }
};

// Update Gallery
export const updateGallery = async (req, res, next) => {
  let uploadedFileId = null;
  let uploadedFileUrl = null;

  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid Gallery ID format"));
    }

    const gallery = await Gallery.findById(id);
    if (!gallery) return next(new ApiError(404, "Gallery item not found"));

    const updateData = {
      category: req.body.category || gallery.category,
      projectName: req.body.projectName || gallery.projectName,
      productName: req.body.productName || gallery.productName,
    };

    if (req.file) {
      let result = null;

      if (process.env.USE_CLOUDINARY === "true") {
        result = await uploadFiles([req.file]);
        if (!result.success || !result.files[0].url) {
          return next(new ApiError(400, "Unable to upload new Image"));
        }
      } else {
        result = {
          success: true,
          files: [
            {
              url: req.file?.path?.replace(/\\/g, "/"),
              public_url: null,
              public_id: null,
            },
          ],
        };
      }

      uploadedFileId = result.files[0].public_id || null;
      uploadedFileUrl = result.files[0].url || null;

      updateData.image = result.files[0];
    }

    const updatedGallery = await Gallery.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedGallery) {
      if (uploadedFileId) await deleteFile(uploadedFileId);
      if (uploadedFileUrl) deleteLocalFile(uploadedFileUrl);
      return next(new ApiError(500, "Failed to update Gallery item"));
    }

    if (req.file) {
      if (gallery.image?.public_id) await deleteFile(gallery.image.public_id);
      if (gallery.image?.url) deleteLocalFile(gallery.image.url);
    }

    const { public_id, ...imageWithoutId } = updatedGallery.image.toObject();
    const responseData = {
      ...updatedGallery.toObject(),
      image: imageWithoutId,
    };

    return res.api(200, "Gallery item updated successfully", responseData);
  } catch (err) {
    if (uploadedFileId) {
      try {
        await deleteFile(uploadedFileId);
      } catch {}
    }
    if (uploadedFileUrl) {
      try {
        deleteLocalFile(uploadedFileUrl);
      } catch {}
    }
    return next(new ApiError(500, err?.message || "Internal Server Error"));
  }
};

// Get All
export const getAllGallery = async (req, res, next) => {
  try {
    const galleries = await Gallery.find().sort({ createdAt: -1 });
    if (!galleries.length) {
      return next(new ApiError(404, "No Gallery items found"));
    }

    const sanitized = galleries.map((g) => {
      const obj = g.toObject();
      if (obj.image?.public_id) {
        const { public_id, ...img } = obj.image;
        obj.image = img;
      }
      return obj;
    });

    return res.api(200, "Gallery items fetched successfully", sanitized);
  } catch (err) {
    return next(new ApiError(500, err?.message || "Internal Server Error"));
  }
};

// Get By ID
export const getGalleryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid Gallery ID format"));
    }

    const gallery = await Gallery.findById(id);
    if (!gallery) return next(new ApiError(404, "Gallery item not found"));

    const obj = gallery.toObject();
    if (obj.image?.public_id) {
      const { public_id, ...img } = obj.image;
      obj.image = img;
    }

    return res.api(200, "Gallery item fetched successfully", obj);
  } catch (err) {
    return next(new ApiError(500, err?.message || "Internal Server Error"));
  }
};

// Delete
export const deleteGallery = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid Gallery ID format"));
    }

    const gallery = await Gallery.findByIdAndDelete(id);
    if (!gallery) return next(new ApiError(404, "Gallery item not found"));

    if (gallery.image?.public_id) {
      try {
        await deleteFile(gallery.image.public_id);
      } catch {}
    }
    if (gallery.image?.url) {
      try {
        deleteLocalFile(gallery.image.url);
      } catch {}
    }

    return res.api(200, "Gallery item deleted successfully");
  } catch (err) {
    return next(new ApiError(500, err?.message || "Internal Server Error"));
  }
};
