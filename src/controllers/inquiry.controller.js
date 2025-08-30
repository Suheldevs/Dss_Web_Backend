import Inquiry from "../models/inquiry.model.js";
import ApiError from "../utils/ApiError.js";
import {
  uploadFiles,
  deleteFile,
  deleteLocalFile,
} from "../utils/cloudinary.js";
import sendMail from "../utils/sendMail.js";

// 👉 Create Inquiry
export const createInquiry = async (req, res, next) => {
  let uploadedFileIds = [];
  let uploadedFileUrls = [];

  try {
    const { name, email, phone, companyName, requirement, message } = req.body;

    if (!name || !phone || !requirement) {
      if (req.files) req.files.forEach((file) => deleteLocalFile(file.path));
      return next(
        new ApiError(400, "Name, phone, and requirement are required")
      );
    }

    let result = null;
    if (process.env.USE_CLOUDINARY === "true") {
      result = await uploadFiles(req.files || []);
      if (!result.success) {
        return next(new ApiError(400, "Unable to upload site photos"));
      }
    } else {
      result = {
        success: true,
        files: (req.files || []).map((file) => ({
          url: file.path.replace(/\\/g, "/"),
          public_url: null,
          public_id: null,
        })),
      };
    }

    uploadedFileIds = result.files.map((f) => f.public_id).filter(Boolean);
    uploadedFileUrls = result.files.map((f) => f.url).filter(Boolean);

    const newInquiry = new Inquiry({
      name,
      email,
      phone,
      companyName,
      requirement,
      message,
      sitePhotos: result.files.map((f) => ({
        url: f?.url || null,
        public_url: f?.public_url || null,
        public_id: f?.public_id || null,
      })),
    });

    const savedInquiry = await newInquiry.save();

    try {
      emailContent = {
        to: email,
        subject: "New Inquiry From Website",
        html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; background: #f9f9f9;">
      <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; border: 1px solid #e5e5e5; overflow: hidden;">
        
        <!-- Header -->
        <div style="background: linear-gradient(90deg, #0073e6, #28a745); padding: 16px; text-align: center; color: #fff;">
          <h2 style="margin: 0;">New Inquiry Received</h2>
          <p style="margin: 4px 0 0;">via <a href="https://www.dssup.co.in/" target="_blank" style="color: #fff; text-decoration: underline;">www.dssup.co.in</a></p>
        </div>

        <!-- Body -->
        <div style="padding: 20px;">
          <p style="margin: 0 0 12px;">Dear Director,</p>
          <p style="margin: 0 0 20px;">You have received a new inquiry from the website. Here are the details:</p>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; background: #f3f9ff; width: 30%;"><strong>Name</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; background: #f3f9ff;"><strong>Email</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; background: #f3f9ff;"><strong>Phone</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${phone}</td>
            </tr>
            ${
              companyName
                ? `<tr><td style="padding: 10px; border: 1px solid #ddd; background: #f3f9ff;"><strong>Company Name</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${companyName}</td></tr>`
                : ""
            }
            ${
              requirement
                ? `<tr><td style="padding: 10px; border: 1px solid #ddd; background: #f3f9ff;"><strong>Requirement</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${requirement}</td></tr>`
                : ""
            }
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; background: #f3f9ff;"><strong>Message</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${message}</td>
            </tr>
            ${
              sitePhotos && sitePhotos.length > 0
                ? `<tr><td style="padding: 10px; border: 1px solid #ddd; background: #f3f9ff;"><strong>Site Photos</strong></td>
                     <td style="padding: 10px; border: 1px solid #ddd;">
                       ${sitePhotos.map((f) => `<a href="${f?.url || f?.public_url}" target="_blank" style="display:block; color:#0073e6;">${f?.url || f?.public_url}</a>`).join("")}
                     </td>
                   </tr>`
                : ""
            }
          </table>

          <p style="margin-top: 20px;">Please respond to this inquiry at your earliest convenience.</p>
        </div>

        <!-- Footer -->
        <div style="background: #f3f9ff; padding: 15px; text-align: center; font-size: 13px; color: #555;">
          <strong>DSSUP - Digital Signage Solutions</strong><br/>
          <a href="https://www.dssup.co.in/" target="_blank" style="color: #0073e6; text-decoration: none;">www.dssup.co.in</a>
        </div>
      </div>
    </div>
  `,
      };

      sendMail(emailContent);
    } catch (err) {
      console.log(err);
    }
    // Remove public_id from response
    const sitePhotosWithoutId = savedInquiry.sitePhotos.map((photo) =>
      photo.toObject ? photo.toObject() : photo
    );

    const responseData = {
      ...savedInquiry.toObject(),
      sitePhotos: sitePhotosWithoutId.map(({ public_id, ...rest }) => rest),
    };

    return res.status(201).json({
      status: "success",
      message: "Inquiry created successfully",
      data: responseData,
    });
  } catch (err) {
    for (const fileId of uploadedFileIds) {
      try {
        await deleteFile(fileId);
      } catch (e) {
        console.error(e);
      }
    }
    for (const fileUrl of uploadedFileUrls) {
      try {
        deleteLocalFile(fileUrl);
      } catch (e) {
        console.error(e);
      }
    }
    return next(new ApiError(500, err?.message || "Internal Server Error"));
  }
};

// Get All Inquiries
export const getAllInquiries = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });

    const responseData = inquiries.map((inquiry) => {
      const sitePhotosWithoutId = inquiry.sitePhotos.map((photo) =>
        photo.toObject ? photo.toObject() : photo
      );
      return {
        ...inquiry.toObject(),
        sitePhotos: sitePhotosWithoutId.map(({ public_id, ...rest }) => rest),
      };
    });

    return res.status(200).json({
      status: "success",
      results: responseData.length,
      data: responseData,
    });
  } catch (err) {
    return next(new ApiError(500, err?.message || "Internal Server Error"));
  }
};

// Delete Inquiry by ID
export const deleteInquiryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      return next(new ApiError(404, "Inquiry not found"));
    }

    if (process.env.USE_CLOUDINARY === "true") {
      for (const photo of inquiry.sitePhotos) {
        if (photo.public_id) {
          try {
            await deleteFile(photo.public_id);
          } catch (e) {
            console.error(e);
          }
        }
      }
    } else {
      for (const photo of inquiry.sitePhotos) {
        if (photo.url) {
          try {
            deleteLocalFile(photo.url);
          } catch (e) {
            console.error(e);
          }
        }
      }
    }

    await Inquiry.findByIdAndDelete(id);

    return res.status(200).json({
      status: "success",
      message: "Inquiry deleted successfully",
    });
  } catch (err) {
    return next(new ApiError(500, err?.message || "Internal Server Error"));
  }
};
