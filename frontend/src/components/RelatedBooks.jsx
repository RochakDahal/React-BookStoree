import { useEffect, useState } from 'react';
import axios from 'axios';
import BookCard from './BookCard';

const RelatedBooks = ({ currentBookId, genre }) => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/books?genre=${genre}`);
        setBooks(res.data.books.filter(b => b._id !== currentBookId).slice(0, 4));
      } catch (error) {
        console.error(error);
      }
    };
    if (genre) fetchRelated();
  }, [currentBookId, genre]);

  if (books.length === 0) return null;

  return (
    <div className="mt-16">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {books.map(book => <BookCard key={book._id} book={book} />)}
      </div>
    </div>
  );
};

export default RelatedBooks;