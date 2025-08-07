import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUser, FiMail, FiLock, FiEye, FiEyeOff } = FiIcons;

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await register(email, password, name);
      navigate('/');
    } catch (err) {
      setError('Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="moon-phase mx-auto mb-4" style={{ width: '48px', height: '48px' }}></div>
          <h1 className="text-3xl font-mystical font-bold text-white mb-2">
            Join Tarot Pairs
          </h1>
          <p className="text-mystical-200">
            Begin your journey of tarot discovery
          </p>
        </div>

        {/* Registration Form */}
        <div className="mystical-card rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-400/30 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Name Field */}
            <div>
              <label className="block text-mystical-200 text-sm font-medium mb-2">
                Full Name
              </label>
              <div className="relative">
                <SafeIcon icon={FiUser} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mystical-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-mystical-300"
                  placeholder="Enter your name"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-mystical-200 text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <SafeIcon icon={FiMail} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mystical-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-mystical-300"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-mystical-200 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <SafeIcon icon={FiLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mystical-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-mystical-300"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-mystical-400 hover:text-mystical-300"
                >
                  <SafeIcon icon={showPassword ? FiEyeOff : FiEye} className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-mystical-200 text-sm font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <SafeIcon icon={FiLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mystical-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-mystical-300"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

            {/* Terms */}
            <div className="text-sm text-mystical-200">
              By creating an account, you agree to our{' '}
              <Link to="#" className="text-mystical-300 hover:text-white">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="#" className="text-mystical-300 hover:text-white">
                Privacy Policy
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mystical-button py-3 rounded-lg font-semibold"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>

        {/* Sign In Link */}
        <div className="text-center mt-6">
          <p className="text-mystical-200">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-mystical-300 hover:text-white font-semibold transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-4">
          <Link
            to="/"
            className="text-mystical-400 hover:text-mystical-300 text-sm transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;