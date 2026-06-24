import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) {
      setCartItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await API.get('/cart/fetch-cart');
      setCartItems(res.data || []);
    } catch (err) {
      console.error('Failed to fetch cart from server:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch cart when user logs in/changes
  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (product, quantity, size) => {
    if (!user) {
      return { success: false, message: 'Please log in to add items to cart.' };
    }
    try {
      const res = await API.post('/cart/add-to-cart', {
        title: product.name,
        description: product.description || '',
        mainImg: product.imageUrl || '',
        size: size || 'One Size',
        quantity: quantity || 1,
        price: product.price,
        discount: product.discount || 0
      });
      await fetchCart();
      return { success: true, message: res.data.message || 'Added to cart successfully!' };
    } catch (err) {
      console.error('Failed to add to cart:', err);
      return { success: false, message: err.response?.data?.message || 'Failed to add item to cart.' };
    }
  };

  const increaseQty = async (itemId) => {
    try {
      await API.put('/cart/increase-cart-quantity', { id: itemId });
      await fetchCart();
    } catch (err) {
      console.error('Failed to increase quantity:', err.message);
    }
  };

  const decreaseQty = async (itemId) => {
    try {
      await API.put('/cart/decrease-cart-quantity', { id: itemId });
      await fetchCart();
    } catch (err) {
      console.error('Failed to decrease quantity:', err.message);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await API.delete(`/cart/remove-item/${itemId}`);
      await fetchCart();
    } catch (err) {
      console.error('Failed to remove item:', err.message);
    }
  };

  const clearCartLocal = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      loading,
      fetchCart,
      addToCart,
      increaseQty,
      decreaseQty,
      removeItem,
      clearCartLocal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
