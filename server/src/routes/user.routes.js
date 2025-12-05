import express from "express";
import { verifyJWT } from "../middleware/userAuth.middleware.js";
import { upload } from "../config/cloudinary.js";
import {
  regesterUser,
  login,
  changePassword,
  refreshAccessToken,
  getUserDetails,
  logOut,
  addAvatar,
  updateAvatar,
  deleteAvatar,
} from "../controllers/user.controller.js";
const router = express.Router();

router.post("/register", regesterUser);
router.post("/login", login);
router.post("/changePassword", verifyJWT, changePassword);
router.post("/refresh-token", refreshAccessToken);
router.get("/getUserDetails", verifyJWT, getUserDetails);
router.post("/logOut", verifyJWT, logOut);
router.post("/addAvatar",verifyJWT,upload.single("avatar"),addAvatar);
router.put("/updateAvatar",verifyJWT,upload.single("avatar"),updateAvatar);
router.delete("/deleteAvatar",verifyJWT,deleteAvatar);

export default router;
