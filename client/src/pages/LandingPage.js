import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaRecycle, FaUsers, FaLeaf, FaArrowRight } from 'react-icons/fa';
import axios from 'axios';

const LandingPage = () => {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        const response = await axios.get('/api/items/featured');
        setFeaturedItems(response.data);
      } catch (error) {
        console.error('Error fetching featured items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedItems();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Sustainable Fashion Through
              <span className="text-green-600"> Community Exchange</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join ReWear and give your unused clothing a second life. Swap items directly or use our point-based system to build a more sustainable wardrobe.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/browse" className="btn btn-primary btn-lg">
                Start Swapping
                <FaArrowRight className="ml-2" />
              </Link>
              <Link to="/register" className="btn btn-outline btn-lg">
                Join Community
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose ReWear?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform makes sustainable fashion accessible and rewarding for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaRecycle className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Direct Swaps
              </h3>
              <p className="text-gray-600">
                Exchange your clothing directly with other community members. No money involved, just sustainable fashion.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUsers className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Point System
              </h3>
              <p className="text-gray-600">
                Earn points by listing items and redeem them for clothing you love. Build your sustainable wardrobe.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaLeaf className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Eco-Friendly
              </h3>
              <p className="text-gray-600">
                Reduce textile waste and promote circular fashion. Every swap helps the environment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items Section */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Items
            </h2>
            <p className="text-xl text-gray-600">
              Discover amazing clothing waiting for a new home
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredItems.map((item) => (
                <div key={item._id} className="card hover:shadow-lg transition-shadow">
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
                    <p className="text-gray-600 text-sm mb-3">
                      {item.description.substring(0, 100)}...
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-green-600 font-semibold">
                        {item.pointsValue} points
                      </span>
                      <Link 
                        to={`/item/${item._id}`}
                        className="btn btn-primary btn-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/browse" className="btn btn-primary btn-lg">
              Browse All Items
              <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600 text-white">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Your Sustainable Fashion Journey?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of users who are already making a difference through clothing exchange.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn bg-white text-green-600 hover:bg-gray-100 btn-lg">
                Get Started
              </Link>
              <Link to="/browse" className="btn btn-outline border-white text-white hover:bg-white hover:text-green-600 btn-lg">
                Explore Items
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 