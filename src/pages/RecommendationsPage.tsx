import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tripService } from '../services/tripService';
import { recommendationService } from '../services/recommendationService';
import { generateRecommendations, getDistanceTier, getPriorityLabel } from '../logic/recommendationEngine';
import { Trip, RecommendationRule, Recommendation, Priority } from '../types';
import { Navigation, TrendingUp, Clock, IndianRupee, Award, Loader, ArrowLeft } from 'lucide-react';

const RecommendationsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [priority, setPriority] = useState<Priority>('cost');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [rules, setRules] = useState<RecommendationRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedTrip && rules.length > 0) {
      const recs = generateRecommendations(
        { distance: selectedTrip.distance_km, priority },
        rules
      );
      setRecommendations(recs);
    }
  }, [selectedTrip, priority, rules]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tripsData, rulesData] = await Promise.all([
        tripService.getUserTrips(user!.id),
        recommendationService.getRecommendationRules(),
      ]);
      setTrips(tripsData);
      setRules(rulesData);
      if (tripsData.length > 0) {
        setSelectedTrip(tripsData[0]);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size={48} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="section">
        <div className="container-custom">
          <div className="card p-12 text-center">
            <Navigation size={48} className="text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Trips Yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create a trip to get personalized travel recommendations
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Travel Recommendations</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Smart suggestions based on your journey and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="card p-6">
              <label className="block text-sm font-medium mb-2">Select Trip</label>
              <select
                value={selectedTrip?.id || ''}
                onChange={(e) => {
                  const trip = trips.find((t) => t.id === e.target.value);
                  setSelectedTrip(trip || null);
                }}
                className="input w-full"
              >
                {trips.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    {trip.source} → {trip.destination}
                  </option>
                ))}
              </select>
            </div>

            <div className="card p-6">
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="input w-full"
              >
                <option value="cost">Budget-Friendly</option>
                <option value="time">Time-Efficient</option>
                <option value="comfort">Maximum Comfort</option>
              </select>
            </div>

            <div className="card p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-2 border-blue-200 dark:border-blue-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Distance</div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {selectedTrip?.distance_km.toLocaleString('en-IN')} km
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                {selectedTrip && getDistanceTier(selectedTrip.distance_km)}
              </div>
            </div>
          </div>

          {selectedTrip && (
            <>
              <div className="card p-6 mb-8 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
                <h2 className="text-xl font-bold mb-4">Your Journey</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Route</div>
                    <div className="text-lg font-semibold">
                      {selectedTrip.source} → {selectedTrip.destination}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Priority</div>
                    <div className="text-lg font-semibold">{getPriorityLabel(priority)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Travel Dates</div>
                    <div className="text-lg font-semibold">
                      {new Date(selectedTrip.start_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">Recommended Options</h2>
              </div>

              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`card p-6 ${
                      rec.isRecommended
                        ? 'border-2 border-green-500 bg-green-50 dark:bg-green-900/20'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold">{rec.mode}</h3>
                          {rec.isRecommended && (
                            <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                              <Award size={14} />
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">{rec.reason}</p>
                        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                          <TrendingUp size={16} />
                          <span className="font-medium">Book via: {rec.platform}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2 text-green-600 dark:text-green-400">
                          <IndianRupee size={18} />
                          <span className="font-medium">Estimated Cost</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl md:text-4xl font-bold text-green-700 dark:text-green-400">₹{rec.estimatedCost.average.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <span>Low: ₹{rec.estimatedCost.low.toLocaleString('en-IN')}</span>
                          <span>High: ₹{rec.estimatedCost.high.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '50%' }} />
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400">
                          <Clock size={18} />
                          <span className="font-medium">Estimated Time</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold">{rec.estimatedTime}</span>
                          <span className="text-gray-600 dark:text-gray-400">hours</span>
                        </div>
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          {rec.estimatedTime < 12 ? 'Same day arrival' : 'Overnight journey'}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="card p-6 mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Navigation size={18} />
                  Note
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  These are estimated costs and times based on typical prices. Actual prices may vary depending on season, demand, and booking time. We recommend booking in advance for better rates.
                </p>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default RecommendationsPage;
