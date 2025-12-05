import express from "express"
import {verifyJWT} from "../middleware/userAuth.middleware.js";
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
router.post("/changePassword",verifyJWT,changePassword);
router.post("/refresh-token",refreshAccessToken);
router.get("/getUserDetails",verifyJWT,getUserDetails);
router.post("/logOut",verifyJWT,logOut);


export default router;