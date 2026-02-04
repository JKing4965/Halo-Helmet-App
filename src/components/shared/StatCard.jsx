// src/components/shared/StatCard.jsx
import React from 'react';

const StatCard = ({ label, value, subtext, color = "text-slate-800", icon: Icon }) => (
  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
    <div className="flex justify-between items-start mb-2">
      <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{label}</span>
      {Icon && <Icon size={16} className="text-slate-400" />}
    </div>
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
    {subtext && <div className="text-xs text-slate-400 mt-1">{subtext}</div>}
  </div>
);

export default StatCard;