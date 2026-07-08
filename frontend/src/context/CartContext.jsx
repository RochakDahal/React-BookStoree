import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();


export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const clearCart = async () => {
  try {
    const token = localStorage.getItem('token');
    await axios.delete('http://localhost:5000/api/cart/clear', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setCartItems([]);
  } catch (error) {
    console.error('Error clearing cart:', error);
  }
};


  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartItems(res.data.cart.items);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (bookId, quantity = 1) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/cart',
        { bookId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems(res.data.cart.items);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error.response?.data?.message || 'Failed to add to cart. Please login.');
    }
  };

  const updateQuantity = async (bookId, quantity) => {
    if (quantity < 1) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `http://localhost:5000/api/cart/${bookId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems(res.data.cart.items);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeFromCart = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`http://localhost:5000/api/cart/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartItems(res.data.cart.items);
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      if (item.book) {
        return total + (item.book.price * item.quantity);
      }
      return total;
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      loading,
      addToCart,
      updateQuantity,
      removeFromCart,
      getCartTotal,
      getCartCount,
      fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};