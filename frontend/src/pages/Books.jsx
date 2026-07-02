import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import BookCard from '../components/BookCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [sortBy, setSortBy] = useState('title');
  const [showFilters, setShowFilters] = useState(false);

  const genres = [
    'All Genres',
    'Fiction',
    'Non-Fiction',
    'Mystery',
    'Romance',
    'Sci-Fi',
    'Fantasy',
    'Biography',
    'Self-Help',
    'Business',
    'Technology'
  ];

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      let url = 'http://localhost:5000/api/books?';
      if (selectedGenre !== 'All Genres') {
        url += `genre=${selectedGenre}&`;
      }
      if (searchTerm) {
        url += `search=${searchTerm}&`;
      }
      url += `sort=${sortBy}`;

      const response = await axios.get(url);
      setBooks(response.data.books);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchBooks();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedGenre, sortBy]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-teal-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Explore Our <span className="bg-linear-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Collection</span>
          </h1>
          <p className="text-xl text-gray-600">Discover your next favorite book</p>
        </motion.div>

       
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 space-y-4"
        >
          
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Search titles, authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:outline-none text-lg shadow-lg"
            />
          </div>

         
          <div className="flex justify-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-all text-gray-700 font-medium"
            >
              <SlidersHorizontal className="w-5 h-5" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {genres.map((genre) => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="title">Title (A-Z)</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

      
        <div className="text-right mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-gray-900">{books.length}</span> results
          </p>
        </div>

       
        {loading ? (
          <LoadingSpinner fullScreen={false} />
        ) : books.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-2xl text-gray-500">No books found</p>
            <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {books.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Books;