import React from 'react';

export const StatusCard = ({ label, count, icon: Icon, type }) => {
  const styles = {
    total: {
      bg: 'bg-blue-50 border-blue-100',
      text: 'text-blue-700',
      countText: 'text-blue-900',
      iconBg: 'bg-blue-100',
    },
    normal: {
      bg: 'bg-green-50 border-green-100',
      text: 'text-green-700',
      countText: 'text-green-900',
      iconBg: 'bg-green-100',
    },
    attention: {
      bg: 'bg-amber-50 border-amber-100',
      text: 'text-amber-700',
      countText: 'text-amber-900',
      iconBg: 'bg-amber-100',
    },
    critical: {
      bg: 'bg-red-50 border-red-100 animate-pulse-slow',
      text: 'text-red-700',
      countText: 'text-red-900',
      iconBg: 'bg-red-100',
    },
  };

  const currentStyle = styles[type] || styles.total;

  return (
    <div className={`p-6 rounded-2xl border shadow-sm flex items-center justify-between transition hover:shadow-md ${currentStyle.bg}`}>
      <div>
        <p className={`text-sm font-semibold tracking-wide ${currentStyle.text}`}>{label}</p>
        <p className={`text-4xl font-extrabold mt-2 ${currentStyle.countText}`}>{count}</p>
      </div>
      <div className={`p-4 rounded-xl ${currentStyle.iconBg}`}>
        <Icon className={`h-7 w-7 ${currentStyle.text}`} />
      </div>
    </div>
  );
};
export default StatusCard;

