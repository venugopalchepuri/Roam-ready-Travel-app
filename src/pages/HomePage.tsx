import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { CheckCircle, MapPin, Globe, IndianRupee, Calendar, ArrowDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TestimonialCarousel from '../components/TestimonialCarousel';

const backgroundImages = [
  {
    url: 'https://cdnbbsr.s3waas.gov.in/s3f1981e4bd8a0d6d8462016d2fc6276b3/uploads/2019/04/2019040992.png',
    location: 'Taj Mahal, Agra'
  },
  {
    url: 'https://varanasismartcity.gov.in//assets/images/images/DashashwamedhGhat.jpg',
    location: 'Varanasi Ghats'
  },
  {
    url: 'https://s7ap1.scene7.com/is/image/incredibleindia/city-palace-udaipur-rajasthan-7-musthead-hero?qlt=82&ts=1742177518944',
    location: 'Udaipur City Palace'
  },
  {
    url: 'https://www.lehladakhindia.com/wp-content/uploads/2024/07/pangong-tso-lake.jpeg',
    location: 'Pangong Lake, Ladakh'
  },
  {
    url: 'https://c.ndtvimg.com/2025-08/tv011i6g_kerala-backwaters_625x300_18_August_25.jpeg?im=FeatureCrop,algorithm=dnn,width=1200,height=738',
    location: 'Kerala Backwaters'
  },
  {
    url: 'https://www.tourmyindia.com/states/goa/image/beaches-goa.webp',
    location: 'Goa Beaches'
  }
];

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const featuresRef = useRef<HTMLDivElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <>
      <section className="relative h-screen flex items-center overflow-hidden">
        {/* Background Image Carousel */}
        {backgroundImages.map((image, index) => (
          <motion.div
            key={image.url}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: currentImageIndex === index ? 1 : 0,
              scale: currentImageIndex === index ? 1 : 1.1
            }}
            transition={{ 
              opacity: { duration: 1 },
              scale: { duration: 8 }
            }}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${image.url}')` }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-50" />
            </div>
          </motion.div>
        ))}
        
        {/* Location Caption */}
        <motion.div
          className="absolute bottom-8 right-8 bg-black bg-opacity-50 px-4 py-2 rounded-lg text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm md:text-base">
            {backgroundImages[currentImageIndex].location}
          </p>
        </motion.div>
        
        <div className="container-custom relative z-10 text-white">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 drop-shadow-lg">
              Plan Smarter. Travel Prepared.
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100 drop-shadow-md">
              Your ultimate travel companion for discovering the wonders of India. Plan itineraries, track budgets, and explore with confidence!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <NavLink to="/dashboard" className="btn btn-primary text-base">
                  Go to Dashboard
                </NavLink>
              ) : (
                <>
                  <NavLink to="/signup" className="btn btn-primary text-base">
                    Get Started Free
                  </NavLink>
                  <NavLink to="/login" className="btn btn-outline border-white text-white hover:bg-white hover:bg-opacity-10 text-base">
                    Login
                  </NavLink>
                </>
              )}
              <button
                onClick={scrollToFeatures}
                className="btn btn-outline border-white text-white hover:bg-white hover:bg-opacity-10 text-base"
              >
                Learn More
              </button>
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white cursor-pointer"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          onClick={scrollToFeatures}
        >
          <ArrowDown size={30} />
        </motion.div>
      </section>

      <section ref={featuresRef} className="section bg-white dark:bg-gray-900">
        <div className="container-custom">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-4">
              Plan Your Journey with Ease
            </motion.h2>
            <motion.p variants={itemVariants} className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              RoamReady provides all the tools you need to make your Indian adventure memorable and stress-free.
            </motion.p>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            <motion.div variants={itemVariants} className="card p-6 text-center">
              <div className="bg-primary-100 dark:bg-primary-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={30} className="text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Packing Checklist</h3>
              <p className="text-gray-600 dark:text-gray-400">Never forget essentials with our smart, categorized packing lists</p>
            </motion.div>

            <motion.div variants={itemVariants} className="card p-6 text-center">
              <div className="bg-secondary-100 dark:bg-secondary-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin size={30} className="text-secondary-600 dark:text-secondary-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Destination Explorer</h3>
              <p className="text-gray-600 dark:text-gray-400">Discover incredible Indian destinations with helpful filters</p>
            </motion.div>

            <motion.div variants={itemVariants} className="card p-6 text-center">
              <div className="bg-accent-100 dark:bg-accent-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <IndianRupee size={30} className="text-accent-600 dark:text-accent-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Currency Converter</h3>
              <p className="text-gray-600 dark:text-gray-400">Convert INR to any currency worldwide for seamless travel planning</p>
            </motion.div>

            <motion.div variants={itemVariants} className="card p-6 text-center">
              <div className="bg-primary-100 dark:bg-primary-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Calendar size={30} className="text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Trip Planner</h3>
              <p className="text-gray-600 dark:text-gray-400">Organize your daily activities with our interactive planner</p>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      <section className="section bg-gray-50 dark:bg-gray-800">
        <div className="container-custom">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
            className="text-center mb-12"
          >
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-4">
              What Travelers Say
            </motion.h2>
            <motion.p variants={itemVariants} className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Join thousands of happy travelers who have simplified their journey with RoamReady.
            </motion.p>
          </motion.div>
          
          <TestimonialCarousel />
        </div>
      </section>
      
      <section className="section bg-primary-600 text-white">
        <div className="container-custom">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Your Adventure?
            </h2>
            <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
              Begin planning your dream Indian journey today with our comprehensive travel tools.
            </p>
            {user ? (
              <NavLink to="/trip/new" className="btn bg-white text-primary-600 hover:bg-primary-50 text-base">
                Create Your First Trip
              </NavLink>
            ) : (
              <NavLink to="/signup" className="btn bg-white text-primary-600 hover:bg-primary-50 text-base">
                Get Started Now
              </NavLink>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;