import mongoose from "mongoose";
import  Team  from "../models/team.model.js";
import ApiError from "../utils/ApiError.js";
import {
  deleteFile,
  deleteLocalFile,
  uploadFiles,
} from "../utils/cloudinary.js";

// Create Team
export const createTeam = async (req, res, next) => {
  let uploadedFileId = null;
  let uploadedFileUrl = null;

  try {
    const { name } = req.body;

    if (!name) {
      if (req.file?.path) deleteLocalFile(req.file.path);
      return next(new ApiError(400, "Name is required"));
    }
    if (!req.file) {
      return next(new ApiError(400, "Team Image is required"));
    }

    const existedTeam = await Team.findOne({ name });
    if (existedTeam) {
      if (req.file?.path) deleteLocalFile(req.file.path);
      return next(new ApiError(400, "Team member already exists"));
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

    const newTeam = new Team({
      image: {
        url: result.files[0].url || null,
        public_url: result.files[0].public_url || null,
        public_id: result.files[0].public_id || null,
      },
      ...req.body,
    });

    const savedTeam = await newTeam.save();
    const { public_id, ...imageWithoutId } = savedTeam.image.toObject();
    const responseData = {
      ...savedTeam.toObject(),
      image: imageWithoutId,
    };

    return res.api(201, "Team member saved successfully", responseData);
  } catch (err) {
    // rollback
    if (uploadedFileId) {
      try {
        await deleteFile(uploadedFileId);
      } catch (cleanupErr) {
        console.error("Failed to cleanup uploaded file from Cloudinary:", cleanupErr);
      }
    }
    if (uploadedFileUrl) {
      try {
        deleteLocalFile(uploadedFileUrl);
      } catch (cleanupErr) {
        console.error("Failed to cleanup uploaded file from Local Server:", cleanupErr);
      }
    }
    return next(new ApiError(500, err?.message || "Internal Server Error"));
  }
};

// Get All Teams
export const getAllTeam = async (req, res, next) => {
  try {
    const teams = await Team.find().sort({ createdAt: -1 });
    if (teams?.length === 0) {
      return next(new ApiError(404, "No team members found"));
    }

    const sanitizedTeams = teams.map((team) => {
      const teamObj = team.toObject();
      if (teamObj.image?.public_id) {
        const { public_id, ...imageWithoutId } = teamObj.image;
        teamObj.image = imageWithoutId;
      }
      return teamObj;
    });

    return res.api(200, "Team members fetched successfully", sanitizedTeams);
  } catch (err) {
    return next(new ApiError(500, err?.message || "Internal Server Error"));
  }
};

// Get Team by ID
export const getTeamById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return next(new ApiError(400, "Please provide Team ID"));

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid Team ID format"));
    }

    const team = await Team.findById(id);
    if (!team) return next(new ApiError(404, "Team member not found"));

    const teamObj = team.toObject();
    if (teamObj.image?.public_id) {
      const { public_id, ...imageWithoutId } = teamObj.image;
      teamObj.image = imageWithoutId;
    }

    return res.api(200, "Team member fetched successfully", teamObj);
  } catch (err) {
    return next(new ApiError(500, err.message || "Internal Server Error"));
  }
};

// Update Team
export const updateTeam = async (req, res, next) => {
  let uploadedFileId = null;
  let uploadedFileUrl = null;

  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid Team ID format"));
    }

    const team = await Team.findById(id);
    if (!team) return next(new ApiError(404, "Team member not found"));

    const updateData = {
      name: req.body.name || team.name,
      designation: req.body.designation || team.designation,
      department: req.body.department || team.department,
      description: req.body.description || team.description,
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

    const updatedTeam = await Team.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedTeam) {
      if (uploadedFileId) await deleteFile(uploadedFileId);
      if (uploadedFileUrl) deleteLocalFile(uploadedFileUrl);
      return next(new ApiError(500, "Failed to update team member"));
    }

    // Cleanup old image if new uploaded
    if (req.file) {
      if (team.image?.public_id) await deleteFile(team.image.public_id);
      if (team.image?.url) deleteLocalFile(team.image.url);
    }

    const { public_id, ...imageWithoutId } = updatedTeam.image.toObject();
    const responseData = {
      ...updatedTeam.toObject(),
      image: imageWithoutId,
    };

    return res.api(200, "Team member updated successfully", responseData);
  } catch (err) {
    if (uploadedFileId) {
      try {
        await deleteFile(uploadedFileId);
      } catch (cleanupErr) {
        console.error("Failed to cleanup uploaded file from Cloudinary:", cleanupErr);
      }
    }
    if (uploadedFileUrl) {
      try {
        deleteLocalFile(uploadedFileUrl);
      } catch (cleanupErr) {
        console.error("Failed to cleanup uploaded file from Local Server:", cleanupErr);
      }
    }

    return next(new ApiError(500, err.message || "Internal Server Error"));
  }
};

// Delete Team
export const deleteTeamById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid Team ID format"));
    }

    const team = await Team.findByIdAndDelete(id);
    if (!team) return next(new ApiError(404, "Team member not found"));

    if (team.image?.public_id) {
      try {
        await deleteFile(team.image.public_id);
      } catch (cleanupErr) {
        console.error("Failed to cleanup cloudinary image:", cleanupErr);
      }
    }
    if (team.image?.url) {
      try {
        deleteLocalFile(team.image.url);
      } catch (cleanupErr) {
        console.error("Failed to cleanup local image:", cleanupErr);
      }
    }

    return res.api(200, "Team member deleted successfully");
  } catch (err) {
    return next(new ApiError(500, err.message || "Internal Server Error"));
  }
};
