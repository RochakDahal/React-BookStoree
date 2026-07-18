import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import StarRating from './StarRating';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ReviewSection = ({ bookId, reviews, onReviewAdded }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [myReview, setMyReview] = useState(null);

  useEffect(() => {
    if (user && reviews) {
      const my = reviews.find(r => r.user._id === user.id || r.user === user.id);
      if (my) {
        setMyReview(my);
        setRating(my.rating);
        setComment(my.comment);
      }
    }
  }, [user, reviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !comment.trim()) return alert('Please provide rating and comment');

    const token = localStorage.getItem('token');
    const method = myReview ? 'put' : 'post';
    
    try {
      await axios[method](`http://localhost:5000/api/books/${bookId}/reviews`, 
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onReviewAdded();
    } catch (error) {
      alert(error.response?.data?.message || 'Error submitting review');
    }
  };

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h3>
      
      {user && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-xl mb-8">
          <h4 className="font-semibold mb-3">{myReview ? 'Update Your Review' : 'Write a Review'}</h4>
          <StarRating rating={rating} setRating={setRating} interactive={true} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this book..."
            className="input-field mt-4 resize-none"
            rows="3"
          />
          <button type="submit" className="btn-primary mt-4 px-6 py-2">
            {myReview ? 'Update Review' : 'Submit Review'}
          </button>
        </form>
      )}

      <div className="space-y-6">
        {reviews && reviews.length > 0 ? reviews.map((review, index) => (
          <motion.div
            key={review._id || index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border-b border-gray-100 pb-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-linear-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                <User className="text-white w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{review.user?.firstName || 'User'} {review.user?.lastName || ''}</p>
                <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="ml-auto">
                <StarRating rating={review.rating} />
              </div>
            </div>
            <p className="text-gray-600 ml-13">{review.comment}</p>
          </motion.div>
        )) : (
          <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;