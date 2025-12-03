import express from "express";
import cookieParser from "cookie-parser";
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

// Import routes from router

import userRoutes from "./routes/user.routes.js";

app.use("/api/user",userRoutes);



export default app;