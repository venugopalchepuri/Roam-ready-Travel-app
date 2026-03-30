import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Map } from 'lucide-react';
import { destinations } from '../data/destinations';

interface Tag {
  id: string;
  name: string;
  emoji: string;
}

const DestinationsPage: React.FC = () => {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDestinations, setFilteredDestinations] = useState(destinations);
  
  // Extract unique tags
  const tags: Tag[] = [
    { id: 'mountains', name: 'Mountains', emoji: '🏔️' },
    { id: 'beaches', name: 'Beaches', emoji: '🏖️' },
    { id: 'heritage', name: 'Heritage', emoji: '🏛️' },
    { id: 'spiritual', name: 'Spiritual', emoji: '🕌' },
    { id: 'wildlife', name: 'Wildlife', emoji: '🐯' },
    { id: 'adventure', name: 'Adventure', emoji: '🧗‍♀️' },
    { id: 'nature', name: 'Nature', emoji: '🌳' },
    { id: 'islands', name: 'Islands', emoji: '🏝️' },
  ];

  useEffect(() => {
    let results = destinations;
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(
        (dest) =>
          dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dest.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply tag filter
    if (activeTag) {
      results = results.filter((dest) => dest.tags.includes(activeTag));
    }
    
    setFilteredDestinations(results);
  }, [searchTerm, activeTag]);

  const handleTagClick = (tagId: string) => {
    setActiveTag((prev) => (prev === tagId ? null : tagId));
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Explore Indian Destinations</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover the diverse beauty of India with our curated selection of destinations. Filter by type to find your perfect getaway.
          </p>
        </motion.div>

        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg px-4 py-2 border border-gray-300 dark:border-gray-600">
              <Filter size={20} className="text-gray-500 dark:text-gray-400 mr-2" />
              <span className="text-gray-700 dark:text-gray-300 mr-3 hidden md:inline">Filter:</span>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagClick(tag.id)}
                    className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 transition-colors ${
                      activeTag === tag.id
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 border border-primary-300 dark:border-primary-700'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <span role="img" aria-label={tag.name}>
                      {tag.emoji}
                    </span>
                    <span>{tag.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {activeTag && (
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredDestinations.length} destinations
                {activeTag && ` tagged with "${tags.find(t => t.id === activeTag)?.name}"`}
              </div>
              
              <button
                onClick={() => setActiveTag(null)}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                Clear filter
              </button>
            </div>
          )}
        </div>

        {filteredDestinations.length === 0 ? (
          <div className="text-center py-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Map size={60} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No destinations found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search or filter to find more destinations.
              </p>
            </motion.div>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredDestinations.map((destination) => (
              <motion.div
                key={destination.id}
                variants={cardVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="card overflow-hidden group"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={destination.imageUrl}
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 flex flex-wrap justify-end gap-1 max-w-[80%]">
                    {destination.tags.map((tagId) => {
                      const tag = tags.find((t) => t.id === tagId);
                      return tag ? (
                        <span
                          key={tagId}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-black bg-opacity-60 text-white"
                        >
                          <span className="mr-1">{tag.emoji}</span>
                          {tag.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{destination.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    {destination.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {destination.region}, India
                    </span>
                    <button className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DestinationsPage;