import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LatestPhones from './LatestPhones';  // Import the new component
import apiClient from '../../services/api';
const PhoneSpecsApp = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [latestPhones, setLatestPhones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLatestPhones();
  }, []);

  const fetchLatestPhones = async () => {
    try {
      const response = await apiClient.get('/latest');
      const data = response.data;
      setLatestPhones(data.latest.phones || []);
    } catch (err) {
      console.error('Error fetching latest phones:', err);
      setError('Failed to load latest phones');
    } finally {
      setLoading(false);
    }
  };
  

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
  
    try {
      const response = await apiClient.get('/search', {
        params: {
          query: searchQuery.trim(),
        },
      });
      const data = response.data;
      // Handle search results as needed
    } catch (err) {
      console.error('Search error:', err);
      setError('Search failed');
    }
  };
  

  return (
    <div className="container mx-auto px-4">
      {/* Search Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Phone Specifications</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for phones..."
            className="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-electricblue"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-electricblue text-white rounded-lg hover:bg-darkerblue focus:outline-none focus:ring-2 focus:ring-electricblue"
          >
            Search
          </button>
          <Link
            to="/phones"
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            View All
          </Link>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electricblue mx-auto"></div>
        </div>
      ) : (
        <LatestPhones phones={latestPhones} />
      )}
    </div>
  );
};

export default PhoneSpecsApp;