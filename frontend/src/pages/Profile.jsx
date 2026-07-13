// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { User, Mail, MapPin, Phone, Edit2, Save } from 'lucide-react';

const Profile = () => {
  const { user, token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    gender: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        gender: user.gender || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsEditing(false);
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Please login to view profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-linear-to-r from-teal-500 to-cyan-500 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-teal-500" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {user.firstName} {user.lastName}
                  </h1>
                  <p className="text-white/80">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
              >
                {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                {isEditing ? 'Save' : 'Edit'}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                      isEditing ? 'border-gray-300' : 'border-gray-100 bg-gray-50'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                      isEditing ? 'border-gray-300' : 'border-gray-100 bg-gray-50'
                    }`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full pl-10 pr-4 py-2 border border-gray-100 bg-gray-50 rounded-lg"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                        isEditing ? 'border-gray-300' : 'border-gray-100 bg-gray-50'
                      }`}
                      placeholder="9841234567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                      isEditing ? 'border-gray-300' : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer Not to Say">Prefer Not to Say</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                        isEditing ? 'border-gray-300' : 'border-gray-100 bg-gray-50'
                      }`}
                      placeholder="Kathmandu, Nepal"
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  type="submit"
                  disabled={loading}
                  className="mt-6 w-full py-3 bg-linear-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </motion.button>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;