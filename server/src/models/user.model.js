import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
      trim: true,
    },
    mobileNumber: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    avatar: {
      // avatar image url will come from cloudinary
      type: String,
    },
    password: {
      type: String,
      required: function () {
        return this.authProvider === "local";
      },
      default: null,
    },
    refreshToken: {
      type: String,
    },
    googleId: {
      type: String,
      default: null,
      sparse: true, // Create a unique index ONLY for documents where this field exists
    },
    githubId: {
      type: String,
      default: null,
      sparse: true,
    },
    authProvider: {
      type: String,
      enum: ["local", "google", "github"],
      default: "local",
    },
  },
  { timestamps: true }
);

// userSchema.set("strictQuery", true);

// Hash password (ONLY for local users)
userSchema.pre("save", async function () {
  if (this.authProvider !== "local") return;

  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

// function for compairing password
userSchema.methods.isPasswordCorrect = async function (inPassword) {
  return await bcrypt.compare(inPassword.toString(), this.password);
};

// access token generation
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      fullName: this.fullName,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// refresh token generation
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

const User = mongoose.model("User", userSchema);
export default User;
