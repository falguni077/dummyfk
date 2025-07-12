import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaTrash, FaChartBar, FaUsers, FaBox } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const [pendingItems, setPendingItems] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [pendingRes, statsRes] = await Promise.all([
        axios.get('/api/admin/items/pending'),
        axios.get('/api/admin/stats')
      ]);

      setPendingItems(pendingRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleItemAction = async (itemId, action) => {
    try {
      await axios.put(`/api/admin/items/${itemId}/${action}`);
      toast.success(`Item ${action}ed successfully`);
      fetchAdminData();
    } catch (error) {
      toast.error(`Failed to ${action} item`);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`/api/admin/items/${itemId}`);
        toast.success('Item deleted successfully');
        fetchAdminData();
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Panel
        </h1>
        <p className="text-gray-600">
          Manage the platform and moderate content
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="card-body text-center">
            <FaUsers className="text-3xl text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stats.totalUsers || 0}
            </div>
            <div className="text-gray-600">Total Users</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <FaBox className="text-3xl text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stats.totalItems || 0}
            </div>
            <div className="text-gray-600">Total Items</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <FaChartBar className="text-3xl text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stats.pendingItems || 0}
            </div>
            <div className="text-gray-600">Pending Items</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <FaCheck className="text-3xl text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stats.completedSwaps || 0}
            </div>
            <div className="text-gray-600">Completed Swaps</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'pending'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending Items
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'stats'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Platform Stats
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'pending' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Pending Items for Review</h2>
          
          {pendingItems.length === 0 ? (
            <div className="text-center py-12">
              <FaCheck className="text-4xl text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No pending items
              </h3>
              <p className="text-gray-600">
                All items have been reviewed
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingItems.map((item) => (
                <div key={item._id} className="card">
                  <div className="card-body">
                    <div className="flex items-start gap-4">
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-24 h-24 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {item.description}
                        </p>
                        <div className="flex gap-2 mb-2">
                          <span className="badge badge-info">{item.category}</span>
                          <span className="badge badge-warning">{item.size}</span>
                          <span className="badge badge-success">{item.pointsValue} points</span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Listed by {item.owner.name} ({item.owner.email})
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleItemAction(item._id, 'approve')}
                          className="btn btn-success btn-sm"
                        >
                          <FaCheck className="mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleItemAction(item._id, 'reject')}
                          className="btn btn-danger btn-sm"
                        >
                          <FaTimes className="mr-1" />
                          Reject
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item._id)}
                          className="btn btn-outline btn-sm"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <div className="card-body">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Users:</span>
                    <span className="font-semibold">{stats.totalUsers || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Items:</span>
                    <span className="font-semibold">{stats.totalItems || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Approved Items:</span>
                    <span className="font-semibold">{stats.approvedItems || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending Items:</span>
                    <span className="font-semibold">{stats.pendingItems || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Swaps</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Swaps:</span>
                    <span className="font-semibold">{stats.totalSwaps || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed Swaps:</span>
                    <span className="font-semibold">{stats.completedSwaps || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Success Rate:</span>
                    <span className="font-semibold">{stats.swapSuccessRate || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Approval Rate:</span>
                    <span className="font-semibold">{stats.approvalRate || 0}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel; 