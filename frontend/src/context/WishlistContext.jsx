// src/context/WishlistContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  // ✅ Always initialize as empty array
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem('token');

  // ✅ Fetch wishlist
  const fetchWishlist = async () => {
    const token = getToken();
    if (!token) {
      setWishlist([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // ✅ Always set to array (fallback to empty array)
        setWishlist(data.books || data.data || []);
      } else if (response.status === 404) {
        setWishlist([]);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch wishlist');
        setWishlist([]);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setError(error.message || 'Network error');
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add to wishlist
  const addToWishlist = async (bookId) => {
    const token = getToken();
    if (!token) {
      return { success: false, message: 'Please login' };
    }

    try {
      const response = await fetch(`http://localhost:5000/api/wishlist/${bookId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWishlist(data.books || data.data || []);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return { success: false };
    }
  };

  // ✅ Remove from wishlist
  const removeFromWishlist = async (bookId) => {
    const token = getToken();
    if (!token) {
      return { success: false };
    }

    try {
      const response = await fetch(`http://localhost:5000/api/wishlist/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWishlist(data.books || data.data || []);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return { success: false };
    }
  };

  // ✅ Check if book is in wishlist
  const isInWishlist = (bookId) => {
    // ✅ Safe check - wishlist is always an array
    return wishlist.some(book => book._id === bookId);
  };

  // ✅ Auto-fetch when token changes
  useEffect(() => {
    const token = getToken();
    if (token) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [localStorage.getItem('token')]);

  return (
    <WishlistContext.Provider value={{
      wishlist,
      loading,
      error,
      fetchWishlist,
      addToWishlist,
      removeFromWishlist,
      isInWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};