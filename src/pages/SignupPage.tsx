import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Loader } from 'lucide-react';

const SignupPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!acceptedTerms) {
      setError('You must accept the Terms & Conditions to sign up');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, fullName);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1600&q=80')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* CARD */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/20">

          {/* ICON */}
          <div className="flex justify-center mb-6">
            <div className="bg-green-600 p-3 rounded-full shadow-lg">
              <MapPin size={28} className="text-white" />
            </div>
          </div>

          {/* TITLE */}
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800 dark:text-white">
            Create Account
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Start your travel journey ✈️
          </p>

          {/* ERROR */}
          {error && (
            <div className="bg-red-100/80 border border-red-300 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 outline-none !text-white"
                placeholder="Your name"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 outline-none !text-white"                placeholder="your@email.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 outline-none !text-white"
                placeholder="At least 6 characters"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 outline-none !text-white"
                placeholder="Repeat password"
                required
                disabled={loading}
              />
            </div>

            <div className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                disabled={loading}
              />
              <span className="text-gray-600 dark:text-gray-400">
                I agree to the <span className="text-green-600 font-medium">Terms</span> and <span className="text-green-600 font-medium">Privacy Policy</span>
              </span>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* LINKS */}
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <NavLink to="/login" className="text-green-600 font-medium hover:underline">
              Sign In
            </NavLink>
          </div>

          <div className="mt-4 text-center">
            <NavLink to="/" className="text-xs text-gray-500 hover:text-gray-700">
              ← Back to Home
            </NavLink>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;