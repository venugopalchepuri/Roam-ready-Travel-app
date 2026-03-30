import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tripService } from '../services/tripService';
import { journeyProgressService, JourneyProgress } from '../services/journeyProgressService';
import { MapPin, Navigation, Loader, TrendingUp, ArrowLeft } from 'lucide-react';
import { Trip } from '../types';

const JourneyTrackerPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [journeyProgress, setJourneyProgress] = useState<JourneyProgress | null>(null);
  const [coveredDistance, setCoveredDistance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      loadTrips();
    }
  }, [user]);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const data = await tripService.getUserTrips(user!.id);
      setTrips(data);

      if (data.length > 0) {
        const activeTrip = data.find((trip) => new Date(trip.start_date) >= new Date()) || data[0];
        setSelectedTrip(activeTrip);
        loadJourneyProgress(activeTrip.id);
      }
    } catch (err: any) {
      console.error('Failed to load trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadJourneyProgress = async (tripId: string) => {
    try {
      const progress = await journeyProgressService.getJourneyProgress(tripId);
      if (progress) {
        setJourneyProgress(progress);
        setCoveredDistance(progress.covered_distance);
      }
    } catch (err: any) {
      console.error('Failed to load journey progress:', err);
    }
  };

  const handleTripChange = async (tripId: string) => {
    const trip = trips.find((t) => t.id === tripId);
    if (trip) {
      setSelectedTrip(trip);
      loadJourneyProgress(trip.id);
    }
  };

  const handleUpdateProgress = async () => {
    if (!selectedTrip || !journeyProgress) return;

    setUpdating(true);
    try {
      await journeyProgressService.updateCoveredDistance(selectedTrip.id, coveredDistance);
      setJourneyProgress({
        ...journeyProgress,
        covered_distance: coveredDistance,
      });
    } catch (err: any) {
      console.error('Failed to update progress:', err);
    } finally {
      setUpdating(false);
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
        <div className="container-custom max-w-3xl">
          <div className="card p-12 text-center">
            <MapPin size={64} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">No Trips Yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first trip to start tracking your journey progress
            </p>
          </div>
        </div>
      </div>
    );
  }

  const progress = journeyProgress
    ? journeyProgressService.calculateProgress(journeyProgress.total_distance, journeyProgress.covered_distance)
    : 0;

  const remainingDistance = journeyProgress
    ? journeyProgress.total_distance - journeyProgress.covered_distance
    : 0;

  return (
    <div className="section">
      <div className="container-custom max-w-4xl">
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
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Journey Progress Tracker</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track how far you've come on your journey
            </p>
          </div>

          <div className="card p-6 mb-6">
            <label className="block text-sm font-medium mb-2">Select Trip</label>
            <select
              value={selectedTrip?.id || ''}
              onChange={(e) => handleTripChange(e.target.value)}
              className="input w-full"
            >
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.source} → {trip.destination} ({new Date(trip.start_date).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          {selectedTrip && journeyProgress && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="card p-8 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={20} className="text-blue-600" />
                    <h2 className="text-xl font-bold">
                      {selectedTrip.source} → {selectedTrip.destination}
                    </h2>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(selectedTrip.start_date).toLocaleDateString()} - {new Date(selectedTrip.end_date).toLocaleDateString()}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{journeyProgress.total_distance} km</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Distance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{journeyProgress.covered_distance} km</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Covered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">{remainingDistance} km</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Remaining</div>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm font-bold text-blue-600">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-gradient-to-r from-blue-600 to-green-600 flex items-center justify-end pr-2"
                    >
                      {progress > 10 && (
                        <Navigation size={16} className="text-white" />
                      )}
                    </motion.div>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">Update Progress</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Covered Distance (km)
                    </label>
                    <input
                      type="number"
                      value={coveredDistance}
                      onChange={(e) => setCoveredDistance(parseFloat(e.target.value) || 0)}
                      className="input w-full"
                      min="0"
                      max={journeyProgress.total_distance}
                      step="0.1"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Enter the distance you have covered so far
                    </p>
                  </div>
                  <button
                    onClick={handleUpdateProgress}
                    className="btn btn-primary w-full flex items-center justify-center gap-2"
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <TrendingUp size={20} />
                        Update Progress
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default JourneyTrackerPage;