
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X, Grid, List, SlidersHorizontal, ChevronDown } from 'lucide-react';
import BookCard from '../components/BookCard';
import { useBooks } from '../context/BookContext';

const Books = () => {
  const { books, loading, error, fetchBooks } = useBooks();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [showOnSale, setShowOnSale] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [filteredBooks, setFilteredBooks] = useState([]);

  const genres = ['All', 'Fiction', 'Classic', 'Science Fiction', 'Fantasy', 'Romance', 'Mystery', 'Horror', 'Young Adult', 'Biography', 'Self-Help', 'Non-Fiction', 'Thriller', 'Historical Fiction', 'Dystopian', 'Adventure', 'Post-Apocalyptic'];

  useEffect(() => {
    if (books.length === 0 && !loading) {
      fetchBooks();
    }
  }, []);

  useEffect(() => {
    if (books.length > 0) {
      filterAndSortBooks();
    } else {
      setFilteredBooks([]);
    }
  }, [books, searchTerm, selectedGenre, sortBy, showOnSale, priceRange]);

  const filterAndSortBooks = () => {
    let filtered = [...books];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(book =>
        book.title?.toLowerCase().includes(term) ||
        book.author?.toLowerCase().includes(term) ||
        book.genre?.toLowerCase().includes(term)
      );
    }

    if (selectedGenre && selectedGenre !== 'All') {
      filtered = filtered.filter(book => book.genre === selectedGenre);
    }

    if (priceRange.min) {
      filtered = filtered.filter(book => book.price >= parseFloat(priceRange.min));
    }
    if (priceRange.max) {
      filtered = filtered.filter(book => book.price <= parseFloat(priceRange.max));
    }

    if (showOnSale) {
      filtered = filtered.filter(book => book.discount && book.discount > 0);
    }

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

  if (books.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="w-16 h-16 text-gray-300 mx-auto mb-4">📚</div>
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
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Books</h1>
            <p className="text-gray-600">Discover your next favorite book</p>
          </div>
          
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center gap-2 text-gray-700 hover:bg-gray-50"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="bg-teal-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </motion.div>

        
        <div className="flex flex-col lg:flex-row gap-8">
          
          <div className={`lg:w-1/4 lg:block ${showMobileFilters ? 'block' : 'hidden'}`}>
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 block mb-2">Search Books</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Title, author, genre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 block mb-2">Genre</label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
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

            
              <div className="mb-6">
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

             
              <div className="mb-6">
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

            
              <div className="mb-6">
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
          </div>

          
          <div className="lg:w-3/4">
            
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{filteredBooks.length}</span> books
              </p>
              <div className="flex items-center gap-2">
                {showOnSale && (
                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                    🔥 On Sale
                  </span>
                )}
                <div className="flex border border-gray-300 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-teal-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-teal-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

           
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
                  ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6' 
                  : 'grid-cols-1 gap-4'
              }`}>
                {filteredBooks.map((book, index) => (
                  <BookCard key={book._id} book={book} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Books;