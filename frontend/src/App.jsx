// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { BookProvider } from './context/BookContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Books from './pages/Books';
import BookDetails from './pages/BookDetails';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import MyOrders from './pages/MyOrders';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <BookProvider>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="grow pt-16">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/books" element={<Books />} />
                    <Route path="/books/:id" element={<BookDetails />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* Payment Routes - Public (for redirects) */}
                    <Route path="/payment-success" element={<PaymentSuccess />} />
                    <Route path="/payment-failure" element={<PaymentFailure />} />
                    
                    {/* Protected Routes */}
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } />
                    <Route path="/my-orders" element={
                      <ProtectedRoute>
                        <MyOrders />
                      </ProtectedRoute>
                    } />
                    <Route path="/checkout" element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    } />
                  </Routes>
                </main>
                <Footer />
              </div>
            </BookProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;