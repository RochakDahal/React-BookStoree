import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Home, Calendar } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  if (!user) return <div className="text-center py-20">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-teal-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-linear-to-r from-teal-500 to-cyan-500 px-8 py-10 text-white text-center">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/30">
              <User className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold">{user.firstName} {user.lastName}</h1>
            <p className="text-teal-100 mt-1 capitalize">{user.role} Account</p>
          </div>

          {/* Details */}
          <div className="p-8 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-3">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-teal-500 mt-1" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
                  <p className="text-gray-800 font-medium">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-teal-500 mt-1" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Phone</p>
                  <p className="text-gray-800 font-medium">{user.phone || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Home className="w-5 h-5 text-teal-500 mt-1" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">City</p>
                  <p className="text-gray-800 font-medium">{user.city || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-teal-500 mt-1" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Member Since</p>
                  <p className="text-gray-800 font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-4 border-t">
              <MapPin className="w-5 h-5 text-teal-500 mt-1" />
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Full Address</p>
                <p className="text-gray-800 font-medium">{user.address || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;