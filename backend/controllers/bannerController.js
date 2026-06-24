// backend/controllers/bannerController.js
export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find(); // fetch all banners
    res.json(banners[0]?.image || '');  // return image URL
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch banners' });
  }
};
