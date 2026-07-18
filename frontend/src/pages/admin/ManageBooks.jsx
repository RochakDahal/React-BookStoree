import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import axios from 'axios';

const ManageBooks = () => {
  const [books, setBooks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({ title: '', author: '', price: '', stock: '', genre: '', description: '' });

  useEffect(() => { fetchBooks(); }, []);

  const fetchBooks = async () => {
    const res = await axios.get('http://localhost:5000/api/books');
    setBooks(res.data.books);
  };

  const handleEdit = (book) => {
    setEditingBook(book);
    setFormData(book);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBooks();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const url = editingBook 
      ? `http://localhost:5000/api/admin/books/${editingBook._id}` 
      : 'http://localhost:5000/api/admin/books';
    const method = editingBook ? 'put' : 'post';

    await axios[method](url, formData, { headers: { Authorization: `Bearer ${token}` } });
    setIsModalOpen(false);
    fetchBooks();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Books</h1>
        <button onClick={() => { setEditingBook(null); setFormData({ title: '', author: '', price: '', stock: '', genre: '', description: '' }); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Book
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-sm">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Author</th>
              <th className="p-4">Genre</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {books.map((book) => (
              <tr key={book._id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{book.title}</td>
                <td className="p-4 text-gray-600">{book.author}</td>
                <td className="p-4"><span className="bg-teal-100 text-teal-700 px-2 py-1 rounded text-xs">{book.genre}</span></td>
                <td className="p-4">Rs. {book.price}</td>
                <td className="p-4">{book.stock}</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => handleEdit(book)} className="text-blue-600 hover:text-blue-800"><Edit2 className="w-5 h-5" /></button>
                  <button onClick={() => handleDelete(book._id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-5 h-5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-xl p-6 w-full max-w-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{editingBook ? 'Edit Book' : 'Add New Book'}</h2>
                <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input required placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="input-field" />
                <input required placeholder="Author" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} className="input-field" />
                <div className="grid grid-cols-2 gap-4">
                  <input required type="number" placeholder="Price" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="input-field" />
                  <input required type="number" placeholder="Stock" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="input-field" />
                </div>
                <select value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})} className="input-field">
                  <option value="">Select Genre</option>
                  <option value="Fiction">Fiction</option>
                  <option value="Non-Fiction">Non-Fiction</option>
                  <option value="Mystery">Mystery</option>
                </select>
                <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="input-field" rows="3"></textarea>
                <button type="submit" className="btn-primary w-full">{editingBook ? 'Update' : 'Create'} Book</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageBooks;