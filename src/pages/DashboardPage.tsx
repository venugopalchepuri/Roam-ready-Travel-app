import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tripService } from '../services/tripService';
import { TripWithScore } from '../types';
import { getScoreStatus } from '../logic/preparednessCalculator';
import { calculateTripDuration, getTripStatus, getDaysUntilTrip } from '../utils/travelCalculations';
import { MapPin, Calendar, Navigation, AlertTriangle, Plus, Loader, CheckCircle, MessageCircle, IndianRupee, BookOpen, Ticket, Clock } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<TripWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadTrips();
    }
  }, [user]);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const data = await tripService.getTripsWithScores(user!.id);
      setTrips(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const activeTrip = trips.find((trip) => getTripStatus(trip.start_date, trip.end_date) === 'ongoing') ||
                     trips.find((trip) => getTripStatus(trip.start_date, trip.end_date) === 'upcoming');

  const upcomingTrips = trips.filter(trip => getTripStatus(trip.start_date, trip.end_date) === 'upcoming');
  const ongoingTrips = trips.filter(trip => getTripStatus(trip.start_date, trip.end_date) === 'ongoing');
  const pastTrips = trips.filter(trip => getTripStatus(trip.start_date, trip.end_date) === 'past');

  const getStatusBadge = (status: 'upcoming' | 'ongoing' | 'past') => {
    const styles = {
      upcoming: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      ongoing: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      past: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
    };

    const labels = {
      upcoming: 'Upcoming',
      ongoing: 'Ongoing',
      past: 'Past'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size={48} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container-custom">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Welcome back, {user?.full_name || 'Traveler'}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Let's make your next adventure unforgettable
            </p>
          </motion.div>

          {error && (
            <motion.div variants={itemVariants} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </motion.div>
          )}

          {trips.length > 0 && (
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="card p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Upcoming Trips</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{upcomingTrips.length}</p>
                  </div>
                  <Calendar size={40} className="text-blue-600 dark:text-blue-400 opacity-50" />
                </div>
              </div>

              <div className="card p-5 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ongoing Trips</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{ongoingTrips.length}</p>
                  </div>
                  <Navigation size={40} className="text-green-600 dark:text-green-400 opacity-50" />
                </div>
              </div>

              <div className="card p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed Trips</p>
                    <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">{pastTrips.length}</p>
                  </div>
                  <CheckCircle size={40} className="text-gray-600 dark:text-gray-400 opacity-50" />
                </div>
              </div>
            </motion.div>
          )}

          {activeTrip && (
            <motion.div variants={itemVariants} className="card p-6 mb-8 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-2xl font-bold">
                      {getTripStatus(activeTrip.start_date, activeTrip.end_date) === 'ongoing' ? 'Ongoing Trip' : 'Next Trip'}
                    </h2>
                    {getStatusBadge(getTripStatus(activeTrip.start_date, activeTrip.end_date))}
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-1">
                    <MapPin size={18} />
                    <span className="font-medium">{activeTrip.source} → {activeTrip.destination}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                    <Calendar size={16} />
                    <span className="text-sm">
                      {new Date(activeTrip.start_date).toLocaleDateString()} - {new Date(activeTrip.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Clock size={16} />
                    <span className="text-sm">{calculateTripDuration(activeTrip.start_date, activeTrip.end_date)}</span>
                  </div>
                  {getTripStatus(activeTrip.start_date, activeTrip.end_date) === 'upcoming' && getDaysUntilTrip(activeTrip.start_date) > 0 && (
                    <div className="mt-2 inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {getDaysUntilTrip(activeTrip.start_date)} {getDaysUntilTrip(activeTrip.start_date) === 1 ? 'day' : 'days'} to go
                    </div>
                  )}
                </div>
              </div>

              {activeTrip.preparedness_score && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Preparedness Score</span>
                    <span className={`text-lg font-bold ${getScoreStatus(activeTrip.preparedness_score.score).color}`}>
                      {activeTrip.preparedness_score.score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${activeTrip.preparedness_score.score}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full ${
                        activeTrip.preparedness_score.score >= 71
                          ? 'bg-green-600'
                          : activeTrip.preparedness_score.score >= 41
                          ? 'bg-yellow-600'
                          : 'bg-red-600'
                      }`}
                    />
                  </div>
                  <p className={`text-sm mt-2 font-medium ${getScoreStatus(activeTrip.preparedness_score.score).color}`}>
                    {getScoreStatus(activeTrip.preparedness_score.score).label}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle size={16} className="text-blue-600" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Checklist</span>
                  </div>
                  <p className="text-lg font-bold">{activeTrip.preparedness_score?.checklist_completion || 0}%</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={16} className="text-green-600" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Itinerary</span>
                  </div>
                  <p className="text-lg font-bold">{activeTrip.preparedness_score?.itinerary_completion || 0}%</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={16} className="text-red-600" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Emergency</span>
                  </div>
                  <p className="text-lg font-bold">{activeTrip.preparedness_score?.emergency_info_complete ? 'Yes' : 'No'}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Navigation size={16} className="text-yellow-600" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Budget</span>
                  </div>
                  <p className="text-lg font-bold">{activeTrip.preparedness_score?.budget_added ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTrip && (
            <motion.div variants={itemVariants} className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Continue Planning</h2>
              <NavLink
                to={`/planner?trip=${activeTrip.id}`}
                className="card p-6 hover:shadow-lg transition-all bg-gradient-to-r from-blue-600 to-blue-700 text-white flex items-center justify-between"
              >
                <div>
                  <h3 className="text-xl font-bold mb-2">Complete Your Trip Plan</h3>
                  <p className="text-blue-100">Continue organizing your {activeTrip.destination} trip</p>
                </div>
                <Calendar size={48} className="opacity-75" />
              </NavLink>
            </motion.div>
          )}

          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Planning</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <NavLink to="/trip/new" className="card p-5 hover:shadow-lg transition-all hover:scale-105 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                <Plus size={28} className="mb-2" />
                <h3 className="text-lg font-bold mb-1">New Trip</h3>
                <p className="text-blue-100 text-xs">Start planning your journey</p>
              </NavLink>

              <NavLink to="/planner" className="card p-5 hover:shadow-lg transition-all hover:scale-105">
                <Calendar size={28} className="text-blue-600 dark:text-blue-400 mb-2" />
                <h3 className="text-lg font-bold mb-1">Trip Planner</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Organize your itinerary</p>
              </NavLink>

              <NavLink to="/destinations" className="card p-5 hover:shadow-lg transition-all hover:scale-105">
                <MapPin size={28} className="text-green-600 dark:text-green-400 mb-2" />
                <h3 className="text-lg font-bold mb-1">Destinations</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Explore Indian locations</p>
              </NavLink>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Travel Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <NavLink to="/converter" className="card p-5 hover:shadow-lg transition-all hover:scale-105">
                <IndianRupee size={28} className="text-yellow-600 dark:text-yellow-400 mb-2" />
                <h3 className="text-lg font-bold mb-1">Currency Converter</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Convert currencies</p>
              </NavLink>

              <NavLink to="/checklist" className="card p-5 hover:shadow-lg transition-all hover:scale-105">
                <CheckCircle size={28} className="text-purple-600 dark:text-purple-400 mb-2" />
                <h3 className="text-lg font-bold mb-1">Checklist</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Pack smart</p>
              </NavLink>

              <NavLink to="/expenses" className="card p-5 hover:shadow-lg transition-all hover:scale-105">
                <Ticket size={28} className="text-green-600 dark:text-green-400 mb-2" />
                <h3 className="text-lg font-bold mb-1">Expenses</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Track spending</p>
              </NavLink>

              <NavLink to="/journal" className="card p-5 hover:shadow-lg transition-all hover:scale-105">
                <BookOpen size={28} className="text-teal-600 dark:text-teal-400 mb-2" />
                <h3 className="text-lg font-bold mb-1">Travel Journal</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Record memories</p>
              </NavLink>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Support</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <NavLink to="/chatbot" className="card p-5 hover:shadow-lg transition-all hover:scale-105">
                <MessageCircle size={28} className="text-cyan-600 dark:text-cyan-400 mb-2" />
                <h3 className="text-lg font-bold mb-1">AI Assistant</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Get instant travel help</p>
              </NavLink>

              <NavLink to="/panic" className="card p-5 hover:shadow-lg transition-all hover:scale-105">
                <AlertTriangle size={28} className="text-red-600 dark:text-red-400 mb-2" />
                <h3 className="text-lg font-bold mb-1">Panic Mode</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Emergency assistance</p>
              </NavLink>

              <NavLink to="/recommendations" className="card p-5 hover:shadow-lg transition-all hover:scale-105">
                <Navigation size={28} className="text-orange-600 dark:text-orange-400 mb-2" />
                <h3 className="text-lg font-bold mb-1">Recommendations</h3>
                <p className="text-gray-600 dark:text-gray-400 text-xs">Personalized suggestions</p>
              </NavLink>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Your Trips</h2>
              <NavLink to="/trip/new" className="btn btn-primary btn-sm">
                <Plus size={16} className="mr-1" />
                Add Trip
              </NavLink>
            </div>

            {trips.length === 0 ? (
              <div className="card p-12 text-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
                <div className="max-w-md mx-auto">
                  <MapPin size={64} className="text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-3">Ready for Your Next Adventure?</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Create your first trip and let us guide you through planning the perfect journey!
                  </p>
                  <NavLink to="/trip/new" className="btn btn-primary inline-flex items-center gap-2">
                    <Plus size={20} />
                    Create Your First Trip
                  </NavLink>
                  <div className="mt-8 grid grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      <CheckCircle size={24} className="mx-auto mb-2 text-green-600" />
                      <p className="font-medium">Smart Planning</p>
                    </div>
                    <div>
                      <IndianRupee size={24} className="mx-auto mb-2 text-green-600" />
                      <p className="font-medium">Budget Tracking</p>
                    </div>
                    <div>
                      <Navigation size={24} className="mx-auto mb-2 text-green-600" />
                      <p className="font-medium">AI Recommendations</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trips.map((trip) => {
                  const tripStatus = getTripStatus(trip.start_date, trip.end_date);
                  const duration = calculateTripDuration(trip.start_date, trip.end_date);
                  const daysUntil = tripStatus === 'upcoming' ? getDaysUntilTrip(trip.start_date) : null;

                  return (
                    <NavLink
                      key={trip.id}
                      to={`/trip/${trip.id}`}
                      className="card p-6 hover:shadow-lg transition-all hover:scale-105 group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold group-hover:text-blue-600 transition-colors">{trip.destination}</h3>
                            {getStatusBadge(tripStatus)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <MapPin size={14} />
                            <span>From {trip.source}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <Clock size={14} />
                            <span>{duration}</span>
                          </div>
                          {trip.distance_km && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Navigation size={14} />
                              <span>{trip.distance_km} km</span>
                            </div>
                          )}
                        </div>
                        {trip.preparedness_score && (
                          <div className={`text-2xl font-bold ${getScoreStatus(trip.preparedness_score.score).color}`}>
                            {trip.preparedness_score.score}%
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <Calendar size={14} className="inline mr-1" />
                        {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                      </div>
                      {daysUntil !== null && daysUntil > 0 && (
                        <div className="mb-3">
                          <span className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs font-medium">
                            {daysUntil} {daysUntil === 1 ? 'day' : 'days'} to go
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">View Details</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </div>
                    </NavLink>
                  );
                })}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
