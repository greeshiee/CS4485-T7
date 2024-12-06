import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api';

const PhoneTable = () => {
  const [phones, setPhones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPhones = async () => {
      try {
        const response = await apiClient.get('/phones');
        const data = response.data;
        
        // Transform the data into the format we need
        if (data && data.phones && Array.isArray(data.phones)) {
          const transformedPhones = data.phones.map(phone => ({
            id: phone[0],
            brand: phone[1],
            release_date: phone[2]
          }));
          setPhones(transformedPhones);
        } else {
          setError('Invalid data format received');
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchPhones();
  }, []);
  

  if (loading) {
    return (
      <div className="container mx-auto px-4">
        <div className="text-center py-4">Loading phones...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="mb-4">
        <Link
          to="/phone-specs"
          className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Back to Search
        </Link>
      </div>

      <div className="bg-white shadow-md rounded my-6">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">ID</th>
              <th className="py-3 px-6 text-left">Brand</th>
              <th className="py-3 px-6 text-left">Release Date</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {phones.map((phone) => (
              <tr 
                key={phone.id}
                className="border-b border-gray-200 hover:bg-gray-100"
              >
                <td className="py-3 px-6">{phone.id}</td>
                <td className="py-3 px-6">{phone.brand}</td>
                <td className="py-3 px-6">{phone.release_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-gray-600 text-sm">
        Total Brands: {phones.length}
      </div>
    </div>
  );
};

export default PhoneTable;