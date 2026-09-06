import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export default function adminAuth(req, res, next) {
  // First check x-role header (set by frontend from stored user object)
  const role = req.headers["x-role"];
  if (role === "admin") {
    next();
    return;
  }

  // Also verify via JWT Authorization header
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role === "admin") {
        next();
        return;
      }
    } catch {
      // Invalid token — fall through to 403
    }
  }

  res.status(403).json({ message: "Admin access only" });
}