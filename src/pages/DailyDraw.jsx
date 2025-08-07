import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { usePairData } from '../context/PairDataContext';
import PairResult from '../components/PairResult';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { format } from 'date-fns';

const { FiRefreshCw, FiCalendar, FiClock, FiAlertCircle } = FiIcons;

const DailyDraw = () => {
  const { addToDailyDrawHistory, dailyDrawHistory } = useUser();
  const { isLoading, getRandomDailyDraw, pairData, dataSource } = usePairData();
  
  const [todaysDraw, setTodaysDraw] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showAIPlaceholder, setShowAIPlaceholder] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    // Check if there's already a draw for today
    const existingDraw = dailyDrawHistory.find(
      draw => format(new Date(draw.date), 'yyyy-MM-dd') === today
    );
    
    if (existingDraw) {
      setTodaysDraw(existingDraw);
    }
  }, [dailyDrawHistory, today]);

  const performDailyDraw = () => {
    setIsDrawing(true);
    
    // Simulate card drawing animation
    setTimeout(() => {
      const draw = getRandomDailyDraw();
      
      if (draw) {
        const drawWithDate = {
          ...draw,
          date: new Date().toISOString(),
        };
        
        setTodaysDraw(drawWithDate);
        addToDailyDrawHistory(drawWithDate);
      }
      
      setIsDrawing(false);
    }, 2000);
  };

  const handleAskAI = () => {
    setShowAIPlaceholder(true);
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto px-4 py-6 flex justify-center items-center">
        <div className="text-white">Loading tarot pairs data...</div>
      </div>
    );
  }

  if (pairData.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mystical-card rounded-xl p-8 text-center"
        >
          <SafeIcon icon={FiAlertCircle} className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
          <h2 className="text-white font-semibold mb-2">No Tarot Pair Data Found</h2>
          <p className="text-mystical-200 mb-6">
            Please upload a CSV file in the Admin panel to populate the tarot pairs database.
          </p>
          <a href="#/admin/content" className="mystical-button px-6 py-3 rounded-lg inline-block">
            Go to Content Management
          </a>
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
        <h1 className="text-2xl font-mystical font-bold text-white mb-2">
          Daily Draw
        </h1>
        <p className="text-mystical-200">
          Discover your guidance for {format(new Date(), 'MMMM do, yyyy')}
        </p>
        {dataSource === 'sample' && (
          <div className="mt-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300">
              Using sample data. Upload your own in Admin panel.
            </span>
          </div>
        )}
      </motion.div>

      {/* Today's Draw Section */}
      {!todaysDraw && !isDrawing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mystical-card rounded-xl p-8 text-center"
        >
          <div className="moon-phase mx-auto mb-4" style={{ width: '48px', height: '48px' }}></div>
          <h3 className="text-white font-semibold mb-2">Ready for Today's Guidance?</h3>
          <p className="text-mystical-200 mb-6">
            Draw two cards to receive your daily tarot insight
          </p>
          <button
            onClick={performDailyDraw}
            className="mystical-button px-8 py-3 rounded-lg"
          >
            <SafeIcon icon={FiRefreshCw} className="w-4 h-4 inline mr-2" />
            Draw Cards
          </button>
        </motion.div>
      )}

      {/* Drawing Animation */}
      {isDrawing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mystical-card rounded-xl p-8 text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="moon-phase mx-auto mb-4"
            style={{ width: '48px', height: '48px' }}
          ></motion.div>
          <h3 className="text-white font-semibold mb-2">Drawing Your Cards...</h3>
          <p className="text-mystical-200">
            The universe is selecting your guidance for today
          </p>
        </motion.div>
      )}

      {/* Today's Result */}
      {todaysDraw && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PairResult pairData={todaysDraw} onAskAI={handleAskAI} />
          
          {todaysDraw.generatedOnTheFly && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 p-3 bg-blue-500/20 rounded-lg text-blue-300 text-sm text-center"
            >
              This interpretation was generated on-the-fly. Upload more pairs in the Admin panel for curated meanings.
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Draw History */}
      {dailyDrawHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mystical-card rounded-xl p-6"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center">
            <SafeIcon icon={FiCalendar} className="w-5 h-5 mr-2 text-mystical-300" />
            Recent Draws
          </h3>
          <div className="space-y-3">
            {dailyDrawHistory.slice(0, 5).map((draw, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-mystical-600/20 rounded-lg"
              >
                <div>
                  <div className="text-white text-sm font-medium">
                    {draw.card1.name} + {draw.card2.name}
                  </div>
                  <div className="text-mystical-300 text-xs flex items-center">
                    <SafeIcon icon={FiClock} className="w-3 h-3 mr-1" />
                    {format(new Date(draw.date), 'MMM do')}
                  </div>
                </div>
                <div className="text-mystical-300">
                  {draw.theme && (
                    <span className="text-xs px-2 py-1 bg-mystical-500/30 rounded">
                      {draw.theme}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* AI Placeholder */}
      {showAIPlaceholder && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mystical-card rounded-xl p-6"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center">
            <SafeIcon icon={FiRefreshCw} className="w-5 h-5 mr-2 text-mystical-300" />
            AI Daily Guidance
          </h3>
          <div className="bg-mystical-600/20 rounded-lg p-4 border border-mystical-400/30">
            <p className="text-mystical-200 text-center italic">
              Personalized AI guidance for your daily draw will appear here. This feature will provide deeper insights tailored to your current situation.
            </p>
          </div>
          <button
            onClick={() => setShowAIPlaceholder(false)}
            className="mt-4 w-full py-2 text-mystical-300 hover:text-white transition-colors"
          >
            Close
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default DailyDraw;