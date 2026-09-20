import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, ArrowRight, Edit3 } from 'lucide-react';

export const LocationCard = ({ location }) => {
  const { id, name, building, description, current_status, last_checked } = location;

  const statusStyles = {
    normal: 'bg-green-100 text-green-800 border-green-200',
    attention: 'bg-amber-100 text-amber-800 border-amber-200',
    critical: 'bg-red-100 text-red-800 border-red-200 animate-pulse',
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-lime-50 rounded-2xl border border-lime-200 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between overflow-hidden">
      {/* Top section */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <span className={`text-xs uppercase font-bold px-2.5 py-1 rounded-full border ${statusStyles[current_status]}`}>
            {current_status}
          </span>
          <div className="text-gray-400">
            <MapPin className="h-5 w-5" />
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-1">{name}</h3>
        <p className="text-sm font-semibold text-green-700 mb-2">{building}</p>
        <p className="text-gray-500 text-sm line-clamp-2 min-h-[2.5rem]">
          {description || 'No description provided.'}
        </p>
      </div>

      {/* Footer section */}
      <div className="bg-lime-100/50 px-6 py-4 border-t border-lime-200/50 flex flex-col space-y-3">
        <div className="flex items-center text-xs text-gray-400 space-x-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <span>Last checked: {formatDate(last_checked)}</span>
        </div>
        <div className="flex justify-between space-x-2">
          <Link
            to={`/locations/${id}/update`}
            className="flex-1 inline-flex items-center justify-center space-x-1.5 px-3 py-2 bg-lime-50 hover:bg-lime-100 border border-lime-200 rounded-lg text-xs font-semibold text-gray-700 transition"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Update Status</span>
          </Link>
          <Link
            to={`/locations/${id}`}
            className="inline-flex items-center justify-center p-2 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 transition"
            title="View Details & History"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
export default LocationCard;

