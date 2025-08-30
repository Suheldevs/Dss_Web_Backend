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

    if (!name || !email || !message) {
      if (req.files) req.files.forEach((file) => deleteLocalFile(file.path));
      return next(
        new ApiError(400, "Name, email, and message are required")
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
const sitePhotos = result.files.map((f) => ({
        url: f?.url || null,
        public_url: f?.public_url || null,
        public_id: f?.public_id || null,
      }))

    const newInquiry = new Inquiry({
      name,
      email,
      phone,
      companyName,
      requirement,
      message,
      sitePhotos,
    });

    const savedInquiry = await newInquiry.save();

    try {
const emailContent = {
  to: "suhel.codecrafter@gmail.com",
  subject: "New Inquiry From Website",
  html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Inquiry</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
          
          <!-- Main Container -->
          <div style="width: 100%; max-width: 650px; margin: 20px auto; background: #ffffff; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden;">
            
            <!-- Header Section -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; position: relative;">
              <div style="position: relative; z-index: 2;">
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">✉️ New Inquiry Received</h1>
                <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                  via <a href="https://www.dssup.co.in/" target="_blank" style="color: #ffffff; text-decoration: none; font-weight: 600; border-bottom: 2px solid rgba(255,255,255,0.5);">www.dssup.co.in</a>
                </p>
              </div>
            </div>

            <!-- Content Section -->
            <div style="padding: 30px 20px;">
              
              <!-- Greeting -->
              <div style="margin-bottom: 25px;">
                <h3 style="margin: 0 0 8px; color: #2d3748; font-size: 18px; font-weight: 600;">👋 Dear Director,</h3>
                <p style="margin: 0; color: #4a5568; font-size: 16px; line-height: 1.5;">
                  You have received a new inquiry from your website. Here are the complete details:
                </p>
              </div>

              <!-- Details Card -->
              <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 12px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #667eea;">
                
                <!-- Responsive Table Container -->
                <div style="overflow-x: auto; -webkit-overflow-scrolling: touch;">
                  <table style="width: 100%; min-width: 400px; border-collapse: collapse; font-size: 14px; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    
                    <!-- Name Row -->
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                      <td style="padding: 15px 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: 600; width: 35%; min-width: 120px;">
                        <span style="display: inline-flex; align-items: center;">
                          👤 Name
                        </span>
                      </td>
                      <td style="padding: 15px 12px; color: #2d3748; font-weight: 500;">${name}</td>
                    </tr>
                    
                    <!-- Email Row -->
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                      <td style="padding: 15px 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: 600;">
                        <span style="display: inline-flex; align-items: center;">
                          📧 Email
                        </span>
                      </td>
                      <td style="padding: 15px 12px;">
                        <a href="mailto:${email}" style="color: #667eea; text-decoration: none; font-weight: 500;">${email}</a>
                      </td>
                    </tr>
                    
                    <!-- Phone Row -->
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                      <td style="padding: 15px 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: 600;">
                        <span style="display: inline-flex; align-items: center;">
                          📱 Phone
                        </span>
                      </td>
                      <td style="padding: 15px 12px;">
                        <a href="tel:${phone}" style="color: #667eea; text-decoration: none; font-weight: 500;">${phone}</a>
                      </td>
                    </tr>
                    
                    ${companyName ? `
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                      <td style="padding: 15px 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: 600;">
                        <span style="display: inline-flex; align-items: center;">
                          🏢 Company
                        </span>
                      </td>
                      <td style="padding: 15px 12px; color: #2d3748; font-weight: 500;">${companyName}</td>
                    </tr>
                    ` : ''}
                    
                    ${requirement ? `
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                      <td style="padding: 15px 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: 600;">
                        <span style="display: inline-flex; align-items: center;">
                          📋 Requirement
                        </span>
                      </td>
                      <td style="padding: 15px 12px;">
                        <span style="background: #667eea; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">${requirement}</span>
                      </td>
                    </tr>
                    ` : ''}
                    
                    <!-- Message Row -->
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                      <td style="padding: 15px 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: 600; vertical-align: top;">
                        <span style="display: inline-flex; align-items: center;">
                          💬 Message
                        </span>
                      </td>
                      <td style="padding: 15px 12px; color: #2d3748; line-height: 1.6;">${message}</td>
                    </tr>
                    
                    ${sitePhotos && sitePhotos.length > 0 ? `
                    <tr>
                      <td style="padding: 15px 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: 600; vertical-align: top;">
                        <span style="display: inline-flex; align-items: center;">
                          📎 Attachments
                        </span>
                      </td>
                      <td style="padding: 15px 12px;">
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                          ${sitePhotos.map((f, index) => `
                            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; display: flex; align-items: center; justify-content: space-between;">
                              <span style="color: #4a5568; font-size: 13px; flex: 1; word-break: break-all;">📁 ${f.originalname || 'Attachment ' + (index + 1)}</span>
                              <a href="${f?.public_url || f?.url || '#'}" target="_blank" style="background: #667eea; color: white; padding: 4px 8px; border-radius: 4px; text-decoration: none; font-size: 11px; font-weight: 600; margin-left: 8px;">View</a>
                            </div>
                          `).join('')}
                        </div>
                      </td>
                    </tr>
                    ` : ''}
                    
                  </table>
                </div>
              </div>

              <!-- Call to Action -->
              <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 25px; border: 1px solid #e2e8f0;">
                <p style="margin: 0 0 12px; color: #2d3748; font-size: 16px; font-weight: 600;">⚡ Quick Actions</p>
                <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 15px;">
                  <a href="mailto:${email}" style="background: #667eea; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 13px; display: inline-flex; align-items: center;">
                    📧 Reply via Email
                  </a>
                  <a href="tel:${phone}" style="background: #28a745; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 13px; display: inline-flex; align-items: center;">
                    📞 Call Now
                  </a>
                </div>
              </div>

              <!-- Footer Message -->
              <div style="text-align: center; color: #4a5568; font-size: 14px; line-height: 1.5;">
                <p style="margin: 0 0 8px;">Please respond to this inquiry as soon as possible to maintain customer satisfaction.</p>
                <p style="margin: 0; font-weight: 600; color: #2d3748;">Thank you for your prompt attention! 🚀</p>
              </div>
            </div>

            <!-- Signature Footer -->
            <div style="background: #f8fafc; padding: 20px; border-top: 1px solid #e2e8f0;">
              <div style="text-align: center; color: #4a5568; font-size: 13px; line-height: 1.4;">
                <p style="margin: 0 0 8px; font-weight: 600; color: #2d3748;">Best Regards,</p>
                <p style="margin: 0 0 4px; font-weight: 700; color: #667eea; font-size: 15px;">Code Crafter Web Solutions</p>
                <div style="margin: 8px 0; display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
                  <span style="color: #4a5568;">📱 <strong>P:</strong> +91 9336969289</span>
                  <span style="color: #4a5568;">🏢 <strong>O:</strong> +91 8840700176</span>
                </div>
                <p style="margin: 4px 0 0;">
                  🌐 <a href="https://codecrafter.co.in/" target="_blank" style="color: #667eea; text-decoration: none; font-weight: 600;">https://codecrafter.co.in/</a>
                </p>
              </div>
            </div>

          </div>

        </body>
        </html>
      `,
}

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
