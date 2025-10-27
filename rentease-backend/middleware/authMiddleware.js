// rentease-backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  console.log("🔎 Incoming Authorization Header:", authHeader || "None");

  // 1️⃣ Check for header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("❌ Missing or malformed Authorization header");
    return res.status(401).json({ message: "Authorization header missing or invalid" });
  }

  // 2️⃣ Extract token
  const token = authHeader.split(" ")[1];
  if (!token) {
    console.error("❌ Token missing after Bearer");
    return res.status(401).json({ message: "Token missing" });
  }

  // 3️⃣ Check JWT secret availability
  if (!process.env.JWT_SECRET) {
    console.error("🚨 JWT_SECRET not set in environment variables!");
    return res.status(500).json({ message: "Server configuration error (JWT secret missing)" });
  }

  try {
    // 4️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token verified successfully for user:", decoded.id || decoded.email);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
