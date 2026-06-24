import express from "express";
import { fetchBanner, updateBanner } from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js"; // ✅ middleware

const router = express.Router();

// ✅ Only logged-in users with a valid JWT can access
router.get("/fetch-banner", protect, fetchBanner);
router.post("/update-banner", protect, updateBanner);

export default router;
