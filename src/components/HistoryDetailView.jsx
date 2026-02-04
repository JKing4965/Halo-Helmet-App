import React, { useState } from 'react';
import { ChevronLeft, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import BrainViz from './BrainViz.jsx';
import GPSMap from './GPSMap.jsx';
import ToggleSlider from './shared/ToggleSlider.jsx';
import { RESORTS } from '../utils/resortData';

const HistoryDetailView = ({ session, onBack, formatForce }) => {
  const [selectedImpactId, setSelectedImpactId] = useState(null);
  const [viewMode, setViewMode] = useState('Brain Map');

  // Find the resort name if available
  const sessionResort = RESORTS.find(r => r.id === session.resortId);

  // Find the currently selected impact object to get its zone
  const selectedImpact = session?.impactDetails?.find(i => i.id === selectedImpactId);
  const activeZone = selectedImpact ? selectedImpact.zone : null;

  // Fallback formatter if not provided
  const displayForce = (val) => formatForce ? formatForce(val) : `${val}g`;

  const getImpactColor = (gForce) => {
    if (gForce >= 60) return 'text-red-500 bg-red-50 border-red-100';
    if (gForce >= 30) return 'text-amber-500 bg-amber-50 border-amber-100';
    return 'text-emerald-500 bg-emerald-50 border-emerald-100';
  };

  const getRiskLabel = (gForce) => {
      if (gForce >= 60) return 'High';
      if (gForce >= 30) return 'Med';
      return 'Low';
  };

  return (
    <div className="h-full flex flex-col bg-[#f8fafc] animate-in slide-in-from-right-8 duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 p-6 pb-2 shrink-0">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1">
           <h1 className="text-xl font-bold text-slate-900">{session.type} Session</h1>
           <p className="text-xs text-slate-500">
             {session.date} • {session.impacts} Impacts
             {sessionResort ? ` • ${sessionResort.name}` : ''}
           </p>
        </div>
      </div>

      {/* Visualization Container */}
      <div className="px-6 mb-4">
        <ToggleSlider 
          leftLabel="Brain Map" 
          rightLabel="GPS Map" 
          value={viewMode} 
          onToggle={setViewMode} 
        />
      </div>

      <div className="h-64 shrink-0 relative w-full bg-slate-900 shadow-inner overflow-hidden transition-all duration-300">
         {viewMode === 'Brain Map' ? (
           <>
             <div className="absolute top-4 left-4 z-10 bg-slate-800/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Selected Zone</span>
                <span className="text-white font-bold capitalize">{activeZone || 'None'}</span>
             </div>
             <BrainViz activeZone={activeZone} autoRotate={!activeZone} isInteractive={false} />
           </>
         ) : (
           <GPSMap 
             impacts={session.impactDetails} 
             activeImpactId={selectedImpactId} 
             onImpactClick={setSelectedImpactId} 
             initialCenter={sessionResort}
           />
         )}
      </div>

      {/* Impact List */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1">Impact Timeline</h3>
        
        {session.impactDetails && session.impactDetails.length > 0 ? (
           <div className="space-y-3">
             {session.impactDetails.map((impact) => {
               const isSelected = selectedImpactId === impact.id;
               const colorClass = getImpactColor(impact.gForce);
               
               return (
                 <button
                   key={impact.id}
                   onClick={() => setSelectedImpactId(isSelected ? null : impact.id)}
                   className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                     isSelected 
                       ? 'bg-white border-[#0f4c81] ring-1 ring-[#0f4c81] shadow-md' 
                       : 'bg-white border-slate-100 shadow-sm hover:border-slate-300'
                   }`}
                 >
                   <div className="flex items-center gap-4">
                     <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${colorClass}`}>
                        <span className="text-sm font-bold">{displayForce(impact.gForce)}</span>
                     </div>
                     <div className="text-left">
                       <div className="font-bold text-slate-800 capitalize">{impact.zone} Lobe</div>
                       <div className="text-xs text-slate-400 font-medium">{impact.time}</div>
                     </div>
                   </div>
                   
                   <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${
                       impact.gForce >= 60 ? 'bg-red-100 text-red-600 border-red-200' : 
                       impact.gForce >= 30 ? 'bg-amber-100 text-amber-600 border-amber-200' : 
                       'bg-emerald-100 text-emerald-600 border-emerald-200'
                   }`}>
                     {getRiskLabel(impact.gForce)}
                   </div>
                 </button>
               );
             })}
           </div>
        ) : (
           <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <CheckCircle size={48} className="mb-2 text-emerald-400 opacity-50" />
              <p className="font-medium">No impacts recorded.</p>
              <p className="text-xs opacity-70">A safe and clean run!</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default HistoryDetailView;