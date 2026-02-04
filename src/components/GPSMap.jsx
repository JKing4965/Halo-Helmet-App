import React, { useState, useEffect, useRef } from 'react';
import Map, { Marker, Popup } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const GPSMap = ({ impacts = [], activeImpactId, onImpactClick }) => {
  const mapRef = useRef(null);
  
  // Bryce Resort Center
  const [viewState, setViewState] = useState({
    longitude: -78.7627,
    latitude: 38.8166,
    zoom: 14.5
  });

  // Effect to fly to the active impact when selected from the list
  useEffect(() => {
    if (activeImpactId) {
      const impact = impacts.find(i => i.id === activeImpactId);
      if (impact && mapRef.current) {
        mapRef.current.flyTo({
          center: [impact.lng, impact.lat],
          zoom: 16,
          duration: 1500
        });
      }
    }
  }, [activeImpactId, impacts]);

  return (
    <div className="w-full h-full rounded-b-2xl overflow-hidden relative">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/satellite-v9"
        mapboxAccessToken="pk.eyJ1IjoidGhhdGpwYXQiLCJhIjoiY21rcWFtczhmMHRvNjNqcHhwNDZhdXUwdiJ9.HB0PW82bqWneYoZWdLiZkw"
        attributionControl={false} // Clean look for prototype
      >
        {impacts.map((impact) => {
          const isActive = activeImpactId === impact.id;
          
          // Determine color based on G-Force
          let bgColor = '#10b981'; // emerald-500
          if (impact.gForce >= 60) bgColor = '#ef4444'; // red-500
          else if (impact.gForce >= 30) bgColor = '#f59e0b'; // amber-500
          
          if (isActive) bgColor = '#0f4c81'; // primary blue

          return (
            <div key={impact.id}>
              <Marker 
                longitude={impact.lng} 
                latitude={impact.lat} 
                anchor="center"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  onImpactClick(impact.id);
                }}
              >
                <div 
                  className={`
                    flex items-center justify-center rounded-full text-white font-bold border-2 border-white shadow-lg cursor-pointer transition-all duration-300
                    ${isActive ? 'z-20 scale-125' : 'z-10 scale-100 hover:scale-110'}
                  `}
                  style={{
                    backgroundColor: bgColor,
                    width: isActive ? '36px' : '28px',
                    height: isActive ? '36px' : '28px',
                    fontSize: isActive ? '12px' : '10px',
                  }}
                >
                  {impact.gForce}
                </div>
              </Marker>

              {isActive && (
                <Popup
                  longitude={impact.lng}
                  latitude={impact.lat}
                  anchor="top"
                  offset={[0, 10]}
                  closeButton={false}
                  closeOnClick={false}
                  className="z-30"
                >
                  <div className="text-slate-900 text-xs font-bold px-1">
                    {impact.time} <span className="text-slate-400">|</span> {impact.gForce}g
                  </div>
                </Popup>
              )}
            </div>
          );
        })}
      </Map>

    </div>
  );
};

export default GPSMap;
