import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRole, PERMISSIONS } from '../context/RoleContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { tarotCards } from '../data/tarotCards';
import { samplePairs, curatedPairs } from '../data/pairMeanings';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { 
  FiDatabase, FiUpload, FiDownload, FiSearch, FiEdit, 
  FiTrash2, FiPlus, FiFilter, FiInfo, FiCheckCircle, FiXCircle
} = FiIcons;

const ContentManagement = () => {
  const { hasPermission } = useRole();
  const [pairData, setPairData] = useState([...samplePairs]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [uploadStatus, setUploadStatus] = useState(null);
  const [selectedPair, setSelectedPair] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editForm, setEditForm] = useState({
    id: '',
    card1: null,
    card2: null,
    meaning: '',
    keywords: [],
    theme: '',
    isPremium: false,
    specialInterpretation: ''
  });
  const [keywordInput, setKeywordInput] = useState('');

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadStatus({ type: 'loading', message: 'Processing file...' });

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const rows = text.split('\n');
        const headers = rows[0].split(',');
        
        // Validate headers
        const requiredHeaders = ['card1Id', 'card2Id', 'meaning'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        
        if (missingHeaders.length > 0) {
          setUploadStatus({
            type: 'error',
            message: `Missing required headers: ${missingHeaders.join(', ')}`
          });
          return;
        }

        // Process data
        const newPairs = [];
        for (let i = 1; i < rows.length; i++) {
          if (!rows[i].trim()) continue;
          
          const values = rows[i].split(',');
          const rowData = {};
          
          headers.forEach((header, index) => {
            rowData[header] = values[index]?.trim();
          });
          
          const card1 = tarotCards.find(c => c.id === parseInt(rowData.card1Id));
          const card2 = tarotCards.find(c => c.id === parseInt(rowData.card2Id));
          
          if (!card1 || !card2) {
            console.warn(`Skipping row ${i+1}: Invalid card ID`);
            continue;
          }
          
          const newPair = {
            id: `${card1.id}-${card2.id}`,
            card1,
            card2,
            meaning: rowData.meaning,
            keywords: rowData.keywords ? rowData.keywords.split(';') : [],
            theme: rowData.theme || 'General',
            isPremium: rowData.isPremium === 'true',
            specialInterpretation: rowData.specialInterpretation || ''
          };
          
          newPairs.push(newPair);
        }
        
        setPairData(newPairs);
        setUploadStatus({
          type: 'success',
          message: `Successfully imported ${newPairs.length} pairs`
        });
        
        setTimeout(() => {
          setUploadStatus(null);
        }, 5000);
        
      } catch (error) {
        console.error('Error parsing CSV:', error);
        setUploadStatus({
          type: 'error',
          message: `Error parsing CSV: ${error.message}`
        });
      }
    };
    
    reader.onerror = () => {
      setUploadStatus({
        type: 'error',
        message: 'Error reading file'
      });
    };
    
    reader.readAsText(file);
  };

  // Handle file download
  const handleDownload = () => {
    // Create CSV content
    const headers = ['card1Id', 'card1Name', 'card2Id', 'card2Name', 'meaning', 'keywords', 'theme', 'isPremium', 'specialInterpretation'];
    const csvContent = [
      headers.join(','),
      ...pairData.map(pair => [
        pair.card1.id,
        `"${pair.card1.name.replace(/"/g, '""')}"`,
        pair.card2.id,
        `"${pair.card2.name.replace(/"/g, '""')}"`,
        `"${pair.meaning.replace(/"/g, '""')}"`,
        `"${(pair.keywords || []).join(';').replace(/"/g, '""')}"`,
        `"${(pair.theme || '').replace(/"/g, '""')}"`,
        pair.isPremium,
        `"${(pair.specialInterpretation || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'tarot_pair_meanings.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter pairs based on search and filter
  const filteredPairs = pairData.filter(pair => {
    const matchesSearch = 
      pair.card1.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pair.card2.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pair.theme && pair.theme.toLowerCase().includes(searchTerm.toLowerCase())) ||
      pair.meaning.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'premium' && pair.isPremium) ||
      (filter === 'standard' && !pair.isPremium) ||
      (filter === 'curated' && pair.specialInterpretation);
    
    return matchesSearch && matchesFilter;
  });

  // Handle pair deletion
  const handleDeletePair = (pairId) => {
    if (window.confirm('Are you sure you want to delete this pair?')) {
      setPairData(prev => prev.filter(p => p.id !== pairId));
    }
  };

  // Handle opening edit form
  const handleEditPair = (pair) => {
    setSelectedPair(pair);
    setEditForm({
      id: pair.id,
      card1: pair.card1,
      card2: pair.card2,
      meaning: pair.meaning,
      keywords: pair.keywords || [],
      theme: pair.theme || '',
      isPremium: pair.isPremium || false,
      specialInterpretation: pair.specialInterpretation || ''
    });
    setIsEditing(true);
    setIsAdding(false);
  };

  // Handle opening add form
  const handleAddPair = () => {
    setSelectedPair(null);
    setEditForm({
      id: '',
      card1: null,
      card2: null,
      meaning: '',
      keywords: [],
      theme: '',
      isPremium: false,
      specialInterpretation: ''
    });
    setIsEditing(false);
    setIsAdding(true);
  };

  // Handle form submission
  const handleSubmitForm = (e) => {
    e.preventDefault();
    
    if (!editForm.card1 || !editForm.card2 || !editForm.meaning.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const newPair = {
      id: editForm.id || `${editForm.card1.id}-${editForm.card2.id}`,
      card1: editForm.card1,
      card2: editForm.card2,
      meaning: editForm.meaning,
      keywords: editForm.keywords,
      theme: editForm.theme,
      isPremium: editForm.isPremium,
      specialInterpretation: editForm.specialInterpretation
    };

    if (isEditing) {
      // Update existing pair
      setPairData(prev => 
        prev.map(p => p.id === editForm.id ? newPair : p)
      );
    } else {
      // Add new pair
      setPairData(prev => [...prev, newPair]);
    }

    setIsEditing(false);
    setIsAdding(false);
    setSelectedPair(null);
  };

  // Handle adding a keyword
  const handleAddKeyword = () => {
    if (keywordInput.trim() && !editForm.keywords.includes(keywordInput.trim())) {
      setEditForm({
        ...editForm,
        keywords: [...editForm.keywords, keywordInput.trim()]
      });
      setKeywordInput('');
    }
  };

  // Handle removing a keyword
  const handleRemoveKeyword = (keyword) => {
    setEditForm({
      ...editForm,
      keywords: editForm.keywords.filter(k => k !== keyword)
    });
  };

  // Card selection component for the form
  const CardSelector = ({ selectedCard, onSelect, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [cardSearch, setCardSearch] = useState('');
    
    const filteredCards = tarotCards.filter(card => 
      card.name.toLowerCase().includes(cardSearch.toLowerCase()) ||
      card.suit.toLowerCase().includes(cardSearch.toLowerCase())
    );
    
    return (
      <div className="mb-4">
        <label className="block text-mystical-200 text-sm font-medium mb-2">
          {label}
        </label>
        
        {selectedCard ? (
          <div className="flex items-center space-x-2 mb-2">
            <div className="px-3 py-2 bg-mystical-600/30 rounded-lg text-white">
              {selectedCard.name} ({selectedCard.suit})
            </div>
            <button 
              type="button"
              onClick={() => onSelect(null)}
              className="p-1 text-red-300 hover:text-red-400"
            >
              <SafeIcon icon={FiXCircle} className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="w-full px-4 py-2 bg-mystical-600/20 text-white rounded-lg hover:bg-mystical-600/30 text-left"
          >
            Select a card...
          </button>
        )}
        
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-mystical-600 rounded-xl p-4 w-full max-w-md max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-semibold">Select {label}</h3>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-mystical-300 hover:text-white"
                >
                  <SafeIcon icon={FiXCircle} className="w-5 h-5" />
                </button>
              </div>
              
              <input
                type="text"
                value={cardSearch}
                onChange={(e) => setCardSearch(e.target.value)}
                placeholder="Search cards..."
                className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 mb-4"
              />
              
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {filteredCards.map(card => (
                  <button
                    key={card.id}
                    onClick={() => {
                      onSelect(card);
                      setIsOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-mystical-500/30 rounded-lg flex justify-between items-center"
                  >
                    <span className="text-white">{card.name}</span>
                    <span className="text-mystical-300 text-sm capitalize">{card.suit}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.MANAGE_CONTENT}>
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-mystical font-bold text-white mb-2">
              Content Management
            </h1>
            <p className="text-mystical-200">
              Manage tarot pair interpretations and curated content
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-mystical-300">{pairData.length}</div>
            <div className="text-sm text-mystical-200">Total Pairs</div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {/* Upload CSV */}
          <div className="mystical-card rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-3">
              <SafeIcon icon={FiUpload} className="w-5 h-5 text-blue-400" />
              <h3 className="text-white font-semibold">Upload Pairs Database</h3>
            </div>
            <p className="text-mystical-200 text-sm mb-3">
              Import pairs from a CSV file with card1Id, card2Id, and meaning columns
            </p>
            <label className="block w-full py-2 px-4 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-center cursor-pointer">
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
              Select CSV File
            </label>
          </div>
          
          {/* Download CSV */}
          <div className="mystical-card rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-3">
              <SafeIcon icon={FiDownload} className="w-5 h-5 text-green-400" />
              <h3 className="text-white font-semibold">Export Database</h3>
            </div>
            <p className="text-mystical-200 text-sm mb-3">
              Download current pairs database as a CSV file for editing
            </p>
            <button 
              onClick={handleDownload}
              className="w-full py-2 px-4 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg"
            >
              Download CSV
            </button>
          </div>
          
          {/* Add New Pair */}
          <div className="mystical-card rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-3">
              <SafeIcon icon={FiPlus} className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-semibold">Add New Pair</h3>
            </div>
            <p className="text-mystical-200 text-sm mb-3">
              Create a new tarot pair interpretation manually
            </p>
            <button 
              onClick={handleAddPair}
              className="w-full py-2 px-4 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg"
            >
              Create Pair
            </button>
          </div>
        </motion.div>
        
        {/* Upload Status */}
        {uploadStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mystical-card rounded-xl p-4 ${
              uploadStatus.type === 'error' ? 'border-red-400/30' :
              uploadStatus.type === 'success' ? 'border-green-400/30' :
              'border-blue-400/30'
            }`}
          >
            <div className="flex items-center space-x-3">
              <SafeIcon 
                icon={
                  uploadStatus.type === 'error' ? FiXCircle :
                  uploadStatus.type === 'success' ? FiCheckCircle :
                  FiInfo
                }
                className={`w-5 h-5 ${
                  uploadStatus.type === 'error' ? 'text-red-400' :
                  uploadStatus.type === 'success' ? 'text-green-400' :
                  'text-blue-400'
                }`}
              />
              <p className="text-white">{uploadStatus.message}</p>
            </div>
          </motion.div>
        )}
        
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mystical-card rounded-xl p-4"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mystical-400" />
              <input
                type="text"
                placeholder="Search pairs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-mystical-300"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:border-mystical-300"
            >
              <option value="all">All Pairs</option>
              <option value="premium">Premium Only</option>
              <option value="standard">Standard Only</option>
              <option value="curated">Curated Pairs</option>
            </select>
          </div>
        </motion.div>
        
        {/* Pairs Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mystical-card rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-mystical-600/30">
                <tr>
                  <th className="px-4 py-3 text-left text-mystical-200 font-semibold">Cards</th>
                  <th className="px-4 py-3 text-left text-mystical-200 font-semibold">Theme</th>
                  <th className="px-4 py-3 text-left text-mystical-200 font-semibold">Interpretation</th>
                  <th className="px-4 py-3 text-left text-mystical-200 font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-mystical-200 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPairs.length > 0 ? (
                  filteredPairs.map((pair, index) => (
                    <motion.tr
                      key={pair.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="border-b border-mystical-600/30 hover:bg-mystical-600/20"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">
                          {pair.card1.name} + {pair.card2.name}
                        </div>
                        <div className="text-mystical-300 text-xs">
                          ID: {pair.id}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {pair.theme && (
                          <span className="px-2 py-1 bg-mystical-500/30 rounded text-mystical-200 text-xs">
                            {pair.theme}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="text-mystical-200 text-sm line-clamp-2">
                          {pair.meaning}
                        </div>
                        {pair.keywords && pair.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {pair.keywords.slice(0, 2).map((keyword, i) => (
                              <span key={i} className="px-1 py-0.5 bg-mystical-600/30 rounded text-mystical-300 text-xs">
                                {keyword}
                              </span>
                            ))}
                            {pair.keywords.length > 2 && (
                              <span className="text-mystical-400 text-xs">
                                +{pair.keywords.length - 2} more
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          pair.isPremium 
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-green-500/20 text-green-300'
                        }`}>
                          {pair.isPremium ? 'Premium' : 'Standard'}
                        </span>
                        {pair.specialInterpretation && (
                          <div className="mt-1 px-2 py-1 bg-purple-500/20 rounded text-purple-300 text-xs">
                            Curated
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditPair(pair)}
                            className="p-1 text-mystical-300 hover:text-white rounded"
                          >
                            <SafeIcon icon={FiEdit} className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePair(pair.id)}
                            className="p-1 text-mystical-300 hover:text-red-300 rounded"
                          >
                            <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-mystical-300">
                      No pairs found matching your search criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
        
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="mystical-card rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {pairData.length}
            </div>
            <div className="text-mystical-200 text-sm">Total Pairs</div>
          </div>
          <div className="mystical-card rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {pairData.filter(p => p.isPremium).length}
            </div>
            <div className="text-mystical-200 text-sm">Premium Pairs</div>
          </div>
          <div className="mystical-card rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {pairData.filter(p => !p.isPremium).length}
            </div>
            <div className="text-mystical-200 text-sm">Standard Pairs</div>
          </div>
          <div className="mystical-card rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {pairData.filter(p => p.specialInterpretation).length}
            </div>
            <div className="text-mystical-200 text-sm">Curated Pairs</div>
          </div>
        </motion.div>
      </div>

      {/* Edit/Add Modal */}
      {(isEditing || isAdding) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mystical-card rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-mystical font-bold text-white">
                {isEditing ? 'Edit Tarot Pair' : 'Add New Tarot Pair'}
              </h2>
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setIsAdding(false);
                }}
                className="text-mystical-300 hover:text-white"
              >
                <SafeIcon icon={FiXCircle} className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitForm} className="space-y-6">
              {/* Card Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CardSelector 
                  selectedCard={editForm.card1} 
                  onSelect={(card) => setEditForm({...editForm, card1: card})}
                  label="First Card"
                />
                <CardSelector 
                  selectedCard={editForm.card2} 
                  onSelect={(card) => setEditForm({...editForm, card2: card})}
                  label="Second Card"
                />
              </div>
              
              {/* Theme */}
              <div>
                <label className="block text-mystical-200 text-sm font-medium mb-2">
                  Theme
                </label>
                <input
                  type="text"
                  value={editForm.theme}
                  onChange={(e) => setEditForm({...editForm, theme: e.target.value})}
                  placeholder="e.g., Relationships, Career, Spiritual Growth"
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-mystical-300"
                />
              </div>
              
              {/* Interpretation */}
              <div>
                <label className="block text-mystical-200 text-sm font-medium mb-2">
                  Interpretation
                </label>
                <textarea
                  value={editForm.meaning}
                  onChange={(e) => setEditForm({...editForm, meaning: e.target.value})}
                  placeholder="Enter the meaning of this card combination..."
                  rows="5"
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-mystical-300"
                  required
                ></textarea>
              </div>
              
              {/* Keywords */}
              <div>
                <label className="block text-mystical-200 text-sm font-medium mb-2">
                  Keywords
                </label>
                <div className="flex mb-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    placeholder="Add a keyword..."
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/30 rounded-l-lg text-white placeholder-white/60 focus:outline-none focus:border-mystical-300"
                  />
                  <button
                    type="button"
                    onClick={handleAddKeyword}
                    className="px-4 py-2 bg-mystical-500 text-white rounded-r-lg hover:bg-mystical-600"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {editForm.keywords.map((keyword, index) => (
                    <div 
                      key={index}
                      className="px-2 py-1 bg-mystical-600/30 rounded-lg text-white flex items-center"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(keyword)}
                        className="ml-2 text-mystical-300 hover:text-red-300"
                      >
                        <SafeIcon icon={FiXCircle} className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {editForm.keywords.length === 0 && (
                    <span className="text-mystical-400 text-sm">No keywords added</span>
                  )}
                </div>
              </div>
              
              {/* Special Interpretation */}
              <div>
                <label className="block text-mystical-200 text-sm font-medium mb-2">
                  Special Interpretation (for Curated Pairs)
                </label>
                <textarea
                  value={editForm.specialInterpretation}
                  onChange={(e) => setEditForm({...editForm, specialInterpretation: e.target.value})}
                  placeholder="Optional special insight for curated pairs..."
                  rows="3"
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-mystical-300"
                ></textarea>
              </div>
              
              {/* Premium Toggle */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPremium"
                  checked={editForm.isPremium}
                  onChange={(e) => setEditForm({...editForm, isPremium: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="isPremium" className="text-mystical-200">
                  Premium Content (requires subscription)
                </label>
              </div>
              
              {/* Submit Button */}
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 mystical-button py-3 rounded-lg font-semibold"
                >
                  {isEditing ? 'Save Changes' : 'Create Pair'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setIsAdding(false);
                  }}
                  className="px-6 py-3 bg-white/10 border border-white/30 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </ProtectedRoute>
  );
};

export default ContentManagement;