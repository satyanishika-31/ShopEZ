import { Product, Admin } from '../models/Schema.js';

// ================== Fetch Products ==================
export const fetchProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error occurred' });
  }
};

// ================== Fetch Product Details ==================
export const fetchProductDetails = async (req, res) => {
  const id = req.params.id;
  try {
    const product = await Product.findById(id);
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error occurred' });
  }
};

// ================== Fetch Categories ==================
export const fetchCategories = async (req, res) => {
  try {
    let admin = await Admin.findOne();
    if (!admin) {
      admin = new Admin({ banner: '', categories: [] });
      await admin.save();
    }
    res.json(admin.categories);
  } catch (err) {
    console.error('fetchCategories Error:', err);
    res.status(500).json({ message: 'Error occurred', error: err.message });
  }
};

// ================== Add Product (Protected) ==================
export const addNewProduct = async (req, res) => {
  const {
    productName,
    productDescription,
    productMainImg,
    productCarousel,
    productSizes,
    productGender,
    productCategory,
    productNewCategory,
    productPrice,
    productDiscount
  } = req.body;

  try {
    // 👇 Only authorized user (admin) can add product
    if (req.user.usertype !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    if (productCategory === 'new category') {
      const admin = await Admin.findOne();
      admin.categories.push(productNewCategory);
      await admin.save();

      const newProduct = new Product({
        title: productName,
        description: productDescription,
        mainImg: productMainImg,
        carousel: productCarousel,
        category: productNewCategory,
        sizes: productSizes,
        gender: productGender,
        price: productPrice,
        discount: productDiscount
      });
      await newProduct.save();
    } else {
      const newProduct = new Product({
        title: productName,
        description: productDescription,
        mainImg: productMainImg,
        carousel: productCarousel,
        category: productCategory,
        sizes: productSizes,
        gender: productGender,
        price: productPrice,
        discount: productDiscount
      });
      await newProduct.save();
    }
    res.json({ message: 'Product added!!' });
  } catch (err) {
    res.status(500).json({ message: 'Error occurred' });
  }
};

// ================== Update Product (Protected) ==================
export const updateProduct = async (req, res) => {
  const id = req.params.id;
  const {
    productName,
    productDescription,
    productMainImg,
    productCarousel,
    productSizes,
    productGender,
    productCategory,
    productNewCategory,
    productPrice,
    productDiscount
  } = req.body;

  try {
    // 👇 Only authorized user (admin) can update product
    if (req.user.usertype !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (productCategory === 'new category') {
      const admin = await Admin.findOne();
      admin.categories.push(productNewCategory);
      await admin.save();
      product.category = productNewCategory;
    } else {
      product.category = productCategory;
    }

    product.title = productName;
    product.description = productDescription;
    product.mainImg = productMainImg;
    product.carousel = productCarousel;
    product.sizes = productSizes;
    product.gender = productGender;
    product.price = productPrice;
    product.discount = productDiscount;

    await product.save();

    res.json({ message: 'Product updated!!' });
  } catch (err) {
    res.status(500).json({ message: 'Error occurred' });
  }
};
export const buyProduct = async (req, res) => {
  try {
    const { userId, title, description, mainImg, size, quantity, price, discount, paymentMethod, orderDate, name, email, mobile, address, pincode } = req.body;

    // TODO: Save order to database
    // Example: await Order.create({ ... })

    res.status(200).json({ message: 'Order placed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Order failed', error: err.message });
  }
};
