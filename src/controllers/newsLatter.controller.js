import  Newsletter  from "../models/newsletter.model.js";
import sendMail from "../utils/sendMail.js";
import ApiError from "../utils/ApiError.js";


export const sendBulkEmail = async (req, res, next) => {
  try {
    const { subject, html , subscriberStatus } = req.body;

    if (!subject || !html || !subscriberStatus) {
      return next(new ApiError(400, "Subject and content are required"));
    }
    let subscribers = [] ;
    if(subscriberStatus == "active"){
      subscribers = await Newsletter.find({ isActive: true }).select("email");
    }
    if(subscriberStatus == "inactive"){
      subscribers = await Newsletter.find({ isActive: false }).select("email");
    }
    if(subscriberStatus == "all"){
      subscribers = await Newsletter.find().select("email");
    }

    if (!subscribers.length) {
      return next(new ApiError(404, "No active subscribers found"));
    }

    const emailList = subscribers.map(sub => sub.email);

    const success = await sendMail({
      to: emailList, 
      subject,
      html,
    });

    if (!success) {
      return next(new ApiError(500, "Failed to send bulk email"));
    }

    return res.status(200).json({
      status: "success",
      message: `Bulk email sent to ${emailList.length} subscribers`,
    });

  } catch (error) {
    console.error(error);
    return next(new ApiError(500, error.message || "Internal Server Error"));
  }
};


export const subscribeEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new ApiError(400, "Email is required"));
    }


    const existing = await Newsletter.findOne({ email });
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        const res = await existing.save();
        console.log(res)
        return res.api(200,  "You have re-subscribed successfully")
      }
      return next(new ApiError(400, "Email is already subscribed"));
    }

    const newSubscriber = new Newsletter({ email });
    await newSubscriber.save();
    return res.api(201, "Subscribed successfully", { email: newSubscriber.email })

  } catch (error) {
    console.error(error);
    return next(new ApiError(500, error.message || "Internal Server Error"));
  }
};


export const getAllSubscribers = async (req, res, next) => {
  try {
    const subscribers = await Newsletter.find().sort({ createdAt: -1 });

    console.log(subscribers)
    return res.api(200 , "Success Fetch all email" , subscribers)

  } catch (error) {
    console.error(error);
    return next(new ApiError(500, error.message || "Internal Server Error"));
  }
};


export const deleteSubscriber = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subscriber = await Newsletter.findById(id);
    if (!subscriber) {
      return next(new ApiError(404, "Subscriber not found"));
    }

    await Newsletter.findByIdAndDelete(id);

    return res.api(200, "Subscriber deleted successfully");
  } catch (error) {
    console.error(error);
    return next(new ApiError(500, error.message || "Internal Server Error"));
  }
};

export const toggleSubscriberStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subscriber = await Newsletter.findById(id);
    if (!subscriber) {
      return next(new ApiError(404, "Subscriber not found"));
    }

    subscriber.isActive = !subscriber.isActive;
    await subscriber.save();

    return res.api(200, "Subscriber status updated", {
      id: subscriber._id,
      isActive: subscriber.isActive,
      email: subscriber.email,
    });
  } catch (error) {
    console.error(error);
    return next(new ApiError(500, error.message || "Internal Server Error"));
  }
};