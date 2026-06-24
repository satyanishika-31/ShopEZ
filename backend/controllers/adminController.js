import { Admin } from '../models/Schema.js';

// ✅ Fetch banner (only for authenticated admin)
export const fetchBanner = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const admin = await Admin.findOne();
    res.json(admin ? admin.banner : null);
  } catch (err) {
    res.status(500).json({ message: "Error occurred" });
  }
};

// ✅ Update banner (only for authenticated admin)
export const updateBanner = async (req, res) => {
  const { banner } = req.body;
  try {
    // Check if user is admin
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const data = await Admin.find();
    if (data.length === 0) {
      const newData = new Admin({ banner, categories: [] });
      await newData.save();
      return res.json({ message: "Banner updated" });
    } else {
      const admin = await Admin.findOne();
      admin.banner = banner;
      await admin.save();
      return res.json({ message: "Banner updated" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error occurred" });
  }
};
