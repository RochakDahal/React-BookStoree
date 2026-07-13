// src/components/Navbar.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, ShoppingCart, User, LogOut, BookOpen, Heart, 
  Home, ChevronDown, UserCircle, Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const { isAuthenticated, user, logout } = useAuth();
  const { getItemCount, cartItems } = useCart();
  const navigate = useNavigate();

  const cartCount = getItemCount ? getItemCount() : (cartItems?.length || 0);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/books', icon: BookOpen, label: 'Books' },
    { to: '/cart', icon: ShoppingCart, label: 'Cart', badge: cartCount },
    { to: '/wishlist', icon: Heart, label: 'Wishlist' },
  ];

  const dropdownItems = [
    { to: '/profile', icon: UserCircle, label: 'My Profile' },
    { to: '/my-orders', icon: Package, label: 'My Orders' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-lg' : 'bg-white/90 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-8 h-8 bg-linear-to-rrom-teal-500 to-cyan-500 rounded-lg flex items-center justify-center"
            >
              <BookOpen className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-xl font-bold bg-linear-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
              BookShell
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-2 rounded-lg text-gray-700 hover:text-teal-500 hover:bg-teal-50 transition-all flex items-center gap-2 relative"
              >
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
                {link.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {link.badge}
                  </motion.span>
                )}
              </Link>
            ))}

            {isAuthenticated ? (
              <div className="relative ml-4" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-50 hover:bg-teal-100 transition-all"
                >
                  <User className="w-4 h-4 text-teal-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {user?.firstName || 'User'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <p className="font-semibold text-gray-900 text-sm">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>

                      {dropdownItems.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-all"
                        >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </Link>
                      ))}

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100 transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-4">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-gray-700 hover:text-teal-500 hover:bg-teal-50 transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-linear-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-teal-50 hover:text-teal-500 transition-all"
                >
                  <link.icon className="w-5 h-5" />
                  <span>{link.label}</span>
                  {link.badge > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  <div className="px-4 py-3 text-sm text-gray-500 border-t border-gray-100">
                    Logged in as <span className="font-medium text-gray-700">{user?.firstName}</span>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-teal-50 transition-all"
                  >
                    <UserCircle className="w-5 h-5" />
                    My Profile
                  </Link>
                  <Link
                    to="/my-orders"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-teal-50 transition-all"
                  >
                    <Package className="w-5 h-5" />
                    My Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-3 text-center text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-3 text-center bg-linear-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;