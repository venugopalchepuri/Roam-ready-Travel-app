import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileService, UserProfile, UserEmergencyContact } from '../services/profileService';
import { ArrowLeft, CreditCard as Edit, Save, X, Plus, Trash2, User, Phone, Mail, MapPin, Calendar, Globe, CreditCard, FileText, AlertCircle } from 'lucide-react';
import { div } from 'framer-motion/client';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [emergencyContacts, setEmergencyContacts] = useState<UserEmergencyContact[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    relationship: '',
    phone_number: '',
    email: '',
    address: '',
    is_primary: false,
  });

  useEffect(() => {
    if (user) {
      loadProfile();
      loadEmergencyContacts();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getOrCreateUserProfile(user!.id);
      setProfile(data);
      setEditedProfile(data);
    } catch (err: any) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadEmergencyContacts = async () => {
    try {
      const data = await profileService.getEmergencyContacts(user!.id);
      setEmergencyContacts(data);
    } catch (err: any) {
      console.error('Failed to load emergency contacts:', err);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;

    setSaving(true);
    try {
      const updated = await profileService.updateUserProfile(user.id, editedProfile);
      setProfile(updated);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile(profile || {});
    setIsEditing(false);
  };

  const handleAddContact = async () => {
    if (!user || !newContact.name || !newContact.relationship || !newContact.phone_number) {
      return;
    }

    try {
      await profileService.createEmergencyContact(user.id, newContact);
      await loadEmergencyContacts();
      setShowAddContact(false);
      setNewContact({
        name: '',
        relationship: '',
        phone_number: '',
        email: '',
        address: '',
        is_primary: false,
      });
    } catch (err: any) {
      console.error('Failed to add emergency contact:', err);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      await profileService.deleteEmergencyContact(contactId);
      await loadEmergencyContacts();
    } catch (err: any) {
      console.error('Failed to delete emergency contact:', err);
    }
  };

  const handleSetPrimary = async (contactId: string) => {
    if (!user) return;

    try {
      await profileService.setPrimaryEmergencyContact(user.id, contactId);
      await loadEmergencyContacts();
    } catch (err: any) {
      console.error('Failed to set primary contact:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section bg-gray-50 dark:bg-gray-900">
      <div className="container-custom max-w-5xl">
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

          <div className="grid gap-6">
            <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">My Profile</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your personal information and emergency contacts</p>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary flex items-center gap-2"
              >
                <Edit size={20} />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <X size={20} />
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Save size={20} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          <div className="card p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <User size={24} className="text-blue-600" />
                Personal Information
              </h2>

<div className="grid md:grid-cols-2 gap-6">
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">
      Full Name
    </label>

    {isEditing ? (
      <input
        type="text"
        value={editedProfile.full_name || ''}
        onChange={(e) =>
          setEditedProfile({ ...editedProfile, full_name: e.target.value })
        }
        className="w-full px-4 py-2 rounded-lg 
        bg-gray-800 text-white 
        border border-gray-600 
        placeholder-gray-400 
        focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter your full name"
      />
    ) : (
      <p className="text-gray-200">
        {profile?.full_name || 'Not provided'}
      </p>
    )}
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
      <Phone size={16} />
      Phone Number
    </label>

    {isEditing ? (
      <input
        type="tel"
        value={editedProfile.phone_number || ''}
        onChange={(e) =>
          setEditedProfile({ ...editedProfile, phone_number: e.target.value })
        }
        className="w-full px-4 py-2 rounded-lg 
        bg-gray-800 text-white 
        border border-gray-600 
        placeholder-gray-400 
        focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="+91 98765 43210"
      />
    ) : (
      <p className="text-gray-200">
        {profile?.phone_number || 'Not provided'}
      </p>
    )}
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
      <Calendar size={16} />
      Date of Birth
    </label>

    {isEditing ? (
      <input
        type="date"
        value={editedProfile.date_of_birth || ''}
        onChange={(e) =>
          setEditedProfile({ ...editedProfile, date_of_birth: e.target.value })
        }
        className="w-full px-4 py-2 rounded-lg 
        bg-gray-800 text-white 
        border border-gray-600 
        focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    ) : (
      <p className="text-gray-200">
        {profile?.date_of_birth
          ? new Date(profile.date_of_birth).toLocaleDateString()
          : 'Not provided'}
      </p>
    )}
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
      <Globe size={16} />
      Nationality
    </label>

    {isEditing ? (
      <input
        type="text"
        value={editedProfile.nationality || ''}
        onChange={(e) =>
          setEditedProfile({ ...editedProfile, nationality: e.target.value })
        }
        className="w-full px-4 py-2 rounded-lg 
        bg-gray-800 text-white 
        border border-gray-600 
        placeholder-gray-400 
        focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter your nationality"
      />
    ) : (
      <p className="text-gray-200">
        {profile?.nationality || 'Not provided'}
      </p>
    )}
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
      <CreditCard size={16} />
      Passport Number
    </label>
    {isEditing ? (
      <input
        type="text"
        value={editedProfile.passport_number || ''}
        onChange={(e) => setEditedProfile({ ...editedProfile, passport_number: e.target.value })}
        className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder="Enter your passport number"
      />
    ) : (
      <p className="text-gray-200">{profile?.passport_number || 'Not provided'}</p>
    )}
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
    {isEditing ? (
      <input
        type="text"
        value={editedProfile.city || ''}
        onChange={(e) => setEditedProfile({ ...editedProfile, city: e.target.value })}
        className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder="Enter your city"
      />
    ) : (
      <p className="text-gray-200">{profile?.city || 'Not provided'}</p>
    )}
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
    {isEditing ? (
      <input
        type="text"
        value={editedProfile.country || ''}
        onChange={(e) => setEditedProfile({ ...editedProfile, country: e.target.value })}
        className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
        placeholder="Enter your country"
      />
    ) : (
      <p className="text-gray-200">{profile?.country || 'Not provided'}</p>
    )}
  </div>

  <div className="md:col-span-2">
    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
      <MapPin size={16} />
      Address
    </label>
    {isEditing ? (
      <textarea
        value={editedProfile.address || ''}
        onChange={(e) => setEditedProfile({ ...editedProfile, address: e.target.value })}
        className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
        rows={2}
        placeholder="Enter your address"
      />
    ) : (
      <p className="text-gray-200">{profile?.address || 'Not provided'}</p>
    )}
  </div>

  <div className="md:col-span-2">
    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
      <FileText size={16} />
      Bio
    </label>
    {isEditing ? (
      <textarea
        value={editedProfile.bio || ''}
        onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
        className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
        rows={3}
        placeholder="Tell us about yourself..."
      />
    ) : (
      <p className="text-gray-200">{profile?.bio || 'Not provided'}</p>
    )}
  </div>
</div>
            </div>

            <div className="card p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <AlertCircle size={24} className="text-red-600" />
                  Emergency Contacts
                </h2>
                <button
                  onClick={() => setShowAddContact(true)}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add Contact
                </button>
              </div>

              {showAddContact && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold mb-4">New Emergency Contact</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={newContact.name}
                      onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      className="input-field"
                      placeholder="Name *"
                    />
                    <input
                      type="text"
                      value={newContact.relationship}
                      onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                      className="input-field"
                      placeholder="Relationship *"
                    />
                    <input
                      type="tel"
                      value={newContact.phone_number}
                      onChange={(e) => setNewContact({ ...newContact, phone_number: e.target.value })}
                      className="input-field"
                      placeholder="Phone Number *"
                    />
                    <input
                      type="email"
                      value={newContact.email}
                      onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                      className="input-field"
                      placeholder="Email"
                    />
                    <input
                      type="text"
                      value={newContact.address}
                      onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
                      className="input-field md:col-span-2"
                      placeholder="Address"
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={handleAddContact} className="btn btn-primary">Add Contact</button>
                    <button onClick={() => setShowAddContact(false)} className="btn btn-secondary">Cancel</button>
                  </div>
                </div>
              )}

              {emergencyContacts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
                  <p>No emergency contacts added yet</p>
                  <p className="text-sm">Add emergency contacts for peace of mind during your travels</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {emergencyContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`p-4 rounded-lg border-2 ${
                        contact.is_primary
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{contact.name}</h3>
                            {contact.is_primary && (
                              <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">Primary</span>
                            )}
                          </div>
                          <div className="grid md:grid-cols-2 gap-2 text-sm">
                            <p className="text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Relationship:</span> {contact.relationship}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                              <Phone size={14} />
                              {contact.phone_number}
                            </p>
                            {contact.email && (
                              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                <Mail size={14} />
                                {contact.email}
                              </p>
                            )}
                            {contact.address && (
                              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                <MapPin size={14} />
                                {contact.address}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!contact.is_primary && (
                            <button
                              onClick={() => handleSetPrimary(contact.id)}
                              className="text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                            >
                              Set Primary
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteContact(contact.id)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
