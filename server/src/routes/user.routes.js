import express from "express"
import {
    regesterUser,
    login,
    changePassword,
    refreshAccessToken,
    getUserDetails,
    logOut
} from "../controllers/user.controller.js";
const router = express.Router();


router.post("/register",regesterUser);
router.post("/login",login);
router.post("/changePassword",changePassword);
router.post("/refresh-token",refreshAccessToken);
router.get("/getUserDetails",getUserDetails);
router.post("/logOut",logOut);


export default router;