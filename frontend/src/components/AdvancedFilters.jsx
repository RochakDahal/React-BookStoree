import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';

const AdvancedFilters = ({ genres, selectedGenre, setSelectedGenre, maxPrice, setMaxPrice }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white p-6 rounded-2xl shadow-lg sticky top-24"
    >
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-5 h-5 text-teal-500" />
        <h3 className="text-xl font-bold text-gray-900">Filters</h3>
      </div>

      <div className="mb-8">
        <h4 className="font-semibold text-gray-800 mb-3">Genre</h4>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {genres.map((genre) => (
            <label key={genre} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="genre"
                checked={selectedGenre === genre}
                onChange={() => setSelectedGenre(genre)}
                className="w-4 h-4 text-teal-500 focus:ring-teal-500"
              />
              <span className="text-gray-600 group-hover:text-teal-600 transition-colors">{genre}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-800 mb-3">Max Price: Rs. {maxPrice}</h4>
        <input
          type="range"
          min="0"
          max="5000"
          step="100"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Rs. 0</span>
          <span>Rs. 5000</span>
        </div>
      </div>
    </motion.div>
  );
};

export default AdvancedFilters;