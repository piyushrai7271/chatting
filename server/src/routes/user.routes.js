import express from "express"
import {
    regesterUser,
    login,
    changePassword,
    getUserDetails,
    updateUserDetails,
    logOut
} from "../controllers/user.controller.js";
const router = express.Router();


router.post("/register",regesterUser);
router.post("/login",login);
router.post("/changePassword",changePassword);
router.get("/getUserDetails",getUserDetails);
router.put("/updateUserDetails",updateUserDetails);
router.post("/logOut",logOut);


export default router;