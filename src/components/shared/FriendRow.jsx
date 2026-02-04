import React from 'react';

const FriendRow = ({ friend }) => (
  <div className="flex items-center justify-between p-3 bg-white rounded-xl mb-2 shadow-sm border border-slate-50">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm">
        {friend.avatar}
      </div>
      <div>
        <div className="font-semibold text-sm text-slate-800">{friend.name}</div>
        <div className="text-xs text-slate-500">{friend.status}</div>
      </div>
    </div>
    <div className={`text-xs px-2 py-1 rounded-full font-medium ${
      friend.risk === 'Low' ? 'bg-emerald-50 text-emerald-600' : 
      friend.risk === 'Med' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
    }`}>
      {friend.risk} Risk
    </div>
  </div>
);

export default FriendRow;