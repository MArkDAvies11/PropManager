import React from 'react';
import { Link } from 'react-router-dom';
import { Home, MapPin, DollarSign, Bed, Bath } from 'lucide-react';

const PropertyCard = ({ property }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Home className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">{property.title}</h3>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            property.status === 'available' 
              ? 'bg-green-100 text-green-800'
              : property.status === 'occupied'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {property.status}
          </span>
        </div>

        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{property.address}, {property.city}, {property.state}</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {property.bedrooms && (
              <div className="flex items-center">
                <Bed className="h-4 w-4 mr-1" />
                <span>{property.bedrooms} beds</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center">
                <Bath className="h-4 w-4 mr-1" />
                <span>{property.bathrooms} baths</span>
              </div>
            )}
          </div>
          <div className="flex items-center text-lg font-semibold text-gray-900">
            <DollarSign className="h-5 w-5" />
            <span>{property.monthly_rent}/month</span>
          </div>
        </div>

        {property.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{property.description}</p>
        )}

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 capitalize">{property.property_type}</span>
          <Link
            to={`/properties/${property.id}`}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;