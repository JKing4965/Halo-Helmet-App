import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  History, 
  Home, 
  Settings, 
  Plus, 
  User, 
  Brain, 
  X, 
  ChevronRight, 
  Play, 
  Square, 
  Clock, 
  ChevronLeft, 
  Info, 
  LogOut, 
  Shield, 
  CreditCard, 
  Bell,
  Search,
  MapPin,
  Phone
} from 'lucide-react';

import { LOBE_STATS, MOCK_FRIENDS, MOCK_HISTORY } from './utils/constants';
import { RESORTS } from './utils/resortData';
import { findNearestResort, getDistanceFromLatLonInKm } from './utils/geoUtils';
import BrainViz from './components/BrainViz.jsx';
import GPSMap from './components/GPSMap.jsx';
import StatCard from './components/shared/StatCard.jsx';
import FriendRow from './components/shared/FriendRow.jsx';
import ToggleSlider from './components/shared/ToggleSlider.jsx';
import HistoryDetailView from './components/HistoryDetailView.jsx';
import CommunityView from './components/CommunityView.jsx';
import FriendDetailView from './components/FriendDetailView.jsx';

export default function HaloHelmetApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [showBrainDetail, setShowBrainDetail] = useState(false);
  const [selectedLobe, setSelectedLobe] = useState(null);
  const [selectedHistorySession, setSelectedHistorySession] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  
  // App Settings State (The "Real" State)
  const [settingsPage, setSettingsPage] = useState('main'); 
  const [unitSystem, setUnitSystem] = useState('Metric'); 
  const [forceUnit, setForceUnit] = useState('G-Force'); 
  const [profile, setProfile] = useState({
    height: 180, 
    weight: 75,  
    headCirc: 58,
    gender: 'Male' 
  });
  const [privacySettings, setPrivacySettings] = useState({
    locationSharing: 'Always',
    profileVisibility: 'Friends',
    dataCollection: true
  });

  // Temporary Settings State
  const [tempUnitSystem, setTempUnitSystem] = useState('Metric');
  const [tempForceUnit, setTempForceUnit] = useState('G-Force');
  const [tempProfile, setTempProfile] = useState({});
  const [tempPrivacySettings, setTempPrivacySettings] = useState({});

  // Session State
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [currentImpacts, setCurrentImpacts] = useState([]);
  const [sessionPeakG, setSessionPeakG] = useState(0);
  const [activityType, setActivityType] = useState('Skiing');
  const [activeSessionViewMode, setActiveSessionViewMode] = useState('Brain Map');
  
  // Resort Selection & Safety State
  const [selectedResort, setSelectedResort] = useState(null);
  const [resortSearch, setResortSearch] = useState('');
  const [showPatrolModal, setShowPatrolModal] = useState(false);
  const [activeZoneFilter, setActiveZoneFilter] = useState(null); // Filter for active session
  
  // Simulated User Location (Start at Bryce Resort for prototype)
  const [userLocation, setUserLocation] = useState({ lat: 38.8166, lng: -78.7627 });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log("Geo error, using default", error);
        }
      );
    }
  }, []);

  // Filter and Sort Resorts
  const filteredResorts = useMemo(() => {
    return RESORTS.filter(r => 
      r.name.toLowerCase().includes(resortSearch.toLowerCase())
    ).sort((a, b) => {
      const distA = getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, a.lat, a.lng);
      const distB = getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, b.lat, b.lng);
      return distA - distB;
    });
  }, [resortSearch, userLocation]);

  // Auto-select nearest on load if none selected
  useEffect(() => {
    if (!selectedResort && filteredResorts.length > 0) {
      setSelectedResort(filteredResorts[0]);
    }
  }, [filteredResorts]);

  const handleOpenSettings = () => {
    setTempUnitSystem(unitSystem);
    setTempForceUnit(forceUnit);
    setTempProfile({ ...profile });
    setTempPrivacySettings({ ...privacySettings });
    setSettingsPage('main');
    setShowSettings(true);
  };

  const handleSaveSettings = () => {
    setUnitSystem(tempUnitSystem);
    setForceUnit(tempForceUnit);
    setProfile({ ...tempProfile });
    setPrivacySettings({ ...tempPrivacySettings });
    setShowSettings(false);
  };

  const handleCancelSettings = () => {
    setShowSettings(false);
  };

  const calculateForce = (gForce) => {
    if (forceUnit === 'G-Force') {
      return `${gForce}g`;
    } else {
      const mass = profile.weight || 75; 
      const newtons = Math.round(mass * gForce * 9.81);
      return `${newtons}N`;
    }
  };

  useEffect(() => {
    let interval;
    if (isSessionActive) {
      interval = setInterval(() => {
        setSessionTime(t => t + 1);
        if (Math.random() < 0.1) {
          const gForce = Math.floor(Math.random() * 60) + 10;
          const zone = ['frontal', 'temporal', 'occipital', 'parietal', 'cerebellum'][Math.floor(Math.random() * 5)];
          
          // Use selected resort location as base, or default
          const baseLat = selectedResort ? selectedResort.lat : 38.8166;
          const baseLng = selectedResort ? selectedResort.lng : -78.7627;

          const lat = baseLat + (Math.random() - 0.5) * 0.005;
          const lng = baseLng + (Math.random() - 0.5) * 0.005;
          
          const newImpact = { 
            id: Date.now(), 
            gForce, 
            zone, 
            time: new Date().toLocaleTimeString(),
            lat, 
            lng
          };
          setCurrentImpacts(prev => [newImpact, ...prev]);
          setSessionPeakG(prev => Math.max(prev, gForce));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive, selectedResort]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getRiskLabel = (gForce) => {
    if (gForce >= 60) return 'High';
    if (gForce >= 30) return 'Med';
    return 'Low';
  };

  const getImpactColor = (gForce) => {
    if (gForce >= 60) return 'text-red-500 bg-red-50 border-red-100';
    if (gForce >= 30) return 'text-amber-500 bg-amber-50 border-amber-100';
    return 'text-emerald-500 bg-emerald-50 border-emerald-100';
  };

  const renderDashboard = () => (
    <div className="h-full overflow-y-auto scrollbar-hide space-y-6 animate-in fade-in duration-500 p-6 pb-8">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-slate-900">Hello, Skyler</h1><p className="text-slate-500 text-sm">Ready to hit the slopes?</p></div>
        <button onClick={handleOpenSettings} className="p-2 bg-white rounded-full shadow-sm border border-slate-100 text-slate-600 hover:text-[#0f4c81] hover:bg-slate-50 bg-transparent"><Settings size={20} /></button>
      </div>
      <div className="bg-gradient-to-br from-[#0f4c81] to-[#0a355c] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-8 -translate-y-8"><Brain size={150} /></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4 opacity-90"><Activity size={18} /><span className="text-sm font-medium tracking-wide">CONCUSSION RISK MONITOR</span></div>
          <div className="flex items-end gap-3 mb-2"><span className="text-5xl font-bold">10%</span><span className="text-lg opacity-80 mb-2">Safe Range</span></div>
          <div className="w-full bg-white/20 h-2 rounded-full mt-4"><div className="bg-[#6ec6ff] h-2 rounded-full" style={{ width: '10%' }}></div></div>
          <p className="text-xs mt-2 opacity-70">Based on cumulative G-forces over the last 48 hours.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4"><StatCard label="Avg Impact" value={calculateForce(12)} subtext="Last 7 days" icon={Activity} /><StatCard label="Active Hours" value="4.2h" subtext="This week" icon={Clock} /></div>
      <div><div className="flex justify-between items-center mb-3"><h2 className="font-bold text-slate-800">Community</h2><button onClick={() => setActiveTab('community')} className="text-xs text-[#0f4c81] font-semibold bg-transparent">View All</button></div><div className="space-y-2">{MOCK_FRIENDS.slice(0, 3).map(f => (
        <div key={f.id} onClick={() => { setSelectedFriend(f); setActiveTab('community'); }} className="cursor-pointer active:scale-[0.98] transition-transform">
          <FriendRow friend={f} />
        </div>
      ))}</div></div>
    </div>
  );

  const renderNewActivity = () => {
    if (isSessionActive) {
      const cumulativeStats = currentImpacts.reduce((acc, impact) => {
        acc[impact.zone] = (acc[impact.zone] || 0) + impact.gForce;
        return acc;
      }, {});

      const visibleImpacts = activeZoneFilter 
        ? currentImpacts.filter(i => i.zone === activeZoneFilter) 
        : currentImpacts;

      const handleZoneClick = (zone) => {
        setActiveZoneFilter(prev => prev === zone ? null : zone);
      };

      return (
        <div className="h-full flex flex-col animate-in fade-in duration-300 relative">
          <div className="flex-1 overflow-y-auto p-6 pb-32 scrollbar-hide">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <div className="flex flex-col">
                  <span className="text-red-500 font-bold tracking-wider text-[10px] uppercase leading-none mb-0.5">LIVE RECORDING</span>
                  <span className="text-slate-900 font-bold text-xs uppercase leading-none">{selectedResort ? selectedResort.name : 'Unknown Location'}</span>
                </div>
              </div>
              <div className="text-3xl font-mono font-bold text-slate-800">{formatTime(sessionTime)}</div>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <div className="flex-1 mr-4">
                <ToggleSlider 
                  leftLabel="Brain Map" 
                  rightLabel="GPS Map" 
                  value={activeSessionViewMode} 
                  onToggle={setActiveSessionViewMode} 
                />
              </div>
              <button 
                onClick={() => setShowPatrolModal(true)}
                className="bg-red-50 text-red-500 p-3 rounded-xl border border-red-100 shadow-sm hover:bg-red-500 hover:text-white transition-all active:scale-95"
              >
                <Phone size={20} fill="currentColor" />
              </button>
            </div>

            <div className="relative mb-6">
              <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-slate-800 bg-slate-900 h-64 relative">
                {activeSessionViewMode === 'Brain Map' ? (
                  <>
                    <div className="absolute inset-0" onClick={() => setActiveZoneFilter(null)} />
                    {activeZoneFilter && (
                      <div className="absolute top-4 left-4 z-10 bg-slate-800/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-2 pointer-events-auto">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Filtered:</span>
                          <span className="text-white font-bold capitalize text-xs">{activeZoneFilter}</span>
                          <button onClick={(e) => { e.stopPropagation(); setActiveZoneFilter(null); }} className="text-slate-400 hover:text-white"><X size={12} /></button>
                      </div>
                    )}
                    <BrainViz 
                      activeZone={activeZoneFilter} 
                      onZoneClick={handleZoneClick}
                      cumulativeStats={cumulativeStats} 
                      autoRotate={!activeZoneFilter} 
                      isInteractive={true}
                    />
                  </>
                ) : (
                  <GPSMap 
                    impacts={currentImpacts} 
                    activeImpactId={currentImpacts.length > 0 ? currentImpacts[0].id : null} 
                    onImpactClick={() => {}} 
                    initialCenter={selectedResort}
                  />
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
               <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col items-center justify-center shadow-lg"><span className="text-slate-400 text-xs uppercase font-bold mb-1">Peak Impact</span><span className={`text-3xl font-bold ${sessionPeakG > 0 ? (sessionPeakG > 50 ? 'text-red-400' : 'text-emerald-400') : 'text-slate-500'}`}>{calculateForce(sessionPeakG)}</span></div>
               <div className="bg-white text-slate-800 p-5 rounded-2xl flex flex-col items-center justify-center border border-slate-200 shadow-sm"><span className="text-slate-500 text-xs uppercase font-bold mb-1">Impact Count</span><span className="text-3xl font-bold">{currentImpacts.length}</span></div>
            </div>

            {/* Live Impact Stream */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">
                {activeZoneFilter ? `${activeZoneFilter} Impacts` : 'Recent Impacts'}
              </h3>
              {visibleImpacts.length > 0 ? (
                visibleImpacts.map(impact => (
                  <div 
                    key={impact.id} 
                    onClick={() => setActiveZoneFilter(impact.zone)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer active:scale-[0.98] ${activeZoneFilter === impact.zone ? 'bg-slate-50 border-slate-300 ring-1 ring-slate-200' : 'bg-white border-slate-100 shadow-sm'}`}
                  >
                     <div className="flex items-center gap-4">
                       <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${getImpactColor(impact.gForce)}`}>
                          <span className="text-sm font-bold">{calculateForce(impact.gForce)}</span>
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
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-sm italic">
                  {activeZoneFilter ? `No impacts recorded in ${activeZoneFilter} lobe.` : 'Waiting for activity...'}
                </div>
              )}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent z-20">
             <button onClick={() => setIsSessionActive(false)} className="w-full bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2"><Square size={18} fill="currentColor" />End Session</button>
          </div>

          {/* Ski Patrol Modal (Self) */}
          {showPatrolModal && selectedResort && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6 animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone size={32} fill="currentColor" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Call Ski Patrol?</h3>
                  <p className="text-sm text-slate-500">Contacting {selectedResort.name} Patrol.</p>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-xl text-center mb-6 border border-slate-100">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Emergency Number</span>
                  <span className="text-2xl font-mono font-bold text-slate-900">{selectedResort.patrolNumber}</span>
                </div>

                <div className="space-y-3">
                  <a href={`tel:${selectedResort.patrolNumber}`} className="block w-full bg-red-500 text-white font-bold py-4 rounded-xl text-center shadow-lg hover:bg-red-600 transition-colors">
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
    }
    return (
      <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-8 p-6 pb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6 shrink-0">New Activity</h1>
        <div className="flex-1 overflow-y-auto scrollbar-hide -mr-4 pr-4">
          
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-600 mb-2">Activity Type</label>
            <div className="grid grid-cols-2 gap-3">
              {['Skiing', 'Snowboarding'].map(type => (
                <button key={type} onClick={() => setActivityType(type)} className={`p-4 rounded-xl border text-left transition-all ${activityType === type ? 'border-[#0f4c81] bg-[#0f4c81] text-white shadow-md' : 'border-slate-200 bg-white text-slate-600 hover:border-[#6ec6ff]'}`}><div className="font-bold">{type}</div></button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-600 mb-2">Select Resort</label>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-3 border-b border-slate-100 flex items-center gap-2">
                <Search size={18} className="text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search resorts..." 
                  value={resortSearch}
                  onChange={(e) => setResortSearch(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm font-medium text-slate-900"
                />
              </div>
              <div className="max-h-48 overflow-y-auto scrollbar-hide p-1 space-y-1">
                {filteredResorts.length > 0 ? filteredResorts.map(resort => (
                  <button 
                    key={resort.id}
                    onClick={() => setSelectedResort(resort)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${selectedResort?.id === resort.id ? 'bg-[#0f4c81] text-white' : 'bg-white text-[#0f4c81] hover:bg-slate-50'}`}
                  >
                    <span className="font-bold text-sm truncate">{resort.name}</span>
                    <div className="flex items-center gap-1 opacity-70">
                      <MapPin size={12} />
                      <span className="text-[10px]">{Math.round(getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, resort.lat, resort.lng))}km</span>
                    </div>
                  </button>
                )) : (
                  <div className="p-4 text-center text-xs text-slate-400">No resorts found</div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3 mb-8"><div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div><div><div className="font-semibold text-emerald-800 text-sm">Connected</div><div className="text-emerald-600 text-xs">Battery: 84%</div></div></div>
        </div>
        <button 
          onClick={() => { 
            setCurrentImpacts([]); 
            setSessionTime(0); 
            setSessionPeakG(0); 
            setIsSessionActive(true); 
          }} 
          disabled={!selectedResort}
          className={`w-full text-white font-bold text-lg py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 ${selectedResort ? 'bg-[#10b981] hover:bg-[#059669] shadow-emerald-100' : 'bg-slate-300 cursor-not-allowed'}`}
        >
          <Play size={20} fill="currentColor" />
          START SESSION
        </button>
      </div>
    );
  };

  const renderHistory = () => {
    if (selectedHistorySession) {
      // Pass helper to HistoryDetailView indirectly by refactoring it or handling display there. 
      // For now, let's inject a wrapper or pass a prop if possible. 
      // Better: HistoryDetailView is imported. I need to make sure IT uses the new unit.
      // Since I can't pass props to the imported component definition easily without changing it,
      // I will update HistoryDetailView in a subsequent step to accept a formatForce prop or context.
      // For this step, I will modify the imported component call to pass the formatter.
      return <HistoryDetailView session={selectedHistorySession} onBack={() => setSelectedHistorySession(null)} formatForce={calculateForce} />;
    }

    return (
    <div className="h-full overflow-y-auto scrollbar-hide space-y-4 animate-in fade-in p-6 pb-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Activity History</h1>
      <div className="bg-slate-900 rounded-2xl p-1 shadow-lg mb-6 cursor-pointer group hover:ring-2 ring-[#6ec6ff] transition-all" onClick={() => setShowBrainDetail(true)}>
          <div className="p-4"><div className="flex justify-between items-center mb-4"><h3 className="text-white font-bold flex items-center gap-2"><Brain size={18} className="text-[#6ec6ff]" />Cumulative Impact Map</h3><div className="flex items-center gap-1 text-[10px] text-[#6ec6ff] bg-[#6ec6ff]/10 px-2 py-1 rounded-full"><Info size={12} /><span>Tap to Interact</span></div></div>
          <div className="rounded-lg overflow-hidden border border-slate-700/50 relative h-64"><div className="absolute inset-0 bg-transparent z-10"></div><BrainViz activeZone={null} autoRotate={true} /></div></div>
      </div>
      <div className="space-y-3">{MOCK_HISTORY.map(item => (<div key={item.id} onClick={() => setSelectedHistorySession(item)} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-3 group hover:border-[#6ec6ff] transition-colors cursor-pointer"><div className="flex justify-between items-start"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"><Activity size={20} /></div><div><h3 className="font-bold text-slate-800">{item.type}</h3><p className="text-xs text-slate-400">{item.date} • {item.duration}</p></div></div><div className={`text-xs font-bold px-2 py-1 rounded border ${item.risk === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>{item.risk} Risk</div></div><div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-50"><div className="text-center"><div className="text-xs text-slate-400">Peak Force</div><div className="font-mono font-bold text-slate-700">{calculateForce(item.maxForce)}</div></div><div className="text-center border-l border-slate-100"><div className="text-xs text-slate-400">Impacts</div><div className="font-mono font-bold text-slate-700">{item.impacts}</div></div><div className="text-center border-l border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#0f4c81]"><ChevronRight size={16} /></div></div></div>))}</div>
    </div>
  );
  };

  if (showBrainDetail) {
    const stats = selectedLobe ? LOBE_STATS[selectedLobe] : null;
    return (
      <div className="h-[100dvh] w-full bg-slate-900 flex flex-col max-w-[430px] mx-auto shadow-2xl relative overflow-hidden select-none text-white animate-in fade-in zoom-in duration-300">
        <div className="p-6 flex items-center justify-between z-20"><button onClick={() => { if (selectedLobe) { setSelectedLobe(null); } else { setShowBrainDetail(false); }}} className="p-2 bg-slate-800 rounded-full text-slate-300 hover:text-white"><ChevronLeft size={24} /></button><h2 className="font-bold text-lg">Interactive Model</h2><div className="w-10"></div></div>
        <div className="flex-1 relative"><BrainViz activeZone={selectedLobe} onZoneClick={setSelectedLobe} autoRotate={!selectedLobe} isInteractive={true} /></div>
        <div className="bg-slate-800 p-6 pb-12 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.5)] z-20 transition-all duration-300 min-h-[30%]">
          {selectedLobe ? (
            <div className="animate-in slide-in-from-bottom-4">
              <div className="flex justify-between items-end mb-4"><h2 className="text-3xl font-bold capitalize text-[#6ec6ff]">{selectedLobe} Lobe</h2><span className={`text-sm font-bold px-3 py-1 rounded-full border ${stats.risk === 'High' ? 'bg-red-500/20 text-red-400 border-red-500/50' : stats.risk === 'Med' ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'}`}>{stats.risk} Risk</span></div>
              <div className="grid grid-cols-2 gap-4"><div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600"><div className="text-slate-400 text-xs uppercase mb-1">Total Impacts</div><div className="text-2xl font-bold">{stats.impacts}</div></div><div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600"><div className="text-slate-400 text-xs uppercase mb-1">Max Force</div><div className="text-2xl font-bold">{calculateForce(stats.maxForce)}</div></div></div>
              <p className="mt-4 text-slate-400 text-sm leading-relaxed">{selectedLobe === 'frontal' && "Controls cognitive skills like problem solving and memory. High impact detected here."}{selectedLobe === 'temporal' && "Processes auditory information. Moderate impacts recorded."}{selectedLobe === 'occipital' && "Visual processing center. Currently safe from major impacts."}{selectedLobe === 'parietal' && "Processes sensory information. Minor impacts detected."}{selectedLobe === 'cerebellum' && "Controls balance and coordination. No impacts detected."}</p>
            </div>
          ) : (<div className="flex flex-col items-center justify-center h-full py-8 text-slate-500"><Brain size={48} className="mb-3 opacity-20" /><p>Tap on the 3D brain model to view regional data.</p></div>)}
        </div>
      </div>
    );
  }

  const renderCommunity = () => {
    if (selectedFriend) {
      return <FriendDetailView friend={selectedFriend} onBack={() => setSelectedFriend(null)} formatForce={calculateForce} />;
    }
    return <CommunityView onBack={() => setActiveTab('dashboard')} onFriendClick={(friend) => setSelectedFriend(friend)} />;
  };

  return (
    <div className="h-[100dvh] w-full bg-[#ffffff] font-sans text-slate-900 flex flex-col mx-auto shadow-2xl relative overflow-hidden select-none">
      <div className="flex-1 overflow-hidden relative pt-[env(safe-area-inset-top)]">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'activity' && renderNewActivity()}
        {activeTab === 'history' && renderHistory()}
        {activeTab === 'community' && renderCommunity()}
      </div>
      {!isSessionActive && (
        <div className="w-full bg-white border-t border-slate-200 px-6 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] flex justify-between items-end shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 shrink-0">
          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 transition-colors bg-transparent ${activeTab === 'dashboard' ? 'text-[#0f4c81]' : 'text-slate-400'}`}><Home size={24} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} /><span className="text-[10px] font-medium">Home</span></button>
          <div className="relative -top-6"><button onClick={() => { setActiveTab('activity'); setIsSessionActive(false); }} className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transform transition-transform active:scale-95 ${activeTab === 'activity' ? 'bg-[#0f4c81] ring-4 ring-[#e0f2fe]' : 'bg-[#0f4c81] hover:bg-[#0a355c]'}`}><Plus size={28} color="white" strokeWidth={3} /></button></div>
          <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 transition-colors bg-transparent ${activeTab === 'history' ? 'text-[#0f4c81]' : 'text-slate-400'}`}><History size={24} strokeWidth={activeTab === 'history' ? 2.5 : 2} /><span className="text-[10px] font-medium">History</span></button>
        </div>
      )}

      {showSettings && (
        <div className="absolute inset-0 bg-slate-900/20 z-[60] flex items-end sm:items-center justify-center backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#fafafa] w-full max-w-sm rounded-t-[2.5rem] sm:rounded-3xl p-8 shadow-2xl animate-in slide-in-from-bottom-10 h-[85vh] flex flex-col transition-all relative">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-8 shrink-0">
              {settingsPage !== 'main' ? (
                <button onClick={() => setSettingsPage('main')} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"><ChevronLeft size={24} /></button>
              ) : (
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Settings</h2>
              )}
              {settingsPage === 'account' && <h2 className="text-xl font-bold text-slate-900 absolute left-1/2 -translate-x-1/2">Account</h2>}
              {settingsPage === 'privacy' && <h2 className="text-xl font-bold text-slate-900 absolute left-1/2 -translate-x-1/2">Privacy</h2>}
              <button onClick={handleCancelSettings} className="p-2 -mr-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-8 pb-20">
              {settingsPage === 'main' ? (
                <>
                  <div className="space-y-5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Preferences</label>
                    <div className="space-y-4">
                      <ToggleSlider leftLabel="Metric" rightLabel="Imperial" value={tempUnitSystem} onToggle={setTempUnitSystem} />
                      <ToggleSlider leftLabel="G-Force" rightLabel="Newtons" value={tempForceUnit} onToggle={setTempForceUnit} />
                    </div>
                  </div>
                  
                  <div className="space-y-5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Physical Profile</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 pl-1">
                          Height ({tempUnitSystem === 'Metric' ? 'cm' : 'ft'})
                        </label>
                        <input 
                          type="number" 
                          value={tempUnitSystem === 'Metric' ? tempProfile.height : Math.round(tempProfile.height / 30.48 * 10) / 10} 
                          onChange={(e) => {
                             const val = parseFloat(e.target.value);
                             const newHeight = tempUnitSystem === 'Metric' ? val : val * 30.48;
                             setTempProfile({...tempProfile, height: newHeight});
                          }} 
                          className="w-full p-4 bg-white rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-slate-900 outline-none shadow-sm text-center" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 pl-1">
                          Weight ({tempUnitSystem === 'Metric' ? 'kg' : 'lbs'})
                        </label>
                        <input 
                          type="number" 
                          value={tempUnitSystem === 'Metric' ? tempProfile.weight : Math.round(tempProfile.weight * 2.20462)} 
                          onChange={(e) => {
                             const val = parseFloat(e.target.value);
                             const newWeight = tempUnitSystem === 'Metric' ? val : val / 2.20462;
                             setTempProfile({...tempProfile, weight: newWeight});
                          }} 
                          className="w-full p-4 bg-white rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-slate-900 outline-none shadow-sm text-center" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 pl-1">Gender</label>
                       <ToggleSlider leftLabel="Male" rightLabel="Female" value={tempProfile.gender} onToggle={(newVal) => setTempProfile({...tempProfile, gender: newVal})} />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <button onClick={() => setSettingsPage('account')} className="w-full p-4 bg-white rounded-2xl flex items-center justify-between shadow-[0_2px_10px_-2px_rgba(0,0,0,0.03)] hover:shadow-md transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors"><User size={18} /></div>
                        <span className="font-bold text-slate-900">Account</span>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                    </button>
                    <button onClick={() => setSettingsPage('privacy')} className="w-full p-4 bg-white rounded-2xl flex items-center justify-between shadow-[0_2px_10px_-2px_rgba(0,0,0,0.03)] hover:shadow-md transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors"><Shield size={18} /></div>
                        <span className="font-bold text-slate-900">Privacy & Security</span>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                    </button>
                  </div>
                </>
              ) : settingsPage === 'privacy' ? (
                <div className="space-y-8 animate-in slide-in-from-right-8">
                  <div className="space-y-5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Visibility</label>
                    <div className="space-y-4">
                      <div><label className="text-[10px] font-bold text-slate-400 mb-2 block pl-1">Location Sharing</label><ToggleSlider leftLabel="Always" rightLabel="Never" value={tempPrivacySettings.locationSharing === 'Always' ? 'Always' : 'Never'} onToggle={(val) => setTempPrivacySettings({...tempPrivacySettings, locationSharing: val})} /></div>
                      <div><label className="text-[10px] font-bold text-slate-400 mb-2 block pl-1">Profile Visibility</label><ToggleSlider leftLabel="Friends" rightLabel="Public" value={tempPrivacySettings.profileVisibility} onToggle={(val) => setTempPrivacySettings({...tempPrivacySettings, profileVisibility: val})} /></div>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Data</label>
                    <div className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-transparent hover:border-slate-100 transition-all cursor-pointer" onClick={() => setTempPrivacySettings({...tempPrivacySettings, dataCollection: !tempPrivacySettings.dataCollection})}>
                      <span className="text-sm font-bold text-slate-700">Allow Anonymous Data</span>
                      <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${tempPrivacySettings.dataCollection ? 'bg-slate-900' : 'bg-slate-200'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${tempPrivacySettings.dataCollection ? 'translate-x-5' : 'translate-x-0'}`}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-right-8">
                  <div className="bg-white p-6 rounded-3xl flex items-center gap-5 shadow-sm border border-slate-50">
                    <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-slate-200">SW</div>
                    <div><h3 className="font-black text-slate-900 text-xl">Skyler White</h3><p className="text-sm text-slate-400 font-medium">skyler.w@example.com</p></div>
                  </div>
                  <div className="pt-4"><button className="w-full py-4 bg-red-50 text-red-500 font-bold rounded-2xl hover:bg-red-100 hover:text-red-600 transition-all flex items-center justify-center gap-2"><LogOut size={20} /> Log Out</button></div>
                </div>
              )}
            </div>

            {/* Save / Cancel Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-6 pt-0 bg-gradient-to-t from-[#fafafa] via-[#fafafa] to-transparent">
              <div className="flex gap-4">
                <button 
                  onClick={handleCancelSettings} 
                  className="flex-1 py-4 bg-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveSettings} 
                  className="flex-1 py-4 bg-[#0f4c81] text-white font-bold rounded-2xl hover:bg-[#0a355c] shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98]"
                >
                  Save Changes
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}