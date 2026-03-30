import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tripService } from '../services/tripService';
import { Trip } from '../types';
import { MapPin, Calendar, IndianRupee, CheckCircle, Navigation, ArrowLeft, Loader, CreditCard as Edit, Trash2 } from 'lucide-react';

type TabType = 'overview' | 'planner' | 'recommendations' | 'budget' | 'checklist';

const TripDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  useEffect(() => {
    if (id && user) {
      loadTrip();
    }
  }, [id, user]);

  const loadTrip = async () => {
    try {
      setLoading(true);
      const data = await tripService.getTripById(id!);
      setTrip(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load trip');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return;

    try {
      await tripService.deleteTrip(id!);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to delete trip');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size={48} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="section">
        <div className="container-custom max-w-3xl">
          <div className="card p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || 'Trip not found'}
            </p>
            <NavLink to="/dashboard" className="btn btn-primary">
              Back to Dashboard
            </NavLink>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: MapPin },
    { id: 'planner', label: 'Planner', icon: Calendar },
    { id: 'recommendations', label: 'Recommendations', icon: Navigation },
    { id: 'budget', label: 'Budget', icon: IndianRupee },
    { id: 'checklist', label: 'Checklist', icon: CheckCircle },
  ] as const;

  return (
    <div className="section">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </button>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {trip.destination}
                </h1>
                <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>From {trip.source}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>
                      {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  {trip.distance_km && (
                    <div className="flex items-center gap-2">
                      <Navigation size={16} />
                      <span>{trip.distance_km} km</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/trip/edit/${trip.id}`)}
                  className="btn btn-outline btn-sm flex items-center gap-2"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="btn btn-outline btn-sm flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-1 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="card p-6">
                  <h3 className="text-xl font-bold mb-4">Trip Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400">Source</label>
                      <p className="font-medium">{trip.source}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400">Destination</label>
                      <p className="font-medium">{trip.destination}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400">Start Date</label>
                      <p className="font-medium">{new Date(trip.start_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400">End Date</label>
                      <p className="font-medium">{new Date(trip.end_date).toLocaleDateString()}</p>
                    </div>
                    {trip.distance_km && (
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400">Distance</label>
                        <p className="font-medium">{trip.distance_km} km</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <NavLink
                    to={`/planner?trip=${trip.id}`}
                    className="card p-5 hover:shadow-lg transition-all"
                  >
                    <Calendar size={28} className="text-blue-600 dark:text-blue-400 mb-2" />
                    <h3 className="text-lg font-bold mb-1">Plan Itinerary</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Organize activities</p>
                  </NavLink>

                  <NavLink
                    to={`/expenses?trip=${trip.id}`}
                    className="card p-5 hover:shadow-lg transition-all"
                  >
                    <IndianRupee size={28} className="text-green-600 dark:text-green-400 mb-2" />
                    <h3 className="text-lg font-bold mb-1">Manage Budget</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Track expenses</p>
                  </NavLink>

                  <NavLink
                    to={`/checklist?trip=${trip.id}`}
                    className="card p-5 hover:shadow-lg transition-all"
                  >
                    <CheckCircle size={28} className="text-purple-600 dark:text-purple-400 mb-2" />
                    <h3 className="text-lg font-bold mb-1">Packing List</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Get ready</p>
                  </NavLink>
                </div>
              </div>
            )}

            {activeTab === 'planner' && (
              <div className="card p-6">
                <h3 className="text-xl font-bold mb-4">Trip Planner</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Plan your daily activities and create your itinerary.
                </p>
                <NavLink
                  to={`/planner?trip=${trip.id}`}
                  className="btn btn-primary"
                >
                  Open Planner
                </NavLink>
              </div>
            )}

            {activeTab === 'recommendations' && (
              <div className="card p-6">
                <h3 className="text-xl font-bold mb-4">Travel Recommendations</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Get personalized recommendations for your trip.
                </p>
                <NavLink
                  to={`/recommendations?trip=${trip.id}`}
                  className="btn btn-primary"
                >
                  View Recommendations
                </NavLink>
              </div>
            )}

            {activeTab === 'budget' && (
              <div className="card p-6">
                <h3 className="text-xl font-bold mb-4">Budget & Expenses</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Track your trip expenses and manage your budget.
                </p>
                <NavLink
                  to={`/expenses?trip=${trip.id}`}
                  className="btn btn-primary"
                >
                  Manage Budget
                </NavLink>
              </div>
            )}

            {activeTab === 'checklist' && (
              <div className="card p-6">
                <h3 className="text-xl font-bold mb-4">Packing Checklist</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Create and manage your packing checklist.
                </p>
                <NavLink
                  to={`/checklist?trip=${trip.id}`}
                  className="btn btn-primary"
                >
                  View Checklist
                </NavLink>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TripDetailPage;
