// src/components/ReviewSection.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Star, Trash2, Edit2, Send, X } from 'lucide-react';
import StarRating from './StarRating';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ReviewSection = ({ bookId, reviews: initialReviews, rating: initialRating }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState(initialReviews || []);
  const [averageRating, setAverageRating] = useState(initialRating || 0);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Check if user has already reviewed
  const userReview = reviews.find(r => r.user?._id === user?.id || r.user === user?.id);

  useEffect(() => {
    if (userReview) {
      setUserRating(userReview.rating);
      setUserComment(userReview.comment);
    }
  }, [userReview]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/books/${bookId}/reviews`);
      if (response.data.success) {
        setReviews(response.data.reviews);
        setAverageRating(response.data.rating);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      alert('Please login to submit a review');
      return;
    }

    if (userRating === 0) {
      alert('Please select a rating');
      return;
    }

    if (!userComment.trim()) {
      alert('Please write a comment');
      return;
    }

    setLoading(true);
    try {
      const url = `http://localhost:5000/api/books/${bookId}/reviews`;
      const method = isEditing ? 'put' : 'post';
      const response = await axios[method](
        url,
        { rating: userRating, comment: userComment.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setReviews(response.data.reviews);
        setAverageRating(response.data.rating);
        setUserRating(0);
        setUserComment('');
        setIsEditing(false);
        setEditingReviewId(null);
        setShowForm(false);
        alert(isEditing ? 'Review updated successfully!' : 'Review added successfully!');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;

    setLoading(true);
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/books/${bookId}/reviews`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setReviews(response.data.reviews);
        setAverageRating(response.data.rating);
        setUserRating(0);
        setUserComment('');
        setIsEditing(false);
        setEditingReviewId(null);
        alert('Review deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    } finally {
      setLoading(false);
    }
  };

  const handleEditReview = () => {
    setIsEditing(true);
    setShowForm(true);
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Reviews</h3>

      {/* Rating Summary */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-gray-900">
              {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
            </span>
            <div>
              <StarRating rating={averageRating} readonly size={20} showLabel={false} />
              <p className="text-sm text-gray-500">
                Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          </div>
        </div>
        {isAuthenticated && !userReview && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium"
          >
            {showForm ? 'Cancel' : 'Write a Review'}
          </button>
        )}
      </div>

      {/* Review Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border border-gray-200 rounded-xl p-4 mb-6 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-gray-900">
                {isEditing ? 'Edit Your Review' : 'Write a Review'}
              </h4>
              <button
                onClick={() => {
                  setShowForm(false);
                  setIsEditing(false);
                  setUserRating(0);
                  setUserComment('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Rating</label>
                <StarRating
                  rating={userRating}
                  onRatingChange={setUserRating}
                  size={28}
                  showLabel={false}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Comment</label>
                <textarea
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  placeholder="Share your thoughts about this book..."
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSubmitReview}
                  disabled={loading}
                  className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {loading ? 'Submitting...' : isEditing ? 'Update Review' : 'Submit Review'}
                </button>
                {isEditing && (
                  <button
                    onClick={handleDeleteReview}
                    disabled={loading}
                    className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 && !showForm && (
          <p className="text-gray-500 text-sm text-center py-4">No reviews yet. Be the first to review!</p>
        )}
        {reviews.map((review, index) => (
          <motion.div
            key={review._id || index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white border border-gray-100 rounded-xl p-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-teal-600" />
                  </div>
                  <span className="font-medium text-gray-900">{review.userName || review.user?.firstName}</span>
                </div>
                <div className="mt-1">
                  <StarRating rating={review.rating} readonly size={18} showLabel={false} />
                </div>
                <p className="text-gray-700 mt-2">{review.comment}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
              {isAuthenticated && user?.id === review.user?._id && (
                <button
                  onClick={handleEditReview}
                  className="text-gray-400 hover:text-teal-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSection;