import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Mail, Phone, MapPin } from 'lucide-react';


const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const LinkedinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect width="4" height="12" x="2" y="9"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: FacebookIcon, href: 'https://facebook.com', color: 'hover:bg-blue-600', label: 'Facebook' },
    { icon: TwitterIcon, href: 'https://twitter.com', color: 'hover:bg-sky-500', label: 'Twitter' },
    { icon: InstagramIcon, href: 'https://instagram.com', color: 'hover:bg-pink-600', label: 'Instagram' },
    { icon: LinkedinIcon, href: 'https://linkedin.com', color: 'hover:bg-blue-700', label: 'LinkedIn' },
  ];

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Books', path: '/books' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <footer className="bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-linear-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <BookOpen className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold">BOOKSHELL</span>
            </Link>
            <p className="text-gray-400 mb-4">
              Your gateway to literary adventures. Discover, explore, and immerse yourself in the world of books.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className={`w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center transition-colors ${social.color}`}
                  aria-label={social.label}
                >
                  <social.icon />
                </motion.a>
              ))}
            </div>
          </motion.div>

          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-teal-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-teal-500 mt-1 shrink-0" />
                <span className="text-gray-400">Bhaktapur, Nepal</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-teal-500 shrink-0" />
                <span className="text-gray-400">98XXXXXXXX</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-teal-500 shrink-0" />
                <span className="text-gray-400">contact@bookshell.com</span>
              </li>
            </ul>
          </motion.div>

          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to our newsletter for the latest releases and exclusive offers.
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-l-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-linear-to-r from-teal-500 to-cyan-500 rounded-r-lg hover:from-teal-600 hover:to-cyan-600 transition-all"
              >
                →
              </button>
            </form>
          </motion.div>
        </div>

        <hr className="my-8 border-gray-700" />

        <div className="text-center text-gray-400">
          <p>&copy; {currentYear} BookShell. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;