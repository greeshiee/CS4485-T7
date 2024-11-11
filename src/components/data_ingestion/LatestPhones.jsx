import React from 'react';
import { Link } from 'react-router-dom';

const LatestPhones = ({ phones }) => {
  if (!phones || phones.length === 0) {
    return (
      <div className="text-center py-4 text-gray-600">
        No latest phones available
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Latest Phones</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {phones.map((phone) => (
          <div 
            key={phone.slug}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-800 mb-2 min-h-[3rem] line-clamp-2">
                {phone.phone_name}
              </h3>
            </div>
            <div className="h-48 overflow-hidden px-4">
              <img
                src={phone.image}
                alt={phone.phone_name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                }}
              />
            </div>
            <div className="p-4 bg-gray-50 border-t">
              <Link
                to={`/phone/${phone.slug}`}
                className="block w-full text-center py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LatestPhones;