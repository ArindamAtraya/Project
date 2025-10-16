// rentease-backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  console.log("🔎 Incoming Authorization Header:", authHeader);

  if (!authHeader) {
    console.error("❌ No Authorization header present");
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1]; // Expect "Bearer <token>"
  console.log("🔑 Extracted Token:", token);

  if (!token) {
    console.error("❌ No token after Bearer");
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token decoded successfully:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ Token verification failed:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
