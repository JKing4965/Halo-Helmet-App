import React, { useState } from 'react';
import { ChevronLeft, Activity, MapPin, Clock, Phone, X } from 'lucide-react';
import GPSMap from './GPSMap.jsx';
import BrainViz from './BrainViz.jsx';
import ToggleSlider from './shared/ToggleSlider.jsx';
import { RESORTS } from '../utils/resortData';

const FriendDetailView = ({ friend, onBack, formatForce }) => {
  const [showPatrolModal, setShowPatrolModal] = useState(false);
  const [viewMode, setViewMode] = useState('Brain Map');
  const isLive = friend.status.includes('Live');
  
  const friendResort = RESORTS.find(r => r.id === friend.resortId);

  // Fallback formatter if not provided
  const displayForce = (val) => formatForce ? formatForce(val) : `${val}g`;

  // Mock a single "current location" impact for the map if live
  const mapData = isLive && friend.location ? [{
    id: 'live-loc',
    lat: friend.location.lat,
    lng: friend.location.lng,
    gForce: 0, 
    time: 'Now'
  }] : [];

  // Calculate stats for heatmap if details exist
  const cumulativeStats = friend.impactDetails?.reduce((acc, impact) => {
    acc[impact.zone] = (acc[impact.zone] || 0) + impact.gForce;
    return acc;
  }, {}) || {};

  return (
    <div className="h-full flex flex-col bg-[#f8fafc] animate-in slide-in-from-right-8 duration-300 relative">
      {/* Header */}
      <div className="flex items-center gap-3 p-6 pb-4 shrink-0">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1">
           <h1 className="text-xl font-bold text-slate-900">{friend.name}</h1>
           <p className="text-xs text-slate-500">
             {friend.status} {friendResort ? `at ${friendResort.name}` : ''}
           </p>
        </div>
        {isLive && friendResort && (
          <button 
            onClick={() => setShowPatrolModal(true)}
            className="bg-red-50 text-red-500 p-2.5 rounded-full hover:bg-red-100 transition-colors animate-pulse"
          >
            <Phone size={20} fill="currentColor" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        
        {/* Visualization Toggle */}
        <div className="px-6 mb-4">
          <ToggleSlider 
            leftLabel="Brain Map" 
            rightLabel="GPS Map" 
            value={viewMode} 
            onToggle={setViewMode} 
          />
        </div>

        {/* Live Map / Brain Section */}
        <div className="h-64 w-full bg-slate-900 relative mb-6">
           {viewMode === 'Brain Map' ? (
             <BrainViz 
               activeZone={null} 
               cumulativeStats={cumulativeStats} 
               autoRotate={true} 
               isInteractive={false} 
             />
           ) : (
             <>
               {isLive && (
                 <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded animate-pulse flex items-center gap-1">
                   <span className="w-2 h-2 bg-white rounded-full"></span> LIVE TRACKING
                 </div>
               )}
               {isLive && friend.location ? (
                 <GPSMap 
                   impacts={mapData} 
                   activeImpactId={'live-loc'} 
                   onImpactClick={() => {}} 
                   initialCenter={friend.location}
                 />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
                   No GPS Data Available
                 </div>
               )}
             </>
           )}
        </div>

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

      {/* Ski Patrol Modal */}
      {showPatrolModal && friendResort && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone size={32} fill="currentColor" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">Call Ski Patrol?</h3>
              <p className="text-sm text-slate-500">Contacting {friendResort.name} Patrol for {friend.name}.</p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl text-center mb-6 border border-slate-100">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Emergency Number</span>
              <span className="text-2xl font-mono font-bold text-slate-900">{friendResort.patrolNumber}</span>
            </div>

            <div className="space-y-3">
              <a href={`tel:${friendResort.patrolNumber}`} className="block w-full bg-red-500 text-white font-bold py-4 rounded-xl text-center shadow-lg hover:bg-red-600 transition-colors">
                Dial Now
              </a>
              <button onClick={() => setShowPatrolModal(false)} className="block w-full bg-white text-slate-500 font-bold py-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendDetailView;