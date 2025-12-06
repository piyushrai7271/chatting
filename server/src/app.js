import express from "express";
import cookieParser from "cookie-parser";
import passport from "./config/passport/google.strategy.js";
import cors from "cors";
const app = express();

app.use(
    cors({
        origin:process.env.CORS,
        credentials:true,
    })
)

app.use(express.json({extended:true}));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(passport.initialize());

// Import routes from router
import userRoutes from "./routes/user.routes.js";

app.use("/api/auth",userRoutes);



export default app;