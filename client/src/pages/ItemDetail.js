import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaHeart, FaShare, FaExchangeAlt, FaCoins, FaUser, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapType, setSwapType] = useState('direct');
  const [selectedItem, setSelectedItem] = useState('');
  const [myItems, setMyItems] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const response = await axios.get(`/api/items/${id}`);
      setItem(response.data);
    } catch (error) {
      console.error('Error fetching item:', error);
      toast.error('Failed to load item');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyItems = async () => {
    try {
      const response = await axios.get('/api/items/user/me');
      setMyItems(response.data.filter(item => item.isAvailable && item.status === 'approved'));
    } catch (error) {
      console.error('Error fetching my items:', error);
    }
  };

  const handleSwapRequest = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to make a swap request');
      return;
    }

    if (item.owner._id === user.id) {
      toast.error('You cannot swap your own item');
      return;
    }

    if (swapType === 'direct' && !selectedItem) {
      toast.error('Please select an item to offer');
      return;
    }

    try {
      const swapData = {
        itemRequested: id,
        swapType,
        message
      };

      if (swapType === 'direct') {
        swapData.itemOffered = selectedItem;
      } else {
        swapData.pointsOffered = item.pointsValue;
      }

      await axios.post('/api/swaps', swapData);
      toast.success('Swap request sent successfully!');
      setShowSwapModal(false);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send swap request');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Item not found</h1>
          <button onClick={() => navigate('/browse')} className="btn btn-primary">
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div>
          <div className="aspect-square overflow-hidden rounded-lg mb-4">
            <img
              src={item.images[currentImageIndex]}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          {item.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {item.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`aspect-square overflow-hidden rounded ${
                    currentImageIndex === index ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <img
                    src={image}
                    alt={`${item.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Item Details */}
        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {item.title}
            </h1>
            <div className="flex items-center gap-4 text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <FaUser />
                <span>{item.owner.name}</span>
              </div>
              {item.owner.location && (
                <div className="flex items-center gap-1">
                  <FaMapMarkerAlt />
                  <span>{item.owner.location}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2 mb-4">
              <span className="badge badge-info">{item.category}</span>
              <span className="badge badge-warning">{item.size}</span>
              <span className="badge badge-success">{item.condition}</span>
            </div>
            <div className="text-2xl font-bold text-green-600 mb-4">
              {item.pointsValue} points
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-600 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Additional Details */}
          {(item.brand || item.color || item.material) && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {item.brand && (
                  <div>
                    <span className="text-gray-500 text-sm">Brand</span>
                    <p className="font-medium">{item.brand}</p>
                  </div>
                )}
                {item.color && (
                  <div>
                    <span className="text-gray-500 text-sm">Color</span>
                    <p className="font-medium">{item.color}</p>
                  </div>
                )}
                {item.material && (
                  <div>
                    <span className="text-gray-500 text-sm">Material</span>
                    <p className="font-medium">{item.material}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag, index) => (
                  <span key={index} className="badge badge-outline">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            {isAuthenticated && item.owner._id !== user.id && item.isAvailable ? (
              <>
                <button
                  onClick={() => {
                    if (swapType === 'direct') {
                      fetchMyItems();
                    }
                    setShowSwapModal(true);
                  }}
                  className="btn btn-primary flex-1"
                >
                  <FaExchangeAlt className="mr-2" />
                  Request Swap
                </button>
                <button
                  onClick={() => {
                    setSwapType('points');
                    setShowSwapModal(true);
                  }}
                  className="btn btn-success"
                >
                  <FaCoins className="mr-2" />
                  Redeem with Points
                </button>
              </>
            ) : !isAuthenticated ? (
              <button
                onClick={() => navigate('/login')}
                className="btn btn-primary flex-1"
              >
                Login to Swap
              </button>
            ) : !item.isAvailable ? (
              <div className="text-center w-full">
                <span className="text-gray-500">This item is no longer available</span>
              </div>
            ) : (
              <div className="text-center w-full">
                <span className="text-gray-500">This is your item</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Swap Modal */}
      {showSwapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Request Swap
            </h2>
            
            <div className="mb-4">
              <label className="form-label">Swap Type</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="direct"
                    checked={swapType === 'direct'}
                    onChange={(e) => setSwapType(e.target.value)}
                    className="mr-2"
                  />
                  Direct Swap
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="points"
                    checked={swapType === 'points'}
                    onChange={(e) => setSwapType(e.target.value)}
                    className="mr-2"
                  />
                  Points ({item.pointsValue} points)
                </label>
              </div>
            </div>

            {swapType === 'direct' && (
              <div className="mb-4">
                <label className="form-label">Select Item to Offer</label>
                <select
                  className="form-select"
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                >
                  <option value="">Choose an item...</option>
                  {myItems.map(item => (
                    <option key={item._id} value={item._id}>
                      {item.title} ({item.pointsValue} points)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-4">
              <label className="form-label">Message (Optional)</label>
              <textarea
                className="form-textarea"
                placeholder="Add a message to your swap request..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSwapRequest}
                className="btn btn-primary flex-1"
              >
                Send Request
              </button>
              <button
                onClick={() => setShowSwapModal(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetail; 