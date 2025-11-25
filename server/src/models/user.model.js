import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
    {
        fullName:{
            type:String,
            required:true,
            trim:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            index:true,
            trim:true
        },
        mobileNumber:{
            type:String,
            required:true
        },
        // profileImage:{
        //     type:String,
        //     required:true
        // },
        gender:{
            type:String,
            enum:["Male","Female","Other"]
        },
        password:{
            type:String,
            required:[true,"password is required"]
        },
        refreshToken:{
            type:String
        }
    },
    {timestamps:true}
);

userSchema.pre("save", async function(next){
    if(!this.isModified(password)) return next();

    this.password  = await bcrypt.hash(this.password,10);
    return next();
})

userSchema.methods.isPasswordCorrect = async function (inPassword){
    return await bcrypt.compare(inPassword.toString(),this.password);
}

userSchema.methods.generateAccessToken = function (){
    return jwt.sign(
        {
            _id:this._id,
            fullName:this.fullName,
            email:this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function (){
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

const  User = mongoose.model("User",userSchema);
export default User;