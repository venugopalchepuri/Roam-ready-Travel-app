import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { tripService } from '../services/tripService';
import { checklistService } from '../services/checklistService';
import { emergencyService } from '../services/emergencyService';
import { Trip, ChecklistItem, EmergencyContact } from '../types';
import { AlertTriangle, Phone, FileText, CheckCircle, Circle, Loader } from 'lucide-react';

const PanicModePage: React.FC = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTrips();
    }
  }, [user]);

  useEffect(() => {
    if (selectedTrip) {
      loadTripData();
    }
  }, [selectedTrip]);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const data = await tripService.getUserTrips(user!.id);
      const activeTrip = data.find((t) => new Date(t.start_date) >= new Date()) || data[0];
      setTrips(data);
      setSelectedTrip(activeTrip);
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTripData = async () => {
    if (!selectedTrip) return;
    try {
      const [checklistData, contactsData] = await Promise.all([
        checklistService.getChecklistItems(selectedTrip.id),
        emergencyService.getEmergencyContacts(selectedTrip.id),
      ]);
      setChecklist(checklistData.filter((item) => !item.completed));
      setEmergencyContacts(contactsData);
    } catch (err) {
      console.error('Failed to load trip data:', err);
    }
  };

  const toggleChecklistItem = async (itemId: string, completed: boolean) => {
    try {
      await checklistService.toggleChecklistItem(itemId, !completed);
      await loadTripData();
    } catch (err) {
      console.error('Failed to toggle checklist item:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50 dark:bg-gray-900">
        <Loader size={48} className="animate-spin text-red-600" />
      </div>
    );
  }

  if (!selectedTrip) {
    return (
      <div className="min-h-screen bg-red-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="card p-12 text-center max-w-md">
          <AlertTriangle size={48} className="text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Active Trips</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Create a trip first to access panic mode features
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-red-50 dark:bg-gray-900">
      <div className="section">
        <div className="container-custom max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-600 rounded-full mb-4">
              <AlertTriangle size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2 text-red-600 dark:text-red-400">Panic Mode</h1>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Essential information at your fingertips
            </p>
          </motion.div>

          {trips.length > 1 && (
            <div className="card p-4 mb-6">
              <label className="block text-sm font-medium mb-2">Select Trip</label>
              <select
                value={selectedTrip.id}
                onChange={(e) => {
                  const trip = trips.find((t) => t.id === e.target.value);
                  setSelectedTrip(trip || null);
                }}
                className="input w-full"
              >
                {trips.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    {trip.source} → {trip.destination} ({new Date(trip.start_date).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6 border-2 border-red-600"
            >
              <div className="flex items-center gap-3 mb-4">
                <Phone size={24} className="text-red-600" />
                <h2 className="text-2xl font-bold">Emergency Contacts</h2>
              </div>

              {emergencyContacts.length === 0 ? (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  <p className="mb-4">No emergency contacts added yet</p>
                  <p className="text-sm">Add contacts from your trip details page</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {emergencyContacts.map((contact) => (
                    <div key={contact.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-lg">{contact.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{contact.relationship}</div>
                      </div>
                      <a
                        href={`tel:${contact.phone}`}
                        className="btn bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
                      >
                        <Phone size={16} />
                        {contact.phone}
                      </a>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-bold mb-3">Important Numbers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <a href="tel:100" className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700">
                    <span className="font-medium">Police</span>
                    <span className="text-blue-600 font-bold">100</span>
                  </a>
                  <a href="tel:102" className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700">
                    <span className="font-medium">Ambulance</span>
                    <span className="text-blue-600 font-bold">102</span>
                  </a>
                  <a href="tel:101" className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700">
                    <span className="font-medium">Fire</span>
                    <span className="text-blue-600 font-bold">101</span>
                  </a>
                  <a href="tel:1091" className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700">
                    <span className="font-medium">Women Helpline</span>
                    <span className="text-blue-600 font-bold">1091</span>
                  </a>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <FileText size={24} className="text-blue-600" />
                <h2 className="text-2xl font-bold">Essential Checklist</h2>
              </div>

              {checklist.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle size={48} className="text-green-600 mx-auto mb-3" />
                  <p className="text-lg font-medium text-green-600">All items completed!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {checklist.slice(0, 10).map((item) => (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                      onClick={() => toggleChecklistItem(item.id, item.completed)}
                    >
                      {item.completed ? (
                        <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                      ) : (
                        <Circle size={20} className="text-gray-400 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className={item.completed ? 'line-through text-gray-500' : ''}>
                          {item.item}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {item.category}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6 bg-blue-50 dark:bg-blue-900/20"
            >
              <h3 className="font-bold text-lg mb-3">Quick Tips</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Keep physical copies of important documents</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Save emergency numbers in your phone</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Share your itinerary with family or friends</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Keep your phone charged and carry a power bank</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanicModePage;
