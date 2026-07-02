import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, Users, Award, ArrowRight, Star } from 'lucide-react';
import axios from 'axios';
import BookCard from '../components/BookCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredBooks, setFeaturedBooks] = useState([]);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/books');
      setBooks(response.data.books);
      setFeaturedBooks(response.data.books.slice(0, 4));
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { icon: BookOpen, value: '50K+', label: 'Titles', color: 'from-teal-500 to-cyan-500' },
    { icon: Users, value: '1.2M', label: 'Readers', color: 'from-purple-500 to-pink-500' },
    { icon: Award, value: '240+', label: 'Topics', color: 'from-orange-500 to-red-500' },
    { icon: TrendingUp, value: '4.9', label: 'Rating', color: 'from-green-500 to-teal-500' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen">
      
      <section className="relative bg-linear-to-br from-teal-50 via-cyan-50 to-purple-50 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Mindful{' '}
                <span className="bg-linear-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Reading
                </span>{' '}
                Experience
              </h1>
              <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                Curated knowledge journeys that challenge perceptions and inspire growth. 
                Discover transformative content crafted for the modern intellect.
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link to="/books" className="btn-primary px-8 py-4 text-lg font-semibold flex items-center justify-center gap-2">
                  Explore Books
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/about" className="px-8 py-4 bg-white text-teal-600 border-2 border-teal-600 rounded-lg hover:bg-teal-50 transition-all duration-300 text-lg font-semibold text-center">
                  Learn More
                </Link>
              </div>

 
              <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className={`w-12 h-12 mx-auto bg-linear-to-br ${stat.color} rounded-lg flex items-center justify-center mb-2`}>
                      <stat.icon className="text-white w-6 h-6" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative w-full h-96 lg:h-500px">
                <div className="absolute inset-0 bg-linear-to-br from-purple-600 to-cyan-600 rounded-3xl transform rotate-3 opacity-20"></div>
                <div className="absolute inset-0 bg-linear-to-br from-teal-500 to-cyan-500 rounded-3xl transform -rotate-2 overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&h=1000&fit=crop"
                    alt="Reading"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <span className="font-semibold">4.9/5 Rating</span>
                    </div>
                    <p className="text-lg">"Mind Blown: Unleashing Creativity"</p>
                    <p className="text-sm opacity-90">by Susan Williams</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

   
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Bookseller Favorites</h2>
            <div className="w-24 h-1 bg-linear-to-r from-teal-500 to-cyan-500 mx-auto rounded-full"></div>
            <p className="mt-4 text-lg text-gray-600">Handpicked selections from our expert curators</p>
          </motion.div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {featuredBooks.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </motion.div>
          )}

          <div className="text-center mt-12">
            <Link to="/books" className="btn-primary px-8 py-3 inline-flex items-center gap-2">
              View All Books
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      
      <section className="py-20 bg-linear-to-br from-gray-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose BookShell?</h2>
            <div className="w-24 h-1 bg-linear-to-r from-teal-500 to-cyan-500 mx-auto rounded-full"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Curated Collections',
                description: 'Expertly selected books across diverse genres to match your interests',
                icon: BookOpen,
                color: 'from-teal-500 to-cyan-500'
              },
              {
                title: 'Secure Payments',
                description: 'Multiple payment options including eSewa, Stripe, and Cash on Delivery',
                icon: Award,
                color: 'from-purple-500 to-pink-500'
              },
              {
                title: 'Fast Delivery',
                description: 'Quick and reliable delivery to your doorstep anywhere in Nepal',
                icon: TrendingUp,
                color: 'from-orange-500 to-red-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-linear-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon className="text-white w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;