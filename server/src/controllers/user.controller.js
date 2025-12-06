import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error(
      "somthing went worng while generating access and refresh token"
    );
  }
};
const regesterUser = async (req, res) => {
  try {
    // take input from body
    const { fullName, email, mobileNumber, gender, password } = req.body;

    // validate comming input
    if (!fullName || !email || !mobileNumber || !gender || !password) {
      return res.status(404).json({
        success: false,
        message: "Please provide all the required field",
      });
    }

    //check gender match or not
    if (!["Male", "Female", "Other"].includes(gender)) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid gender",
      });
    }

    // check if user already exist with that email if not than create user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "user already exist with this email",
      });
    }

    // creating user if already not exist
    const user = await User.create({
      fullName,
      email,
      mobileNumber,
      gender,
      password,
    });

    // remove sensitive data from created user
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      return res.status(500).json({
        success: false,
        message: "Something went wrong.",
      });
    }

    // return success response
    return res.status(201).json({
      success: true,
      message: "User created successfully !!",
      createdUser,
    });
  } catch (error) {
    console.error("Error in register User :", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error !!",
    });
  }
};
const login = async (req, res) => {
  try {
    // take email and password as input
    const { email, password } = req.body;

    // validate input
    if (!email || !password) {
      return res.status(404).json({
        success: false,
        message: "Email or Password is missing .",
      });
    }

    // find user with this email if dosen't exist give error
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User dosn't exist with this email",
      });
    }

    // if user exist with email check password is correct or not
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Please provide valid password  !!",
      });
    }

    // generate access and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    // find user with id and remove refresh and access token
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    // cookie options
    const accessTokenOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 5 * 60 * 1000, // 5 minutes
    };

    const refreshTokenOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    // return success response
    return res
      .status(200)
      .cookie("accessToken", accessToken, accessTokenOptions)
      .cookie("refreshToken", refreshToken, refreshTokenOptions)
      .json({
        success: true,
        message: "User loged in successfully !!",
        loggedInUser,
        accessToken
      });
  } catch (error) {
    console.error("Error in login User :", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error !!",
    });
  }
};
const changePassword = async (req, res) => {
  try {
    // take input from body
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.userId; // comming from middleware 

    // validate comming input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(404).json({
        success: false,
        message: "Please provide all the required field.",
      });
    }

    // user id from middleware
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access !!",
      });
    }

    // check that newPassword and confirmPassword is equal or not
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "new Password is not equal to confirm password ",
      });
    }
    // find user with userId using middleware
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found with user id",
      });
    }
    // check current password is good or not
    const isPasswordValid = await user.isPasswordCorrect(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is invalid !!",
      });
    }
    // if current password is correct than update the password
    user.password = newPassword;
    await user.save({validateBeforeSave:false});

    // return success response
    return res.status(200).json({
      success: true,
      message: "Password changed succesfull !!",
    });
  } catch (error) {
    console.error("Error in password changing :", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error !!",
    });
  }
};
const refreshAccessToken = async (req, res) => {

  // token comming from cookies or body
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    return res.status(404).json({
      success: false,
      message: "Unauthorize access",
    });
  }
  try {
    //decoding token with jwt 
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    if (!decodedToken) {
      return res.status(402).json({
        success: false,
        message: "decoded token is not comming",
      });
    }
    // finding user with decoded token
    const user = await User.findById(decodedToken._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid refreshToken",
      });
    }

    // compair saved refreshToken with incomming refresh token
    if (incomingRefreshToken !== user.refreshToken) {
      return res.status(405).json({
        success: false,
        message: "Refresh token is expired or used",
      });
    }
   
    // generating new refresh and access token
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    if(!accessToken || !refreshToken){
      return res.status(400).json({
        success:false,
        message:"Token is not generated"
      })
    }

    // cookie options
    const accessTokenOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 5 * 60 * 1000, // 5 minutes
    };

    const refreshTokenOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken,accessTokenOptions)
      .cookie("refreshToken", refreshToken,refreshTokenOptions)
      .json({
        success: true,
        message: "accessToken is refreshed",
        accessToken,
      });
  } catch (error) {
    console.error("Error in refreshing token :", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error !!",
    });
  }
};
const getUserDetails = async (req, res) => {
  try {
    // comming from middleware
    const userId = req.userId;

    // validate userId
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "userId not found",
      });
    }

    // find user with userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found !!",
      });
    }

    // return success response and user details
    return res.status(200).json({
      success: true,
      message: "user found successfully !!",
      data: {
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        gender: user.gender,
        avatar: user.avatar,
        googleId:user.googleId
      },
    });
  } catch (error) {
    console.error("Error in getting user detail :", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error !!",
    });
  }
};
const logOut = async (req, res) => {
  try {
    // take userId from middleware and give error if its not found
    const userId = req.userId;

    // validate userId
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. SubAdmin ID missing !!",
      });
    }

    // find user with userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found !!",
      });
    }

    // remove refresh token
    user.refreshToken = null;
    await user.save({ validateBeforeSave: false });

    // cookie options
    const accessTokenOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 5 * 60 * 1000, // 5 minutes
    };

    const refreshTokenOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    return res
      .status(200)
      .clearCookie("accessToken", accessTokenOptions)
      .clearCookie("refreshToken", refreshTokenOptions)
      .json({
        success: true,
        message: "User LogedOut successfully !!",
      });
  } catch (error) {
    console.error("Error in logOut user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error !!",
    });
  }
};
const addAvatar = async (req, res) => {
  try {
    const userId = req.userId;  // from middleware

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user !!",
      });
    }

    // multer + cloudinary file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Avatar file is missing",
      });
    }

    // Cloudinary URL
    const avatarUrl = req.file.path;

    // find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with userId",
      });
    }

    // save url
    user.avatar = avatarUrl;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully !!",
      avatarUrl,
    });
  } catch (error) {
    console.error("Error on uploading avatar:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error !!",
    });
  }
};
const updateAvatar = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user !!",
      });
    }

    // new avatar file from multer
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "New avatar file is required",
      });
    }

    const newAvatarUrl = req.file.path;

    // find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found !!",
      });
    }

    // if old avatar exists, delete it from Cloudinary
    if (user.avatar) {
      const publicId = user.avatar.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`NodeBoilerPlate/${publicId}`);
    }

    // save new avatar
    user.avatar = newAvatarUrl;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Avatar updated successfully !!",
      avatarUrl: newAvatarUrl,
    });

  } catch (error) {
    console.error("Error updating avatar:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error !!",
    });
  }
};
const deleteAvatar = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user !!",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found !!",
      });
    }

    if (!user.avatar) {
      return res.status(400).json({
        success: false,
        message: "No avatar exists to delete",
      });
    }

    // extract public id from url
    const publicId = user.avatar.split("/").pop().split(".")[0];

    // delete from cloudinary
    await cloudinary.uploader.destroy(`NodeBoilerPlate/${publicId}`);

    // remove from DB
    user.avatar = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Avatar deleted successfully !!",
    });

  } catch (error) {
    console.error("Error deleting avatar:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error !!",
    });
  }
};
const OAuthCallback = async (req, res) => {
  try {
    // user is added through middleware
    const user = req.user;

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    // remove sensitive fields
    user.password = undefined;

    // cookie options
    const accessTokenOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 5 * 60 * 1000, // 5 minutes
    };

    const refreshTokenOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    // set cookies
    res.cookie("accessToken", accessToken, accessTokenOptions);
    res.cookie("refreshToken", refreshToken, refreshTokenOptions);

    return res.status(200).json({
      success: true,
      message: "OAuth Login Successfull !!",
      user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "OAuth Login Failed !",
      error: err.message,
    });
  }
};



export {
  regesterUser,
  login,
  changePassword,
  refreshAccessToken,
  getUserDetails,
  logOut,
  addAvatar,
  updateAvatar,
  deleteAvatar,
  OAuthCallback
};
