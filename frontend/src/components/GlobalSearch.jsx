import { useState, useEffect, useRef } from 'react';
import { Search, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.length > 2) {
        try {
          const res = await axios.get(`http://localhost:5000/api/books?search=${query}`);
          setResults(res.data.books.slice(0, 5));
          setIsOpen(true);
        } catch (error) {
          console.error(error);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <div className="relative w-full max-w-md" ref={wrapperRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search books, authors..."
          className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
          {results.map((book) => (
            <Link
              key={book._id}
              to={`/books/${book._id}`}
              onClick={() => { setIsOpen(false); setQuery(''); }}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
            >
              <img src={book.coverImage} alt={book.title} className="w-10 h-14 object-cover rounded" />
              <div>
                <p className="font-semibold text-gray-900 text-sm line-clamp-1">{book.title}</p>
                <p className="text-xs text-gray-500">{book.author}</p>
                <p className="text-xs text-teal-600 font-bold">Rs. {book.price}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;