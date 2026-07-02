import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlistItems(res.data.wishlist.books);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/wishlist',
        { bookId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWishlistItems(res.data.wishlist.books);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      alert(error.response?.data?.message || 'Failed to add to wishlist. Please login.');
    }
  };

  const removeFromWishlist = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`http://localhost:5000/api/wishlist/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlistItems(res.data.wishlist.books);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const isInWishlist = (bookId) => {
    return wishlistItems.some(item => item._id === bookId);
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      loading,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      fetchWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};