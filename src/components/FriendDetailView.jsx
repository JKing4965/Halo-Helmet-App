import React from 'react';
import { ChevronLeft, Activity, MapPin, Clock } from 'lucide-react';
import GPSMap from './GPSMap.jsx';

const FriendDetailView = ({ friend, onBack, formatForce }) => {
  const isLive = friend.status.includes('Live');

  // Fallback formatter if not provided
  const displayForce = (val) => formatForce ? formatForce(val) : `${val}g`;

  // Mock a single "current location" impact for the map if live
  const mapData = isLive && friend.location ? [{
    id: 'live-loc',
    lat: friend.location.lat,
    lng: friend.location.lng,
    gForce: 0, // 0 to show green/neutral marker or we could customize GPSMap to handle 'neutral'
    time: 'Now'
  }] : [];

  return (
    <div className="h-full flex flex-col bg-[#f8fafc] animate-in slide-in-from-right-8 duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 p-6 pb-4 shrink-0">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
           <h1 className="text-xl font-bold text-slate-900">{friend.name}</h1>
           <p className="text-xs text-slate-500">{friend.status}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Live Map Section */}
        {isLive && friend.location && (
          <div className="h-64 w-full bg-slate-200 relative mb-6">
             <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded animate-pulse flex items-center gap-1">
               <span className="w-2 h-2 bg-white rounded-full"></span> LIVE TRACKING
             </div>
             <GPSMap impacts={mapData} activeImpactId={'live-loc'} onImpactClick={() => {}} />
          </div>
        )}

        <div className="px-6 space-y-4 pb-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <Activity size={16} />
                <span className="text-xs font-bold uppercase">Recent Risk</span>
              </div>
              <div className={`text-2xl font-bold ${
                friend.risk === 'High' ? 'text-red-500' : 
                friend.risk === 'Med' ? 'text-amber-500' : 'text-emerald-500'
              }`}>
                {friend.risk}
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <Clock size={16} />
                <span className="text-xs font-bold uppercase">Last Active</span>
              </div>
              <div className="text-sm font-bold text-slate-800 mt-1">
                {friend.lastActive}
              </div>
            </div>
          </div>

          {/* Recent Impact Summary */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-slate-800 font-bold mb-4 flex items-center gap-2">
              <Activity size={18} className="text-[#0f4c81]" />
              Session Summary
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                <span className="text-slate-500 text-sm">Total Impacts</span>
                <span className="font-bold text-slate-800">{friend.recentImpacts.count}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm">Peak Force</span>
                <span className="font-bold text-slate-800">{displayForce(friend.recentImpacts.maxForce)}</span>
              </div>
            </div>
          </div>
          
          {!isLive && (
            <div className="flex items-center justify-center p-8 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-sm">
              <MapPin size={16} className="mr-2" />
              Location hidden (Offline)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendDetailView;