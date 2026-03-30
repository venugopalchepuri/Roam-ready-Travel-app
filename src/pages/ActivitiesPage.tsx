import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Calendar, MapPin, Users, DollarSign, Plus, Clock, Trash2 } from 'lucide-react';
import * as activityService from '../services/activityService';
import { ActivityBooking } from '../types';

export default function ActivitiesPage() {
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('tripId');
  const [activities, setActivities] = useState<ActivityBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    activity_name: '',
    provider: '',
    booking_reference: '',
    activity_type: 'tour' as ActivityBooking['activity_type'],
    location: '',
    date: '',
    time: '',
    duration_hours: '',
    participants: '1',
    cost: '',
    currency: 'INR'
  });

  useEffect(() => {
    if (tripId) loadActivities();
  }, [tripId]);

  const loadActivities = async () => {
    if (!tripId) return;
    try {
      const data = await activityService.getActivities(tripId);
      setActivities(data);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId) return;

    try {
      await activityService.addActivity({
        ...formData,
        trip_id: tripId,
        duration_hours: formData.duration_hours ? parseFloat(formData.duration_hours) : undefined,
        participants: parseInt(formData.participants),
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        status: 'booked'
      });
      setShowAddForm(false);
      setFormData({
        activity_name: '',
        provider: '',
        booking_reference: '',
        activity_type: 'tour',
        location: '',
        date: '',
        time: '',
        duration_hours: '',
        participants: '1',
        cost: '',
        currency: 'INR'
      });
      loadActivities();
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    try {
      await activityService.deleteActivity(id);
      loadActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  const activityTypes = [
    { value: 'tour', label: 'Tour' },
    { value: 'attraction', label: 'Attraction' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'food', label: 'Food & Dining' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'entertainment', label: 'Entertainment' }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Activities & Experiences</h1>
            <p className="mt-2 text-gray-600">Book and manage your activities</p>
          </div>
          {tripId && (
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Activity
            </Button>
          )}
        </div>

        {showAddForm && (
          <Card className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Add New Activity</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Activity Name</label>
                  <input
                    type="text"
                    value={formData.activity_name}
                    onChange={(e) => setFormData({ ...formData, activity_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., City Tour"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
                  <select
                    value={formData.activity_type}
                    onChange={(e) => setFormData({ ...formData, activity_type: e.target.value as ActivityBooking['activity_type'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {activityTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Mumbai"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.duration_hours}
                    onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                  <input
                    type="text"
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., GetYourGuide"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Booking Reference</label>
                  <input
                    type="text"
                    value={formData.booking_reference}
                    onChange={(e) => setFormData({ ...formData, booking_reference: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Booking ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Participants</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.participants}
                    onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
                  <div className="flex gap-2">
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Amount"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Add Activity</Button>
                <Button type="button" onClick={() => setShowAddForm(false)} className="bg-gray-500 hover:bg-gray-600">
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : activities.length === 0 ? (
          <Card className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No activities booked yet</h3>
            <p className="text-gray-600 mb-4">Start adding activities and experiences for your trip</p>
            {tripId && (
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Activity
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity) => (
              <Card key={activity.id}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full capitalize">
                      {activity.activity_type}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(activity.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-semibold text-gray-900 text-lg mb-2">{activity.activity_name}</h3>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{activity.location}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(activity.date).toLocaleDateString()}</span>
                    {activity.time && <span>at {activity.time}</span>}
                  </div>

                  {activity.duration_hours && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{activity.duration_hours} hours</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{activity.participants} {activity.participants === 1 ? 'person' : 'people'}</span>
                  </div>

                  {activity.cost && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-medium">{activity.currency} {activity.cost}</span>
                    </div>
                  )}

                  {activity.provider && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500">
                        Provider: <span className="font-medium">{activity.provider}</span>
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
