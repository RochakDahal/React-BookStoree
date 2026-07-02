import { motion } from 'framer-motion';
import { BookOpen, Award, Users, Target, Heart, Globe } from 'lucide-react';

const About = () => {
  const team = [
    {
      name: 'Rochak Dahal',
      role: 'CEO & Founder',
      image: 'https://images.pexels.com/photos/3778928/pexels-photo-3778928.jpeg?w=400&h=400&fit=crop',
      bio: 'Passionate about making literature accessible to everyone'
    },
    {
      name: 'Prashant Dahal',
      role: 'CTO',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      bio: 'Building technology that connects readers with great books'
    },
    {
      name: 'Kailash Thapa',
      role: 'Head Editor',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      bio: 'Curating the finest collection of literary works'
    }
  ];

  const values = [
    {
      icon: BookOpen,
      title: 'Quality Content',
      description: 'We carefully curate every book in our collection to ensure the highest quality',
      color: 'from-teal-500 to-cyan-500'
    },
    {
      icon: Heart,
      title: 'Customer First',
      description: 'Your satisfaction is our priority. We provide exceptional service always',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Connecting readers worldwide with diverse literary perspectives',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: Target,
      title: 'Innovation',
      description: 'Continuously evolving to provide the best reading experience',
      color: 'from-purple-500 to-violet-500'
    }
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-teal-50">
    
      <section className="bg-linear-to-br from-teal-600 to-cyan-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold mb-6"
          >
            About BookShell
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-teal-100 max-w-3xl mx-auto"
          >
            We've transformed traditional publishing into a dynamic digital ecosystem, 
            making literature accessible to everyone, everywhere.
          </motion.p>
        </div>
      </section>

      
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '25K+', label: 'Awards Won', icon: Award },
              { value: '1M+', label: 'Active Readers', icon: Users },
              { value: '100K+', label: 'Books Available', icon: BookOpen },
              { value: '4.9', label: 'Average Rating', icon: Heart }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl bg-linear-to-br from-gray-50 to-teal-50"
              >
                <stat.icon className="w-12 h-12 mx-auto mb-4 text-teal-600" />
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

     
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600 text-lg">
                <p>
                  Founded in 2015, BookShell began with a simple mission: to make great literature 
                  accessible to everyone. What started as a small bookstore has grown into a 
                  thriving digital platform serving over a million readers.
                </p>
                <p>
                  We believe in the power of stories to transform lives, challenge perspectives, 
                  and inspire growth. Our curated collection features both timeless classics and 
                  contemporary masterpieces from around the world.
                </p>
                <p>
                  Today, we continue to innovate and expand, bringing you the best reading 
                  experience with secure payments, fast delivery, and exceptional customer service.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <img
                  src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&h=500&fit=crop"
                  alt="Bookstore"
                  className="rounded-2xl shadow-lg w-full h-64 object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&h=500&fit=crop"
                  alt="Reading"
                  className="rounded-2xl shadow-lg w-full h-64 object-cover mt-8"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <div className="w-24 h-1 bg-linear-to-r from-teal-500 to-cyan-500 mx-auto rounded-full"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="text-center p-6 rounded-2xl bg-gray-50 hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-16 h-16 mx-auto mb-4 bg-linear-to-br ${value.color} rounded-2xl flex items-center justify-center`}>
                  <value.icon className="text-white w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

   
      <section className="py-20 bg-linear-to-br from-gray-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <div className="w-24 h-1 bg-linear-to-r from-teal-500 to-cyan-500 mx-auto rounded-full"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="h-64 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-teal-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;