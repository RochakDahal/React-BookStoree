// src/pages/Books.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X, Grid, List, SlidersHorizontal } from 'lucide-react';
import BookCard from '../components/BookCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useBooks } from '../context/BookContext';

const Books = () => {
  const { books, loading, error, fetchBooks } = useBooks();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [showOnSale, setShowOnSale] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [filteredBooks, setFilteredBooks] = useState([]);

  const genres = ['All', 'Fiction', 'Classic', 'Science Fiction', 'Fantasy', 'Romance', 'Mystery', 'Horror', 'Young Adult', 'Biography', 'Self-Help', 'Non-Fiction', 'Thriller', 'Historical Fiction', 'Dystopian', 'Adventure', 'Post-Apocalyptic'];

  // ✅ Fetch books on component mount
  useEffect(() => {
    if (books.length === 0 && !loading) {
      fetchBooks();
    }
  }, []);

  // ✅ Filter and sort books whenever dependencies change
  useEffect(() => {
    if (books.length > 0) {
      filterAndSortBooks();
    } else {
      setFilteredBooks([]);
    }
  }, [books, searchTerm, selectedGenre, sortBy, showOnSale, priceRange]);

  const filterAndSortBooks = () => {
    let filtered = [...books];

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(book =>
        book.title?.toLowerCase().includes(term) ||
        book.author?.toLowerCase().includes(term) ||
        book.genre?.toLowerCase().includes(term)
      );
    }

    // Filter by genre
    if (selectedGenre && selectedGenre !== 'All') {
      filtered = filtered.filter(book => book.genre === selectedGenre);
    }

    // Filter by price range
    if (priceRange.min) {
      filtered = filtered.filter(book => book.price >= parseFloat(priceRange.min));
    }
    if (priceRange.max) {
      filtered = filtered.filter(book => book.price <= parseFloat(priceRange.max));
    }

    // Filter by on sale
    if (showOnSale) {
      filtered = filtered.filter(book => book.discount && book.discount > 0);
    }

    // Sort
    const sortOptions = {
      'newest': (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      'price-low': (a, b) => a.price - b.price,
      'price-high': (a, b) => b.price - a.price,
      'rating': (a, b) => (b.rating || 0) - (a.rating || 0),
      'discount': (a, b) => (b.discount || 0) - (a.discount || 0),
      'title': (a, b) => a.title?.localeCompare(b.title || '') || 0
    };

    filtered.sort(sortOptions[sortBy] || sortOptions['newest']);

    setFilteredBooks(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedGenre('');
    setSortBy('newest');
    setShowOnSale(false);
    setPriceRange({ min: '', max: '' });
  };

  const activeFiltersCount = [
    searchTerm,
    selectedGenre,
    showOnSale,
    priceRange.min,
    priceRange.max
  ].filter(Boolean).length;

  // ✅ Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading books...</p>
        </div>
      </div>
    );
  }

  // ✅ Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-red-600 font-medium mb-3">{error}</p>
            <button 
              onClick={fetchBooks}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Show empty state if no books
  if (books.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Books Found</h2>
            <p className="text-gray-500 text-sm mb-4">There are no books available at the moment.</p>
            <button 
              onClick={fetchBooks}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">All Books</h1>
          <p className="text-gray-600">Discover your next favorite book</p>
        </motion.div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search books by title, author, or genre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center gap-2 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="bg-teal-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <div className="flex border border-gray-300 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 transition-colors ${viewMode === 'grid' ? 'bg-teal-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 transition-colors ${viewMode === 'list' ? 'bg-teal-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Genre</label>
                  <div className="flex flex-wrap gap-2">
                    {genres.map((genre) => (
                      <button
                        key={genre}
                        onClick={() => setSelectedGenre(genre === selectedGenre ? '' : genre)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                          (selectedGenre === genre) || (genre === 'All' && !selectedGenre)
                            ? 'bg-teal-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Price Range</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Deals</label>
                  <button
                    onClick={() => setShowOnSale(!showOnSale)}
                    className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                      showOnSale
                        ? 'bg-red-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🔥 On Sale
                  </button>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="newest">Newest</option>
                    <option value="title">Title A-Z</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Rating</option>
                    <option value="discount">Discount</option>
                  </select>
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Clear All Filters
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredBooks.length}</span> books
          </p>
          {showOnSale && (
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
              🔥 Showing discounted books only
            </span>
          )}
        </div>

        {/* Books Grid/List */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No books found matching your criteria</p>
            <button
              onClick={clearFilters}
              className="mt-4 text-teal-500 hover:text-teal-600 font-medium"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className={`grid ${
            viewMode === 'grid' 
              ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6' 
              : 'grid-cols-1 gap-4'
          }`}>
            {filteredBooks.map((book, index) => (
              <BookCard key={book._id} book={book} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Books;