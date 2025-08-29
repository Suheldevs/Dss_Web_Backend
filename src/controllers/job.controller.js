import mongoose from "mongoose";
import  Job  from "../models/job.model.js";
import ApiError from "../utils/ApiError.js";
import {
  deleteFile,
  deleteLocalFile,
  uploadFiles,
} from "../utils/cloudinary.js";


export const createJob = async (req, res, next) => {
  let uploadedFileId = null;
  let uploadedFileUrl = null;
  try {
    const { fullName, email, phone, jobProfile } = req.body;

    if (!fullName || !email || !phone || !jobProfile) {
      if (req.file?.path) deleteLocalFile(req.file.path);
      return next(new ApiError(400, "All fields are required"));
    }
    if (!req.file) {
      return next(new ApiError(400, "Resume file is required"));
    }

    let result = null;
    if (process.env.USE_CLOUDINARY === "true") {
      result = await uploadFiles([req.file]);
      if (!result.success || !result.files[0].public_url) {
        return next(new ApiError(400, "Unable to upload resume"));
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

    const newJob = new Job({
      fullName,
      email,
      phone,
      jobProfile,
      resume: {
        url: result.files[0].url || null,
        public_url: result.files[0].public_url || null,
        public_id: result.files[0].public_id || null,
      },
    });

    const savedJob = await newJob.save();
    const { public_id, ...resumeWithoutId } = savedJob.resume.toObject();

    return res.api(201, "Job application submitted successfully", {
      ...savedJob.toObject(),
      resume: resumeWithoutId,
    });
  } catch (err) {
    console.log(err)
    // Rollback uploaded file
    if (uploadedFileId) await deleteFile(uploadedFileId);
    if (uploadedFileUrl) deleteLocalFile(uploadedFileUrl);

    return next(new ApiError(500, err?.message || "Internal Server Error"));
  }
};

// Get All Jobs
export const getAllJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    if (!jobs.length) return next(new ApiError(404, "No job applications found"));

    const sanitized = jobs.map((job) => {
      const jobObj = job.toObject();
      if (jobObj.resume?.public_id) {
        const { public_id, ...resumeWithoutId } = jobObj.resume;
        jobObj.resume = resumeWithoutId;
      }
      return jobObj;
    });

    return res.api(200, "Jobs fetched successfully", sanitized);
  } catch (err) {
    return next(new ApiError(500, err.message || "Internal Server Error"));
  }
};

// Get Job By ID
export const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return next(new ApiError(400, "Invalid Job ID"));

    const job = await Job.findById(id);
    if (!job) return next(new ApiError(404, "Job not found"));

    const jobObj = job.toObject();
    if (jobObj.resume?.public_id) {
      const { public_id, ...resumeWithoutId } = jobObj.resume;
      jobObj.resume = resumeWithoutId;
    }

    return res.api(200, "Job fetched successfully", jobObj);
  } catch (err) {
    return next(new ApiError(500, err.message || "Internal Server Error"));
  }
};

// Delete Job
export const deleteJobById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return next(new ApiError(400, "Invalid Job ID"));

    const job = await Job.findByIdAndDelete(id);
    if (!job) return next(new ApiError(404, "Job not found"));

    if (job.resume?.public_id) await deleteFile(job.resume.public_id);
    if (job.resume?.url) deleteLocalFile(job.resume.url);

    return res.api(200, "Job deleted successfully");
  } catch (err) {
    return next(new ApiError(500, err.message || "Internal Server Error"));
  }
};
