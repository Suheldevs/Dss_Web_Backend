import { ApiError } from "../utils/ApiError.js";
import { isValidEmail } from "../utils/validators.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
//user signin
export const createUser = async (req, res, next) => {
  try {
    const { email, password, fullname, username, avatar } = req.body;
    if (!email || !password || !fullname) {
      return next(
        new ApiError(400, "Please Enter a Valid Email, Password and full name")
      );
    }
    if (!isValidEmail(email)) {
      return next(new ApiError(400, "Please enter a valid email address"));
    }
    const userExited = await User.findOne({ email });
    if (userExited) {
      return next(new ApiError(400, "User already existed"));
    }
    const newUser = new User(req.body);
    const user = await newUser.save();
    return res.api(201, user, "User created successfully !!");
  } catch (err) {
    return next(new ApiError(500, err.message));
  }
};

//user sign in

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password || !isValidEmail(email)) {
      return next(new ApiError(400, "Enter a valid email or password"));
    }
    const user = await User.findOne({ email });
    if (!user) {
      return next(new ApiError(400, "user not found"));
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return next(new ApiError(401, "Incorrect email or password"));
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });
    console.log(process.env.NODE_ENV);
    const cookieOptions = {
      httpOnly: process.env.NODE_ENV === "production",
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 300000,
    };
    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 5 * 60 * 1000,
    }); // 5 min
    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }); // 7 day
    return res.api(200, "Login successful", {
      user: {
        _id: user._id,
        email: user.email,
        fullname: user.fullname,
        username: user.username,
        avatar: user.avatar,
      },
      accessToken,
    });
  } catch (err) {
    return next(new ApiError(500, "Internal server errror!!"));
  }
};
