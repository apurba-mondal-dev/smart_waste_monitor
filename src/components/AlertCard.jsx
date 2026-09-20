import React from 'react';
import { AlertCircle, CheckCircle2, User, Clock } from 'lucide-react';

export const AlertCard = ({ alert, onResolve }) => {
  const { id, location_name, severity, message, status, created_at, resolved_at, resolved_by_name } = alert;

  const severityColors = {
    Low: 'bg-blue-100 text-blue-800 border-blue-200',
    Medium: 'bg-amber-100 text-amber-800 border-amber-200',
    High: 'bg-red-100 text-red-800 border-red-200 animate-pulse',
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDuration = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const diffMs = e - s;
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''}`;
    }
    const diffHours = Math.floor(diffMins / 60);
    const remMins = diffMins % 60;
    return `${diffHours} hr${diffHours !== 1 ? 's' : ''} ${remMins} min${remMins !== 1 ? 's' : ''}`;
  };

  return (
    <div className={`p-6 rounded-2xl border bg-lime-50 shadow-sm flex flex-col justify-between transition hover:shadow-md ${
      status === 'open' ? 'border-red-200 bg-red-50/10' : 'border-lime-200'
    }`}>
      {/* Header */}
      <div>
        <div className="flex justify-between items-start mb-4">
          <span className={`text-xs uppercase font-extrabold px-2.5 py-1 rounded-full border ${severityColors[severity] || severityColors.High}`}>
            {severity} Severity
          </span>
          <div className="flex items-center space-x-1">
            {status === 'open' ? (
              <span className="flex items-center text-red-600 text-xs font-bold uppercase tracking-wider">
                <AlertCircle className="h-4 w-4 mr-1 text-red-500" />
                Active
              </span>
            ) : (
              <span className="flex items-center text-green-600 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                Resolved
              </span>
            )}
          </div>
        </div>

        <h3 className="text-base font-bold text-gray-900 mb-1">{location_name}</h3>
        <p className="text-gray-600 text-sm mb-4 font-medium">{message}</p>
      </div>

      {/* Footer Info & Actions */}
      <div className="border-t border-gray-100 pt-4 flex flex-col space-y-3">
        <div className="flex flex-col space-y-1.5 text-xs text-gray-400">
          <div className="flex items-center space-x-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>Opened: {formatDate(created_at)}</span>
          </div>

          {status === 'resolved' && (
            <>
              <div className="flex items-center space-x-1.5 text-green-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Resolved: {formatDate(resolved_at)}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <User className="h-3.5 w-3.5" />
                <span>Resolved by: {resolved_by_name || 'Admin'}</span>
              </div>
              <div className="font-semibold text-gray-500">
                Response time: {calculateDuration(created_at, resolved_at)}
              </div>
            </>
          )}
        </div>

        {status === 'open' && (
          <button
            onClick={() => onResolve(id)}
            className="w-full inline-flex items-center justify-center space-x-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold tracking-wide transition shadow-sm hover:shadow-md"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Resolve Alert</span>
          </button>
        )}
      </div>
    </div>
  );
};
export default AlertCard;

