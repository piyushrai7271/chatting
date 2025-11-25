import User from "../models/user.model.js";

const regesterUser = (req,res) =>{
    try {
        
    } catch (error) {
        console.error("Error in register User :",error);
        return res.status(500).json({
            success:false,
            message:"Internal server error !!"
        })
    }
}
const login = (req,res) =>{
    try {
        
    } catch (error) {
        console.error("Error in login User :",error);
        return res.status(500).json({
            success:false,
            message:"Internal server error !!"
        })
    }
}
const changePassword = (req,res) =>{
    try {
        
    } catch (error) {
        console.error("Error in password changing :",error);
        return res.status(500).json({
            success:false,
            message:"Internal server error !!"
        })
    }
}
const updateUserDetails = (req,res) =>{
    try {
        
    } catch (error) {
        console.error("Error in updating User detail :",error);
        return res.status(500).json({
            success:false,
            message:"Internal server error !!"
        })
    }
}
const getUserDetails = (req,res) =>{
    try {
        
    } catch (error) {
        console.error("Error in getting user detail :",error);
        return res.status(500).json({
            success:false,
            message:"Internal server error !!"
        })
    }
}
const logOut = (req,res) =>{
    try {
        
    } catch (error) {
        console.error("Error in logOut user:",error);
        return res.status(500).json({
            success:false,
            message:"Internal server error !!"
        })
    }
}

export {
    regesterUser,
    login,
    changePassword,
    updateUserDetails,
    getUserDetails,
    logOut
}
