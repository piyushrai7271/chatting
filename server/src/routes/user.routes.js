import express from "express";
import passport from "../config/passport/google.strategy.js";
import gitPassport from "../config/passport/github.js";
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
  OAuthCallback
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


// google Pauth 2.0
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false     // <-- IMPORTANT
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false     // <-- IMPORTANT
  }),
  OAuthCallback
);

// GitHub Login Route
router.get(
  "/github",
  gitPassport.authenticate("github",{ 
    scope:["user:profile","user:email"],
    session: false 
  })
);

// GitHub callback
router.get(
  "/github/callback",
  gitPassport.authenticate("github", {
    failureRedirect: "/login",
    session: false,
  }),
  OAuthCallback   // SAME CALLBACK — because logic is identical
);




export default router;
