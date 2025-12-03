// dotenv setup
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import connectDB from "./config/database.js";
import app  from "./app.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`App running at Port : ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(`Mongodb connection error : ${error}`);
  });
