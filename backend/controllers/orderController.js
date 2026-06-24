import { Orders, Cart } from '../models/Schema.js';

// ✅ Fetch only logged-in user's orders (Admins can fetch all)
export const fetchOrders = async (req, res) => {
  try {
    let orders;
    if (req.user.usertype === "Admin") {
      orders = await Orders.find(); // Admin sees all
    } else {
      orders = await Orders.find({ userId: req.user._id }); // User sees only theirs
    }
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error occurred" });
  }
};

// ✅ Buy product (order a single item)
export const buyProduct = async (req, res) => {
  const {
    name,
    email,
    mobile,
    address,
    pincode,
    title,
    description,
    mainImg,
    size,
    quantity,
    price,
    discount,
    paymentMethod,
    orderDate
  } = req.body;

  try {
    const newOrder = new Orders({
      userId: req.user._id, // take user from JWT
      name,
      email,
      mobile,
      address,
      pincode,
      title,
      description,
      mainImg,
      size,
      quantity,
      price,
      discount,
      paymentMethod,
      orderDate
    });
    await newOrder.save();

    res.json({ message: "Order placed" });
  } catch (err) {
    res.status(500).json({ message: "Error occurred" });
  }
};

// ✅ Cancel order (only if user owns it, or if Admin)


export const cancelOrder = async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ message: "Order ID is required" });
  }

  try {
    // Find the order by ID
    const order = await Orders.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update order status to 'Cancelled'
    order.orderStatus = "Cancelled";
    await order.save();

    // Optional: remove items from cart if needed
    await Cart.deleteMany({ order: orderId });

    res.status(200).json({ message: "Order cancelled successfully" });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Update order status (Admin only)
export const updateOrderStatus = async (req, res) => {
  const { id, updateStatus } = req.body;
  try {
    // if (req.user.usertype !== "Admin") {
    //   return res.status(403).json({ message: "Admins only can update order status" });
    // }

    const order = await Orders.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.orderStatus = updateStatus;
    await order.save();

    res.json({ message: "Order status updated" });
  } catch (err) {
    res.status(500).json({ message: "Error occurred" });
  }
};

// ✅ Place order from all cart items
export const placeCartOrder = async (req, res) => {
  const { name, mobile, email, address, pincode, paymentMethod, orderDate } = req.body;

  try {
    const cartItems = await Cart.find({ userId: req.user._id });

    await Promise.all(
      cartItems.map(async (item) => {
        const newOrder = new Orders({
          userId: req.user._id, // from token
          name,
          email,
          mobile,
          address,
          pincode,
          title: item.title,
          description: item.description,
          mainImg: item.mainImg,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
          paymentMethod,
          orderDate
        });

        await newOrder.save();
        await Cart.deleteOne({ _id: item._id }); // clear cart item after placing order
      })
    );

    res.json({ message: "Order placed" });
  } catch (err) {
    res.status(500).json({ message: "Error occurred" });
  }
};
