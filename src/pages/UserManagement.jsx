import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRole, ROLES, PERMISSIONS } from '../context/RoleContext';
import ProtectedRoute from '../components/ProtectedRoute';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiSearch, FiFilter, FiMoreVertical, FiEdit, FiTrash2, FiShield, FiCrown, FiUser, FiStar } = FiIcons;

// Mock users data - replace with actual API calls
const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    isPremium: false,
    joinDate: '2024-01-15',
    lastActive: '2024-01-20',
    status: 'active'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'premium',
    isPremium: true,
    joinDate: '2024-01-10',
    lastActive: '2024-01-19',
    status: 'active'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike@example.com',
    role: 'moderator',
    isPremium: true,
    joinDate: '2024-01-05',
    lastActive: '2024-01-18',
    status: 'active'
  }
];

const UserManagement = () => {
  const { hasPermission } = useRole();
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = (userId, newRole) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  const handleStatusChange = (userId, newStatus) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  const handleBulkAction = (action) => {
    if (selectedUsers.length === 0) return;
    
    switch (action) {
      case 'delete':
        setUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)));
        break;
      case 'premium':
        setUsers(prev => prev.map(user => 
          selectedUsers.includes(user.id) ? { ...user, isPremium: true, role: 'premium' } : user
        ));
        break;
      case 'suspend':
        setUsers(prev => prev.map(user => 
          selectedUsers.includes(user.id) ? { ...user, status: 'suspended' } : user
        ));
        break;
    }
    setSelectedUsers([]);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return FiShield;
      case 'moderator': return FiCrown;
      case 'premium': return FiStar;
      default: return FiUser;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'text-red-400';
      case 'moderator': return 'text-purple-400';
      case 'premium': return 'text-yellow-400';
      default: return 'text-mystical-300';
    }
  };

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.MANAGE_USERS}>
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-mystical font-bold text-white mb-2">
              User Management
            </h1>
            <p className="text-mystical-200">
              Manage users, roles, and permissions
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-mystical-300">{users.length}</div>
            <div className="text-sm text-mystical-200">Total Users</div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mystical-card rounded-xl p-4"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mystical-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-mystical-300"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white focus:outline-none focus:border-mystical-300"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="moderator">Moderators</option>
              <option value="premium">Premium</option>
              <option value="user">Users</option>
            </select>
          </div>
        </motion.div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mystical-card rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-white">
                {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction('premium')}
                  className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded text-sm hover:bg-yellow-500/30"
                >
                  Make Premium
                </button>
                <button
                  onClick={() => handleBulkAction('suspend')}
                  className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded text-sm hover:bg-orange-500/30"
                >
                  Suspend
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 bg-red-500/20 text-red-300 rounded text-sm hover:bg-red-500/30"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mystical-card rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-mystical-600/30">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(filteredUsers.map(u => u.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-mystical-200 font-semibold">User</th>
                  <th className="px-4 py-3 text-left text-mystical-200 font-semibold">Role</th>
                  <th className="px-4 py-3 text-left text-mystical-200 font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-mystical-200 font-semibold">Join Date</th>
                  <th className="px-4 py-3 text-left text-mystical-200 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="border-b border-mystical-600/30 hover:bg-mystical-600/20"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(prev => [...prev, user.id]);
                          } else {
                            setSelectedUsers(prev => prev.filter(id => id !== user.id));
                          }
                        }}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-white font-medium">{user.name}</div>
                        <div className="text-mystical-300 text-sm">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <SafeIcon 
                          icon={getRoleIcon(user.role)} 
                          className={`w-4 h-4 ${getRoleColor(user.role)}`} 
                        />
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="bg-mystical-600/30 text-white text-sm rounded px-2 py-1 border border-mystical-500/30"
                          disabled={!hasPermission(PERMISSIONS.MANAGE_USERS)}
                        >
                          <option value="user">User</option>
                          <option value="premium">Premium</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.status === 'active' 
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-mystical-200 text-sm">
                      {new Date(user.joinDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-1 text-mystical-300 hover:text-white rounded"
                        >
                          <SafeIcon icon={FiEdit} className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(user.id, user.status === 'active' ? 'suspended' : 'active')}
                          className="p-1 text-mystical-300 hover:text-white rounded"
                        >
                          <SafeIcon icon={FiMoreVertical} className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="mystical-card rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {users.filter(u => u.status === 'active').length}
            </div>
            <div className="text-mystical-200 text-sm">Active Users</div>
          </div>
          <div className="mystical-card rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {users.filter(u => u.isPremium).length}
            </div>
            <div className="text-mystical-200 text-sm">Premium Users</div>
          </div>
          <div className="mystical-card rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {users.filter(u => u.role === 'moderator').length}
            </div>
            <div className="text-mystical-200 text-sm">Moderators</div>
          </div>
          <div className="mystical-card rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-400">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <div className="text-mystical-200 text-sm">Admins</div>
          </div>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
};

export default UserManagement;