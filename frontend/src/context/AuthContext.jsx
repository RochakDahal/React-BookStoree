import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🚀 CRITICAL: Fetch full user profile when the app loads or refreshes
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success) {
            setUser(res.data.user); // Stores firstName, lastName, address, city, phone, etc.
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error("Failed to load user profile", error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        // After login, fetch the full profile immediately
        const profileRes = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${res.data.token}` }
        });
        setUser(profileRes.data.user);
      }
      return res.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/api/auth/register', userData);
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        // After register, fetch the full profile immediately
        const profileRes = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${res.data.token}` }
        });
        setUser(profileRes.data.user);
      }
      return res.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};