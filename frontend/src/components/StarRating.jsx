// src/components/StarRating.jsx
import { useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const StarRating = ({ 
  rating = 0, 
  onRatingChange, 
  readonly = false, 
  size = 24,
  showLabel = true,
  totalReviews = 0
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleMouseEnter = (index) => {
    if (!readonly) {
      setHoverRating(index + 1);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const handleClick = (index) => {
    if (!readonly && onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[...Array(5)].map((_, index) => (
          <motion.button
            key={index}
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(index)}
            disabled={readonly}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer'} p-0.5`}
          >
            <Star
              className={`w-${size/4} h-${size/4}`}
              fill={index < displayRating ? '#f59e0b' : 'none'}
              stroke={index < displayRating ? '#f59e0b' : '#d1d5db'}
              strokeWidth={1.5}
            />
          </motion.button>
        ))}
      </div>
      {showLabel && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">
            {rating > 0 ? rating.toFixed(1) : '0.0'}
          </span>
          {totalReviews > 0 && (
            <span className="text-xs text-gray-500">
              ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StarRating;