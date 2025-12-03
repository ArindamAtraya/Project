import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.js";
import propertyRoutes from "./routes/property.js";

dotenv.config();
const app = express();
const __dirname = path.resolve();

// 🧾 Logging middleware
app.use((req, res, next) => {
  console.log(`📩 ${req.method} ${req.url}`);
  next();
});

// ✅ Updated Middlewares
app.use(
  cors({
    origin: "*", // Allow all origins (Render + localhost)
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Handle large JSON bodies and form data
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ✅ Serve static frontend files (Render serves from same app)
app.use(express.static(path.join(__dirname, "public")));

// ✅ API Routes
app.use("/api", authRoutes);
app.use("/api/properties", propertyRoutes);

// ✅ Catch-all route for frontend (non-API requests)
app.get("*", (req, res) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(__dirname, "public", "home.html"));
  } else {
    res.status(404).json({ message: "API route not found" });
  }
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("💥 Server Error:", err.stack);
  res.status(500).json({ message: "Server Error" });
});

// ✅ Connect to DB and start server
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB Connected");
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ DB Connection Error:", err));
