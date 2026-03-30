import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Search, Filter } from 'lucide-react';
import { bookingServices, categories, BookingService } from '../data/bookingServices';

const BookingsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = bookingServices.filter((service) => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="section">
      <div className="container-custom">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Travel Bookings</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Quick access to India's top travel booking platforms
            </p>
          </div>

          <div className="card p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input w-full pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-gray-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input min-w-[150px]"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              All Services
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredServices.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  No services found matching your criteria
                </p>
              </div>
            ) : (
              filteredServices.map((service) => (
                <motion.a
                  key={service.id}
                  href={service.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={itemVariants}
                  className="card p-6 hover:shadow-xl transition-all group cursor-pointer overflow-hidden"
                >
                  <div
                    className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${service.color}`}
                  />
                  <div className="pt-2">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {service.name}
                      </h3>
                      <ExternalLink
                        size={20}
                        className="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0 ml-2"
                      />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                      {service.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {service.features.map((feature, index) => (
                        <span
                          key={index}
                          className="inline-block bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span
                        className={`inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${service.color} bg-clip-text text-transparent`}
                      >
                        Visit Website
                        <ExternalLink size={14} className="text-blue-600 dark:text-blue-400" />
                      </span>
                    </div>
                  </div>
                </motion.a>
              ))
            )}
          </motion.div>

          <div className="card p-8 mt-12 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border-2 border-blue-200 dark:border-blue-800">
            <h2 className="text-2xl font-bold mb-4">Booking Tips</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h3 className="font-semibold mb-1">Compare Prices</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Check multiple platforms to find the best deals and offers
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">⏰</span>
                <div>
                  <h3 className="font-semibold mb-1">Book Early</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Advance bookings often provide better prices and availability
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">🔔</span>
                <div>
                  <h3 className="font-semibold mb-1">Set Price Alerts</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Use platforms like Ixigo to get notified of price drops
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">📱</span>
                <div>
                  <h3 className="font-semibold mb-1">Use Mobile Apps</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Mobile apps often have exclusive deals and easier booking
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">🎫</span>
                <div>
                  <h3 className="font-semibold mb-1">Check Cancellation Policy</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Always review refund and cancellation terms before booking
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">💳</span>
                <div>
                  <h3 className="font-semibold mb-1">Use Credit Cards</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get additional discounts and cashback with card offers
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BookingsPage;
