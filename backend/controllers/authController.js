import jwt from "jsonwebtoken";
import { User } from "../models/Schema.js";

// Middleware to check token and attach user to request
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1]; // Extract token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to req (excluding password)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Middleware to allow only Admins
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.usertype === "Admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admins only." });
  }
};
