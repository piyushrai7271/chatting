import User from "../models/user.model.js";
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

    // validate input
    if (!fullName || !email || !mobileNumber || !gender || !password) {
      return res.status(404).json({
        success: false,
        message: "Please provide all the required field",
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

    // create user if it doesn't exist
    const user = User({
      fullName,
      email,
      mobileNumber,
      gender,
      password, // password will be hashed before saving with pre hook
    });

    const createdUser = await user.save();

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
        message: "Password is invalid !!",
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

    // if password correct than return create cookie and return user with cookie
    const options = {
        httpOnly : true,
        secure :true
    }

    // return success response
    return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json({
            success:true,
            message:"User loged in successfully !!",
            loggedInUser
        })

  } catch (error) {
    console.error("Error in login User :", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error !!",
    });
  }
};
const changePassword = async(req, res) => {
  try {
    // take input from body
    const {currentPassword,newPassword,confirmPassword} = req.body;
    const userId = req.userId;

    // validate comming input
    if(!currentPassword || !newPassword || !confirmPassword){
        return res.status(404).json({
            success:false,
            message:"Please provide all the required field."
        })
    }
    
    // user id from middleware
    if(!userId){
        return res.status(401).json({
            success:false,
            message:"Unauthorized access !!"
        })
    }

    // check that newPassword and confirmPassword is equal or not
    if(newPassword !== confirmPassword){
        return res.status(400).json({
            success:false,
            message:"new Password is not equal to confirm password "
        })
    }
    // find user with userId using middleware
    const user = await User.findById(userId);
    if(!user){
        return res.status(400).json({
            success:false,
            message:"User not found with user id"
        })
    }
    // check current password is good or not 
    const isPasswordValid = await user.isPasswordCorrect(currentPassword);
    if(!isPasswordValid){
        return res.status(401).json({
            success:false,
            message:"current Password is invalid"
        })
    }
    // if current password is correct than update the password
    user.password = newPassword;
    await user.save()

    // return success response
    return res.status(200).json({
        success:true,
        message:"Password changed succesfull !!"
    })
  } catch (error) {
    console.error("Error in password changing :", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error !!",
    });
  }
};
const refreshAccessToken = async (req,res) =>{

    const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken){
        return res.status(404).json({
            success:false,
            message:"Unauthorize access"
        })
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        if(!decodedToken){
            return res.status(402).json({
                success:false,
                message:"decoded token is not comming"
            })
        }

        const user = await User.findById(decodedToken._id);

        if(user){
            return res.status(404).json({
                success:false,
                message:"Invalid refreshToken"
            })
        }
        if(incomingRefreshToken !== user.refreshToken){
            return res.status(405).json({
                success:false,
                message:"Refresh token is expired or used"
            })
        }

        const {accessToken, refreshToken} = generateAccessAndRefreshToken(user._id);

        const options = {
            httpOnly:true,
            secure:true
        }

        return res
            .status(200)
            .cookie("accessToken",accessToken,options)
            .cookie("refreshToken",refreshToken,options)
            .json({
                success:true,
                message:"accessToken is refreshed",
                accessToken
            })
    } catch (error) {
        console.error("Error in refreshing token :",error);
        return res.status(500).json({
            success:false,
            message:"Internal server error !!"
        })
    }
}
const getUserDetails =  async(req, res) => {
  try {
    const userId = req.userId;

    // validate userId
    if(!userId){
        return res.status(401).json({
            success:false,
            message:"userId not found"
        })
    }

    // find user with userId
    const user = await User.findById(userId);
    if(!user){
        return res.status(404).json({
            success:false,
            message:"User not found."
        })
    }

    // return success response and user details
    return res.status(200).json({
        success:true,
        message:"user found successfully !!",
        data :{
            fullName : user.fullName,
            email : user.email,
            mobileNumber : user.mobileNumber,
            gender
        }
    })
  } catch (error) {
    console.error("Error in getting user detail :", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error !!",
    });
  }
};
const logOut = async(req, res) => {
  try {
    // take userId from middleware and give error if its not found
    const userId = req.userId;
    // validate userId
    if(!userId){
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

    // set cookie
     const options = {
        httpOnly:true,
        secure: true
     }
    return res
        .status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json({
            success:true,
            message:"User LogedOut successfully !!"
        })
  } catch (error) {
    console.error("Error in logOut user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error !!",
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
};
