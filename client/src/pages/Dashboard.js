import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaPlus, FaEye, FaEdit, FaTrash, FaExchangeAlt } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [myItems, setMyItems] = useState([]);
  const [mySwaps, setMySwaps] = useState([]);
  const [receivedSwaps, setReceivedSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('items');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [itemsRes, swapsRes, receivedRes] = await Promise.all([
        axios.get('/api/items/user/me'),
        axios.get('/api/swaps/my-requests'),
        axios.get('/api/swaps/my-items')
      ]);

      setMyItems(itemsRes.data);
      setMySwaps(swapsRes.data);
      setReceivedSwaps(receivedRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSwapAction = async (swapId, action) => {
    try {
      await axios.put(`/api/swaps/${swapId}/${action}`);
      toast.success(`Swap ${action}ed successfully`);
      fetchDashboardData();
    } catch (error) {
      toast.error(`Failed to ${action} swap`);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`/api/items/${itemId}`);
        toast.success('Item deleted successfully');
        fetchDashboardData();
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
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Manage your items, swaps, and profile
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {user?.points}
            </div>
            <div className="text-gray-600">Points Balance</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {myItems.length}
            </div>
            <div className="text-gray-600">My Items</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {mySwaps.length}
            </div>
            <div className="text-gray-600">My Requests</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {receivedSwaps.length}
            </div>
            <div className="text-gray-600">Received Requests</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('items')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'items'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Items
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'requests'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Requests
          </button>
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'received'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Received Requests
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'items' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Items</h2>
            <Link to="/add-item" className="btn btn-primary">
              <FaPlus className="mr-2" />
              Add New Item
            </Link>
          </div>

          {myItems.length === 0 ? (
            <div className="text-center py-12">
              <FaExchangeAlt className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No items yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start by adding your first item to the community
              </p>
              <Link to="/add-item" className="btn btn-primary">
                Add Your First Item
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myItems.map((item) => (
                <div key={item._id} className="card">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="card-body">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="badge badge-success">
                        {item.status}
                      </span>
                      <span className="text-green-600 font-semibold">
                        {item.pointsValue} points
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/item/${item._id}`}
                        className="btn btn-outline btn-sm flex-1"
                      >
                        <FaEye className="mr-1" />
                        View
                      </Link>
                      <Link
                        to={`/edit-item/${item._id}`}
                        className="btn btn-outline btn-sm"
                      >
                        <FaEdit />
                      </Link>
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="btn btn-danger btn-sm"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Swap Requests</h2>
          {mySwaps.length === 0 ? (
            <div className="text-center py-12">
              <FaExchangeAlt className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No swap requests yet
              </h3>
              <p className="text-gray-600">
                Start browsing items to make your first swap request
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {mySwaps.map((swap) => (
                <div key={swap._id} className="card">
                  <div className="card-body">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src={swap.itemRequested.images[0]}
                          alt={swap.itemRequested.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {swap.itemRequested.title}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Requested from {swap.itemRequested.owner.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {swap.swapType === 'points' 
                              ? `${swap.pointsOffered} points offered`
                              : 'Direct swap'
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${
                          swap.status === 'pending' ? 'badge-warning' :
                          swap.status === 'accepted' ? 'badge-success' :
                          swap.status === 'rejected' ? 'badge-error' :
                          'badge-info'
                        }`}>
                          {swap.status}
                        </span>
                        {swap.status === 'pending' && (
                          <button
                            onClick={() => handleSwapAction(swap._id, 'cancel')}
                            className="btn btn-danger btn-sm"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'received' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Received Swap Requests</h2>
          {receivedSwaps.length === 0 ? (
            <div className="text-center py-12">
              <FaExchangeAlt className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No received requests yet
              </h3>
              <p className="text-gray-600">
                When someone requests your items, they'll appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {receivedSwaps.map((swap) => (
                <div key={swap._id} className="card">
                  <div className="card-body">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src={swap.itemRequested.images[0]}
                          alt={swap.itemRequested.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {swap.itemRequested.title}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Requested by {swap.requester.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {swap.swapType === 'points' 
                              ? `${swap.pointsOffered} points offered`
                              : 'Direct swap'
                            }
                          </p>
                          {swap.message && (
                            <p className="text-sm text-gray-600 mt-1">
                              "{swap.message}"
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${
                          swap.status === 'pending' ? 'badge-warning' :
                          swap.status === 'accepted' ? 'badge-success' :
                          swap.status === 'rejected' ? 'badge-error' :
                          'badge-info'
                        }`}>
                          {swap.status}
                        </span>
                        {swap.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSwapAction(swap._id, 'accept')}
                              className="btn btn-success btn-sm"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleSwapAction(swap._id, 'reject')}
                              className="btn btn-danger btn-sm"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard; 