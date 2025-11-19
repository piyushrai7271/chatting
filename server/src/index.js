import connectDB from "./db/database.js";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { app } from "./app.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 3000, ()=>{
        console.log(`App running at Port : ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(`Mongodb connection error : ${error}`);
  });
