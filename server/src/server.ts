import dotenv from "dotenv";
import app from "./app";
import connectDB from "./config/db";

dotenv.config();

process.on("unhandledRejection", (err: Error) => {
  console.error("[FATAL] Unhandled rejection:", err.message);
  process.exit(1);
});

process.on("uncaughtException", (err: Error) => {
  console.error("[FATAL] Uncaught exception:", err.message);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

const start = async (): Promise<void> => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`[SERVER] Teacher Assistant API running on http://localhost:${PORT}`));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[DB] Connection failed:", message);
    console.error("[DB] Retrying in 5 seconds...");
    setTimeout(start, 5000);
  }
};

start();
