import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const verifyJWT = async (req, res, next) => {
  try {
    const token =
      (await req.cookies?.accessToken) ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(404).json({
        success: false,
        message: "Unauthorize access",
      });
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.status(402).json({
        success: false,
        message: "user is not matching in auth",
      });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    console.error("Error in jwt auth middleware", error);
    return res.status(401).json({
      success: false,
      message: "Invalid access token",
    });
  }
};

export { verifyJWT };
