import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Bell, Plus, Check, X, Calendar, Clock, ArrowLeft } from 'lucide-react';
import * as reminderService from '../services/reminderService';
import { SmartReminder } from '../types';

export default function RemindersPage() {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState<SmartReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    reminder_type: 'custom' as SmartReminder['reminder_type'],
    title: '',
    description: '',
    reminder_time: ''
  });

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const data = await reminderService.getReminders();
      setReminders(data);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await reminderService.addReminder({
        ...formData,
        is_recurring: false,
        status: 'pending'
      });
      setShowAddForm(false);
      setFormData({
        reminder_type: 'custom',
        title: '',
        description: '',
        reminder_time: ''
      });
      loadReminders();
    } catch (error) {
      console.error('Error adding reminder:', error);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await reminderService.dismissReminder(id);
      loadReminders();
    } catch (error) {
      console.error('Error dismissing reminder:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;
    try {
      await reminderService.deleteReminder(id);
      loadReminders();
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const reminderTypes = [
    { value: 'check-in', label: 'Check-in' },
    { value: 'visa', label: 'Visa' },
    { value: 'vaccination', label: 'Vaccination' },
    { value: 'document', label: 'Document' },
    { value: 'currency', label: 'Currency Exchange' },
    { value: 'packing', label: 'Packing' },
    { value: 'custom', label: 'Custom' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-700';
      case 'sent': return 'bg-green-100 text-green-700';
      case 'dismissed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const isPast = (reminderTime: string) => {
    return new Date(reminderTime) < new Date();
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Smart Reminders</h1>
            <p className="mt-2 text-gray-600">Never miss important travel tasks</p>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Reminder
          </Button>
        </div>

        {showAddForm && (
          <Card className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Add New Reminder</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reminder Type
                </label>
                <select
                  value={formData.reminder_type}
                  onChange={(e) => setFormData({ ...formData, reminder_type: e.target.value as SmartReminder['reminder_type'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {reminderTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Apply for US Visa"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Additional details..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reminder Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.reminder_time}
                  onChange={(e) => setFormData({ ...formData, reminder_time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Add Reminder</Button>
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
        ) : reminders.length === 0 ? (
          <Card className="text-center py-12">
            <Bell className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No reminders yet</h3>
            <p className="text-gray-600 mb-4">Set reminders for important travel tasks</p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Reminder
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <Card key={reminder.id} className={isPast(reminder.reminder_time) ? 'opacity-75' : ''}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Bell className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">{reminder.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reminder.status)}`}>
                        {reminder.status}
                      </span>
                    </div>

                    {reminder.description && (
                      <p className="text-gray-600 text-sm mb-2 ml-8">{reminder.description}</p>
                    )}

                    <div className="flex items-center gap-4 ml-8 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(reminder.reminder_time).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(reminder.reminder_time).toLocaleTimeString()}</span>
                      </div>
                      <span className="capitalize px-2 py-0.5 bg-gray-100 rounded text-xs">
                        {reminder.reminder_type.replace('-', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {reminder.status === 'pending' && (
                      <button
                        onClick={() => handleDismiss(reminder.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Dismiss"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(reminder.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
