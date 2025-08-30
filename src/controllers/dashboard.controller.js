import {Blog} from "../models/blog.model.js";
import ProjectGallery from "../models/gallery.model.js";
import Product from "../models/product.model.js";
import Team from "../models/team.model.js";
import Inquiry from "../models/inquiry.model.js";
import Visitor from "../models/visitor.model.js";
import Subscriber from "../models/newsletter.model.js";
import Job from "../models/job.model.js";

export const getDashboardData = async (req, res) => {
  try {
    const [
      blogCount,
      projectCount,
      productCount,
      teamCount,
      inquiryCount,
      visitorCount,
      subscriberCount,
      jobCount,
    ] = await Promise.all([
      Blog.countDocuments(),
      ProjectGallery.countDocuments(),
      Product.countDocuments(),
      Team.countDocuments(),
      Inquiry.countDocuments(),
      Visitor.countDocuments(),
      Subscriber.countDocuments(),
      Job.countDocuments(),
    ]);

    const visitorsByMonth = await Visitor.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Subscribers month-wise
    const subscribersByMonth = await Subscriber.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        counts: {
          blogs: blogCount,
          projects: projectCount,
          products: productCount,
          teams: teamCount,
          inquiries: inquiryCount,
          visitors: visitorCount,
          subscribers: subscriberCount,
          jobs: jobCount,
        },
        visitorsByMonth,
        subscribersByMonth,
      },
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
