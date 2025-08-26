import mongoose from "mongoose";
import { Blog } from "../models/blog.model.js";
import ApiError from "../utils/ApiError.js";
import {
  deleteFile,
  deleteLocalFile,
  uploadFiles,
} from "../utils/cloudinary.js";

export const createBlog = async (req, res, next) => {
  let uploadedFileId = null;
  let uploadedFileUrl = null;
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      if (req.file?.path) deleteLocalFile(req.file.path);
      return next(new ApiError(400, "Title and description is required"));
    }
    if (!req.file) {
      return next(new ApiError(400, "Blog Image is required"));
    }
    const existedBlog = await Blog.findOne({ title });
    if (existedBlog) {
      if (req.file?.path) deleteLocalFile(req.file.path);
      return next(new ApiError(400, "Blog Already Existed"));
    }
    let result = null;
    if (process.env.USE_CLOUDINARY === "true") {
      result = await uploadFiles([req.file]);
      if (!result.success || !result.files[0].public_url) {
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
    const newBlog = new Blog({
      image: {
        url: result.files[0].url || null,
        public_url: result.files[0].public_url || null,
        public_id: result.files[0].public_id || null,
      },
      ...req.body,
    });
    const savedBlog = await newBlog.save();
    const { public_id, ...imageWithoutId } = savedBlog.image.toObject();
    const responseData = {
      ...savedBlog.toObject(),
      image: imageWithoutId,
    };
    return res.api(201, "Blog Saved Successfully", responseData);
  } catch (err) {
    //rollback
    if (uploadedFileId) {
      try {
        await deleteFile(uploadedFileId);
      } catch (cleanupErr) {
        console.error(
          "Failed to cleanup uploaded file from Cludinary:",
          cleanupErr
        );
      }
    }
    if (uploadedFileUrl) {
      try {
        deleteLocalFile(uploadedFileUrl);
      } catch (cleanupErr) {
        console.error(
          "Failed to cleanup uploaded file from Local Server:",
          cleanupErr
        );
      }
    }
    return next(new ApiError(500, err?.message || "Internal Server Error"));
  }
};

export const getAllBlog = async (req, res, next) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    if (blogs?.length === 0) {
      return next(new ApiError(400, "Blog not found"));
    }
    const sanitizedBlogs = blogs.map((blog) => {
      const blogObj = blog.toObject();
      if (blogObj.image?.public_id) {
        const { public_id, ...imageWithoutId } = blogObj.image;
        blogObj.image = imageWithoutId;
      }
      return blogObj;
    });
    return res.api(200, "Blogs fetched successfully", sanitizedBlogs);
  } catch (err) {
    return next(new ApiError(500, err?.message || "Internal Server Error"));
  }
};

export const getBlogById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(new ApiError(400, "Please provide Blog ID"));
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid Blog ID format"));
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return next(new ApiError(404, "Blog not found"));
    }

    const blogObj = blog.toObject();
    if (blogObj.image?.public_id) {
      const { public_id, ...imageWithoutId } = blogObj.image;
      blogObj.image = imageWithoutId;
    }

    return res.api(200, "Blog fetched successfully", blogObj);
  } catch (err) {
    return next(new ApiError(500, err.message || "Internal Server Error"));
  }
};

export const updateBlog = async (req, res, next) => {
  let uploadedFileId = null;
  let uploadedFileUrl = null;

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid Blog ID format"));
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return next(new ApiError(404, "Blog not found"));
    }
    const updateData = {
      title: req.body.title || blog.title,
      description: req.body.description || blog.description,
      category: req.body.category || blog.category,
      tags: req.body.tags || blog.tags,
    };

    if (req.file) {
      let result = null;

      if (process.env.USE_CLOUDINARY === "true") {
        result = await uploadFiles([req.file]);
        if (!result.success || !result.files[0].public_url) {
          return next(new ApiError(400, "Unable to upload new image"));
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

      updateData.image = {
        url: result.files[0].url || null,
        public_url: result.files[0].public_url || null,
        public_id: result.files[0].public_id || null,
      };
    }

    const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedBlog) {
      if (uploadedFileId) await deleteFile(uploadedFileId);
      if (uploadedFileUrl) deleteLocalFile(uploadedFileUrl);
      return next(new ApiError(500, "Failed to update blog"));
    }

    if (req.file) {
      if (blog.image?.public_id) await deleteFile(blog.image.public_id);
      if (blog.image?.url) deleteLocalFile(blog.image.url);
    }

    const { public_id, ...imageWithoutId } = updatedBlog.image.toObject();
    const responseData = {
      ...updatedBlog.toObject(),
      image: imageWithoutId,
    };

    return res.api(200, "Blog updated successfully", responseData);
  } catch (err) {
    if (uploadedFileId) {
      try {
        await deleteFile(uploadedFileId);
      } catch (cleanupErr) {
        console.error(
          "Failed to cleanup uploaded file from Cloudinary:",
          cleanupErr
        );
      }
    }
    if (uploadedFileUrl) {
      try {
        deleteLocalFile(uploadedFileUrl);
      } catch (cleanupErr) {
        console.error(
          "Failed to cleanup uploaded file from Local Server:",
          cleanupErr
        );
      }
    }
console.log(err)
    return next(new ApiError(500, err.message || "Internal Server Error"));
  }
};


export const deleteBlogById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid Blog ID format"));
    }

    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      return next(new ApiError(404, "Blog not found"));
    }
    if (blog.image?.public_id) {
      try {
        await deleteFile(blog.image.public_id);
      } catch (cleanupErr) {
        console.error("Failed to cleanup cloudinary image:", cleanupErr);
      }
    }
    if (blog.image?.url) {
      try {
        deleteLocalFile(blog.image.url);
      } catch (cleanupErr) {
        console.error("Failed to cleanup local image:", cleanupErr);
      }
    }

    return res.api(200, "Blog deleted successfully");
  } catch (err) {
    return next(new ApiError(500, err.message || "Internal Server Error"));
  }
};

