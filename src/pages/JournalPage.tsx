import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { tripService } from '../services/tripService';
import { tripNotesService, TripNote } from '../services/tripNotesService';
import { Trip } from '../types';
import { BookOpen, PlusCircle, Edit2, Trash2, Save, X, Loader } from 'lucide-react';

const JournalPage: React.FC = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [notes, setNotes] = useState<TripNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<TripNote | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    day: 1,
    content: '',
  });

  useEffect(() => {
    if (user) {
      loadTrips();
    }
  }, [user]);

  useEffect(() => {
    if (selectedTrip) {
      loadNotes();
    }
  }, [selectedTrip]);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const data = await tripService.getUserTrips(user!.id);
      setTrips(data);
      if (data.length > 0) {
        setSelectedTrip(data[0]);
      }
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = async () => {
    if (!selectedTrip) return;
    try {
      const data = await tripNotesService.getTripNotes(selectedTrip.id);
      setNotes(data);
    } catch (err) {
      console.error('Failed to load notes:', err);
    }
  };

  const getTripDays = () => {
    if (!selectedTrip) return 1;
    const start = new Date(selectedTrip.start_date);
    const end = new Date(selectedTrip.end_date);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return days;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrip) return;

    try {
      if (editingNote) {
        await tripNotesService.updateNote(editingNote.id, formData.content);
      } else {
        await tripNotesService.createNote({
          trip_id: selectedTrip.id,
          day: formData.day,
          content: formData.content,
        });
      }
      await loadNotes();
      setShowForm(false);
      setEditingNote(null);
      setFormData({ day: 1, content: '' });
    } catch (err) {
      console.error('Failed to save note:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this journal entry?')) return;
    try {
      await tripNotesService.deleteNote(id);
      await loadNotes();
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  const handleEdit = (note: TripNote) => {
    setEditingNote(note);
    setFormData({
      day: note.day,
      content: note.content,
    });
    setShowForm(true);
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
            <BookOpen size={48} className="text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Trips Yet</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Create a trip to start your travel journal
            </p>
          </div>
        </div>
      </div>
    );
  }

  const tripDays = getTripDays();

  return (
    <div className="section">
      <div className="container-custom max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Travel Journal</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Document your journey, day by day
            </p>
          </div>

          <div className="card p-6 mb-8">
            <label className="block text-sm font-medium mb-2">Select Trip</label>
            <select
              value={selectedTrip?.id || ''}
              onChange={(e) => {
                const trip = trips.find((t) => t.id === e.target.value);
                setSelectedTrip(trip || null);
              }}
              className="input w-full max-w-md"
            >
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.source} → {trip.destination} ({new Date(trip.start_date).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div className="card p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Journal Entries</h2>
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  setEditingNote(null);
                  setFormData({ day: 1, content: '' });
                }}
                className="btn btn-primary flex items-center gap-2"
              >
                <PlusCircle size={20} />
                New Entry
              </button>
            </div>

            {showForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                onSubmit={handleSubmit}
                className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-6"
              >
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Day</label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: parseInt(e.target.value) })}
                    className="input w-full max-w-xs"
                    required
                    disabled={!!editingNote}
                  >
                    {Array.from({ length: tripDays }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day}>
                        Day {day}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Your Thoughts</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="input w-full min-h-[200px]"
                    placeholder="What did you see? What did you experience? How did you feel?"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="btn btn-primary flex items-center gap-2">
                    <Save size={18} />
                    {editingNote ? 'Update' : 'Save'} Entry
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingNote(null);
                    }}
                    className="btn btn-outline flex items-center gap-2"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              </motion.form>
            )}
          </div>

          <div className="space-y-6">
            {notes.length === 0 ? (
              <div className="card p-12 text-center">
                <BookOpen size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No journal entries yet. Start documenting your journey!</p>
              </div>
            ) : (
              notes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="card p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-semibold">
                          Day {note.day}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(note.created_at).toLocaleDateString('en-IN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      {note.updated_at !== note.created_at && (
                        <p className="text-xs text-gray-400">
                          Last edited: {new Date(note.updated_at).toLocaleString('en-IN')}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(note)}
                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} className="text-blue-600 dark:text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} className="text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JournalPage;
