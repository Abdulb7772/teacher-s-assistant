import mongoose from "mongoose";
import SchoolClass from "../models/Class";

const DEFAULT_CLASSES = ["9th", "10th"];

const seedClasses = async (): Promise<void> => {
  if ((await SchoolClass.countDocuments()) > 0) return;
  await SchoolClass.insertMany(DEFAULT_CLASSES.map((name) => ({ name })));
  console.log(`[DB] Seeded default classes: ${DEFAULT_CLASSES.join(", ")}`);
};

const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/teacher-assistant";
  mongoose.set("strictQuery", true);
  const conn = await mongoose.connect(uri);
  console.log(`[DB] MongoDB connected: ${conn.connection.host}`);
  await seedClasses();
};

export default connectDB;
