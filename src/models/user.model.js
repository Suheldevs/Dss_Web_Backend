import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        lowecase: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowecase: true,
        trim: true,
    },
    fullname: {
        type: String,
        required: true,
        lowecase: true,
        trim: true,
    },
    avatar: {
        type: String,
        default: ""
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    refreshToken: {
        type: String,
    }
}, { timestamps: true })


userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    this.password = bcrypt.hashSync(this.password, 10)
 if (!this.username) {
    if (this.fullname) {
        let username = this.fullname.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^\w]/g, "");
         username += Math.floor(Math.random() * 1000);
      this.username = username
    } else if (this.email) {
      this.username = this.email.split("@")[0];
    }
  }
    next()
})

userSchema.methods.isPasswordCorrect = async function
    (password) {
   return bcrypt.compareSync(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }

    )
}


userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }

    )
}

export const User = mongoose.model("User", userSchema)