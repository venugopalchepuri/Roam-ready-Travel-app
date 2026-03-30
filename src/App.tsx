import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ChecklistPage from './pages/ChecklistPage';
import DestinationsPage from './pages/DestinationsPage';
import ConverterPage from './pages/ConverterPage';
import RecommendationsPage from './pages/RecommendationsPage';
import PanicModePage from './pages/PanicModePage';
import PlannerPage from './pages/PlannerPage';
import ChatbotPage from './pages/ChatbotPage';
import ExpensesPage from './pages/ExpensesPage';
import BookingsPage from './pages/BookingsPage';
import JourneyTrackerPage from './pages/JourneyTrackerPage';
import LocalTransportPage from './pages/LocalTransportPage';
import JournalPage from './pages/JournalPage';
import RemindersPage from './pages/RemindersPage';
import VisaCheckerPage from './pages/VisaCheckerPage';
import DocumentsVaultPage from './pages/DocumentsVaultPage';
import ActivitiesPage from './pages/ActivitiesPage';
import TripDetailPage from './pages/TripDetailPage';
import TripCreationStepper from './components/TripCreationStepper';
import ProfilePage from './pages/ProfilePage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/panic" element={
          <ProtectedRoute>
            <PanicModePage />
          </ProtectedRoute>
        } />

        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="trip/new" element={
            <ProtectedRoute>
              <TripCreationStepper />
            </ProtectedRoute>
          } />
          <Route path="trip/:id" element={
            <ProtectedRoute>
              <TripDetailPage />
            </ProtectedRoute>
          } />
          <Route path="recommendations" element={
            <ProtectedRoute>
              <RecommendationsPage />
            </ProtectedRoute>
          } />
          <Route path="chatbot" element={
            <ProtectedRoute>
              <ChatbotPage />
            </ProtectedRoute>
          } />
          <Route path="expenses" element={
            <ProtectedRoute>
              <ExpensesPage />
            </ProtectedRoute>
          } />
          <Route path="bookings" element={
            <ProtectedRoute>
              <BookingsPage />
            </ProtectedRoute>
          } />
          <Route path="checklist" element={
            <ProtectedRoute>
              <ChecklistPage />
            </ProtectedRoute>
          } />
          <Route path="destinations" element={<DestinationsPage />} />
          <Route path="converter" element={<ConverterPage />} />
          <Route path="planner" element={
            <ProtectedRoute>
              <PlannerPage />
            </ProtectedRoute>
          } />
          <Route path="journey-tracker" element={
            <ProtectedRoute>
              <JourneyTrackerPage />
            </ProtectedRoute>
          } />
          <Route path="local-transport" element={<LocalTransportPage />} />
          <Route path="journal" element={
            <ProtectedRoute>
              <JournalPage />
            </ProtectedRoute>
          } />
          <Route path="reminders" element={
            <ProtectedRoute>
              <RemindersPage />
            </ProtectedRoute>
          } />
          <Route path="visa-checker" element={
            <ProtectedRoute>
              <VisaCheckerPage />
            </ProtectedRoute>
          } />
          <Route path="documents" element={
            <ProtectedRoute>
              <DocumentsVaultPage />
            </ProtectedRoute>
          } />
          <Route path="activities" element={
            <ProtectedRoute>
              <ActivitiesPage />
            </ProtectedRoute>
          } />
          <Route path="profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default App;