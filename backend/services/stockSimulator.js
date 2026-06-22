const Stock = require('../models/Stock');

// Keep the catalog seller-driven by removing legacy seeded products.
const initializeStocks = async () => {
  try {
    const result = await Stock.deleteMany({ sellerId: null });
    if (result.deletedCount > 0) {
      console.log(`Removed ${result.deletedCount} legacy seeded ShopEZ product(s).`);
    }
  } catch (error) {
    console.error('Failed to clean up legacy products:', error.message);
  }
};

module.exports = {
  initializeStocks
};
