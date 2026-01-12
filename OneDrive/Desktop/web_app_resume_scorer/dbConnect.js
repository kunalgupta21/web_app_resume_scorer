require("dotenv").config();
const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not defined");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connection successful");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = dbConnect;
