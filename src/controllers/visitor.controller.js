import Visitor from "../models/visitor.model.js";
import ApiError from "../utils/ApiError.js";


export const createVisitor = async (req, res, next) => {
  try {
    const {
      visitorId,
      city,
      ip,
      region,
      country,
      postal,
      utmSource,
      location,
    } = req.body;

    if (!visitorId) {
      return next(new ApiError(400, "All required fields must be provided"));
    }
    const newVisitor = new Visitor(req.body);

    const savedVisitor = await newVisitor.save();

    return res.api(201 , "Visitor created successfully",savedVisitor )
  } catch (err) {
    return next(new ApiError(500, err?.message || "Internal Server Error"));
  }
};


export const getAllVisitors = async (req, res, next) => {
  try {
    const visitors = await Visitor.find().sort({ createdAt: -1 });
    return res.api(200, "Visitor fectch successfully", visitors)
  } catch (err) {
    return next(new ApiError(500, err?.message || "Internal Server Error"));
  }
};

export const deleteVisitorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const visitor = await Visitor.findById(id);
    if (!visitor) {
      return next(new ApiError(404, "Visitor not found"));
    }

    await Visitor.findByIdAndDelete(id);

    return res.api(200, "Visitor deleted successfully")
  } catch (err) {
    return next(new ApiError(500, err?.message || "Internal Server Error"));
  }
};
