import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';


import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop, { ScrollToTopButton } from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';


import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Books from './pages/Books';
import BookDetails from './pages/BookDetails';
import About from './pages/About';
import Contact from './pages/Contact';


import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';

import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrderDetails from './pages/OrderDetails';
import Profile from './pages/Profile';
import MyOrders from './pages/MyOrders';

import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop, { ScrollToTopButton } from './components/ScrollToTop';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            
            <ScrollToTop />
            
            <div className="min-h-screen flex flex-col bg-gray-50">
             
              <Navbar />
              
              
              <main className="grow">
                <Routes>
                  {/* --- Public Routes --- */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/books" element={<Books />} />
                  <Route path="/books/:id" element={<BookDetails />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  
                  <Route 
                    path="/cart" 
                    element={<ProtectedRoute><Cart /></ProtectedRoute>} 
                  />
                  <Route 
                    path="/wishlist" 
                    element={<ProtectedRoute><Wishlist /></ProtectedRoute>} 
                  />
                  <Route 
                    path="/checkout" 
                    element={<ProtectedRoute><Checkout /></ProtectedRoute>} 
                  />
                  <Route 
                    path="/order-success" 
                    element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} 
                  />
                  <Route 
                    path="/orders" 
                    element={<ProtectedRoute><MyOrders /></ProtectedRoute>} 
                  />
                  <Route 
                    path="/orders/:id" 
                    element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} 
                  />
                  <Route 
                    path="/profile" 
                    element={<ProtectedRoute><Profile /></ProtectedRoute>} 
    ></Route>              
                  

                  {/* Protected Routes */}
                  <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                  <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                  <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                  <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
                  <Route path="/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
                  <Route path="/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                </Routes>
                
                
                <ScrollToTopButton />
              </main>
              
              
              <Footer />
            </div>
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;