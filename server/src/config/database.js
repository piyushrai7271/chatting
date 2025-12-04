import mongoose from "mongoose";

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    if (mongoose.connection.readyState === 1) {
      console.log("✅ Database connected successfully!");
    } else {
      console.log("❌ MongoDB connection failed!");
      process.exit(1);
    }

  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

mongoose.connection.on("connected", () => {
  console.log("📡 Mongoose connected Successfully !!");
});

mongoose.connection.on("error", (err) => {
  console.error("⚠️ Mongoose error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ Mongoose disconnected!");
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("🛑 Mongoose connection closed due to app termination");
  process.exit(0);
});

export default connectDb;

