import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiStar, FiCheck, FiZap, FiUnlock, FiCrown, FiHeart } = FiIcons;

const Upgrade = () => {
  const { user, upgradeToPremium } = useAuth();

  const features = [
    {
      icon: FiUnlock,
      title: 'All 3,003 Pair Interpretations',
      description: 'Access every possible tarot card combination',
      free: '50 sample pairs',
      premium: 'Complete database',
    },
    {
      icon: FiZap,
      title: 'AI-Powered Insights',
      description: 'Get personalized interpretations for any pair',
      free: false,
      premium: 'Unlimited AI consultations',
    },
    {
      icon: FiCrown,
      title: 'Premium Curated Collections',
      description: 'Exclusive themed interpretations',
      free: 'Basic curated pairs',
      premium: 'All premium collections',
    },
    {
      icon: FiHeart,
      title: 'Unlimited Favorites',
      description: 'Save as many pairs as you want',
      free: '10 favorites max',
      premium: 'Unlimited favorites',
    },
  ];

  const handleUpgrade = () => {
    // Placeholder for payment integration
    if (user) {
      upgradeToPremium();
      alert('Upgrade successful! (This is a demo)');
    }
  };

  if (user && user.isPremium) {
    return (
      <div className="max-w-md mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mystical-card rounded-xl p-8 text-center"
        >
          <SafeIcon icon={FiCrown} className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
          <h2 className="text-white font-semibold mb-2">You're Premium!</h2>
          <p className="text-mystical-200 mb-6">
            Enjoy unlimited access to all Tarot Pairs features
          </p>
          <div className="premium-badge mx-auto">
            <SafeIcon icon={FiStar} className="w-4 h-4 inline mr-1" />
            Premium Member
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <SafeIcon icon={FiStar} className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
        <h1 className="text-2xl font-mystical font-bold text-white mb-2">
          Upgrade to Premium
        </h1>
        <p className="text-mystical-200">
          Unlock the full power of tarot pair interpretations
        </p>
      </motion.div>

      {/* Pricing Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mystical-card rounded-xl p-6 border-2 border-yellow-400/30"
      >
        <div className="text-center mb-6">
          <div className="premium-badge mx-auto mb-3">
            <SafeIcon icon={FiStar} className="w-4 h-4 inline mr-1" />
            Premium
          </div>
          <div className="text-4xl font-bold text-white mb-2">
            $9.99
            <span className="text-lg text-mystical-300 font-normal">/month</span>
          </div>
          <p className="text-mystical-200 text-sm">
            Cancel anytime • 7-day free trial
          </p>
        </div>

        <button
          onClick={handleUpgrade}
          className="w-full mystical-button py-4 rounded-lg text-lg font-semibold mb-4"
          disabled={!user}
        >
          {!user ? 'Login Required' : 'Start Free Trial'}
        </button>

        <p className="text-center text-mystical-300 text-xs">
          {!user && 'Please login to upgrade your account'}
        </p>
      </motion.div>

      {/* Features Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h3 className="text-white font-semibold text-center mb-4">
          What's Included in Premium
        </h3>

        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="mystical-card rounded-lg p-4"
          >
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-mystical-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <SafeIcon icon={feature.icon} className="w-5 h-5 text-mystical-300" />
              </div>
              
              <div className="flex-1">
                <h4 className="text-white font-semibold mb-1">{feature.title}</h4>
                <p className="text-mystical-200 text-sm mb-3">{feature.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-mystical-300">Free:</span>
                    <span className="text-mystical-200">
                      {feature.free || 'Not included'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-yellow-400">Premium:</span>
                    <span className="text-white font-medium flex items-center">
                      <SafeIcon icon={FiCheck} className="w-4 h-4 mr-1 text-green-400" />
                      {feature.premium}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Payment Methods Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mystical-card rounded-xl p-6"
      >
        <h3 className="text-white font-semibold mb-4 text-center">
          Secure Payment Options
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-mystical-600/20 rounded-lg">
            <div className="text-2xl mb-1">💳</div>
            <div className="text-mystical-200 text-xs">Credit Card</div>
          </div>
          <div className="p-3 bg-mystical-600/20 rounded-lg">
            <div className="text-2xl mb-1">🅿️</div>
            <div className="text-mystical-200 text-xs">PayPal</div>
          </div>
          <div className="p-3 bg-mystical-600/20 rounded-lg">
            <div className="text-2xl mb-1">🍎</div>
            <div className="text-mystical-200 text-xs">Apple Pay</div>
          </div>
        </div>
        <p className="text-center text-mystical-300 text-xs mt-4">
          Powered by Stripe • SSL Encrypted
        </p>
      </motion.div>

      {/* FAQ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mystical-card rounded-xl p-6"
      >
        <h3 className="text-white font-semibold mb-4">Frequently Asked</h3>
        <div className="space-y-3 text-sm">
          <div>
            <div className="text-mystical-300 font-medium mb-1">
              Can I cancel anytime?
            </div>
            <div className="text-mystical-200">
              Yes, cancel your subscription at any time with no fees.
            </div>
          </div>
          <div>
            <div className="text-mystical-300 font-medium mb-1">
              What happens to my favorites?
            </div>
            <div className="text-mystical-200">
              Your favorites are always saved, even if you downgrade.
            </div>
          </div>
          <div>
            <div className="text-mystical-300 font-medium mb-1">
              Is there a family plan?
            </div>
            <div className="text-mystical-200">
              Family plans are coming soon! Contact us for early access.
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Upgrade;