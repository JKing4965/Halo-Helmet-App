import React, { useRef, useMemo, useEffect } from 'react';
import { X } from 'lucide-react';

const BrainViz = ({ activeZone = null, onZoneClick = null, autoRotate = true, isInteractive = false, cumulativeStats = null }) => {
  const canvasRef = useRef(null);
  const rotationRef = useRef({ x: 0.2, y: -1.5 });
  const zoomRef = useRef(1.0);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const lobeCenters = useRef({
    'Frontal': { x: 0, y: -10, z: 40 },
    'Parietal Left': { x: -25, y: -25, z: 0 },
    'Parietal Right': { x: 25, y: -25, z: 0 },
    'Occipital': { x: 0, y: -10, z: -40 },
    'Temporal Left': { x: -35, y: 10, z: 10 },
    'Temporal Right': { x: 35, y: 10, z: 10 },
    'Cerebellum': { x: 0, y: 25, z: -30 }
  });

  const particles = useMemo(() => {
    const pts = [];
    const addSurfaceCluster = (count, centerX, centerY, centerZ, scaleX, scaleY, scaleZ, zone) => {
        for (let i = 0; i < count; i++) {
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = 48 + (Math.random() * 2); 
            
            let x = centerX + (r * Math.sin(phi) * Math.cos(theta) * scaleX);
            let y = centerY + (r * Math.sin(phi) * Math.sin(theta) * scaleY);
            let z = centerZ + (r * Math.cos(phi) * scaleZ);
            
            if (Math.abs(x) < 2) continue; 
            const side = x > 0 ? 1 : -1;
            x += side * 3; 

            // Calculate Normal Vector for lighting
            const nx = (x - centerX) / scaleX;
            const ny = (y - centerY) / scaleY;
            const nz = (z - centerZ) / scaleZ;
            const len = Math.sqrt(nx*nx + ny*ny + nz*nz);

            pts.push({ x, y, z, nx: nx/len, ny: ny/len, nz: nz/len, zone });
        }
    };
    addSurfaceCluster(700, 0, -10, 25, 0.9, 0.8, 0.9, 'Frontal');
    addSurfaceCluster(400, -25, -25, -5, 0.6, 0.65, 0.8, 'Parietal Left');
    addSurfaceCluster(400, 25, -25, -5, 0.6, 0.65, 0.8, 'Parietal Right');
    addSurfaceCluster(500, 0, -10, -35, 0.8, 0.8, 0.6, 'Occipital');
    addSurfaceCluster(350, 35, 15, 5, 0.4, 0.5, 0.8, 'Temporal Right');
    addSurfaceCluster(350, -35, 15, 5, 0.4, 0.5, 0.8, 'Temporal Left');
    addSurfaceCluster(400, 0, 30, -25, 0.6, 0.4, 0.5, 'Cerebellum');
    return pts;
  }, []);

  const handleInteraction = (clientX, clientY) => {
    if (!onZoneClick || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    
    let closestZone = null;
    let minDist = 1000;

    const rotatePoint = (px, py, pz) => {
        const ry = rotationRef.current.y;
        const rx = rotationRef.current.x;
        let x1 = px * Math.cos(ry) - pz * Math.sin(ry);
        let z1 = px * Math.sin(ry) + pz * Math.cos(ry);
        let y1 = py;
        let y2 = y1 * Math.cos(rx) - z1 * Math.sin(rx);
        let z2 = y1 * Math.sin(rx) + z1 * Math.cos(rx);
        const scale = (400 / (400 + z2)) * zoomRef.current;
        return { x: cx + x1 * scale, y: cy + y2 * scale, z: z2 };
    };

    Object.keys(lobeCenters.current).forEach(zone => {
        const p = lobeCenters.current[zone];
        const screenP = rotatePoint(p.x, p.y, p.z);
        const dist = Math.sqrt(Math.pow(screenP.x - x, 2) + Math.pow(screenP.y - y, 2));
        if (dist < 60 * zoomRef.current && dist < minDist) { 
            minDist = dist;
            closestZone = zone;
        }
    });
    onZoneClick(closestZone);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    const light = { x: -0.5, y: -0.5, z: 0.8 };
    const lLen = Math.sqrt(light.x*light.x + light.y*light.y + light.z*light.z);
    light.x /= lLen; light.y /= lLen; light.z /= lLen;

    const render = () => {
      if (autoRotate && !isDragging.current && !activeZone) rotationRef.current.y += 0.004;
      const targetZoom = activeZone ? 1.5 : 1.0;
      zoomRef.current += (targetZoom - zoomRef.current) * 0.08;
      
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const projected = particles.map(p => {
        // 1. Rotate Position
        let x1 = p.x * Math.cos(rotationRef.current.y) - p.z * Math.sin(rotationRef.current.y);
        let z1 = p.x * Math.sin(rotationRef.current.y) + p.z * Math.cos(rotationRef.current.y);
        let y1 = p.y; 

        let y2 = y1 * Math.cos(rotationRef.current.x) - z1 * Math.sin(rotationRef.current.x);
        let z2 = y1 * Math.sin(rotationRef.current.x) + z1 * Math.cos(rotationRef.current.x);
        let x2 = x1; 

        // 2. Rotate Normal Vector
        let nx1 = p.nx * Math.cos(rotationRef.current.y) - p.nz * Math.sin(rotationRef.current.y);
        let nz1 = p.nx * Math.sin(rotationRef.current.y) + p.nz * Math.cos(rotationRef.current.y);
        let ny1 = p.ny;

        let ny2 = ny1 * Math.cos(rotationRef.current.x) - nz1 * Math.sin(rotationRef.current.x);
        let nz2 = ny1 * Math.sin(rotationRef.current.x) + nz1 * Math.cos(rotationRef.current.x);
        let nx2 = nx1;

        const scale = (400 / (400 + z2)) * zoomRef.current; 
        
        let intensity = (nx2 * light.x + ny2 * light.y + nz2 * light.z);
        intensity = Math.max(0.2, (intensity + 1) / 2);

        return { x: cx + x2 * scale, y: cy + y2 * scale, z: z2, scale, intensity, zone: p.zone };
      }).sort((a, b) => b.z - a.z);

      projected.forEach(p => {
        ctx.beginPath();
        let baseColor = { r: 203, g: 213, b: 225 }; // Default Slate-300
        let alpha = 1.0;

        // If a specific zone is active, fade out everything else
        if (activeZone && p.zone !== activeZone) {
            baseColor = { r: 200, g: 200, b: 200 }; // Greyed out
            alpha = 0.1; // Highly transparent
        } else {
            // Normal Coloring Logic (Heatmap or Identity)
            if (cumulativeStats) {
                const val = cumulativeStats[p.zone] || 0;
                // Diverse Color Gradient (Yellow -> Deep Red)
                if (val > 180) baseColor = { r: 69, g: 10, b: 10 };   // Red-950 (Black-Red)
                else if (val > 140) baseColor = { r: 153, g: 27, b: 27 }; // Red-800
                else if (val > 100) baseColor = { r: 220, g: 38, b: 38 }; // Red-600
                else if (val > 70) baseColor = { r: 249, g: 115, b: 22 }; // Orange-500
                else if (val > 40) baseColor = { r: 251, g: 146, b: 60 }; // Orange-400
                else if (val > 20) baseColor = { r: 253, g: 224, b: 71 }; // Yellow-300
                else if (val > 0) baseColor = { r: 254, g: 240, b: 138 }; // Yellow-200 (Faint Yellow)
                else baseColor = { r: 226, g: 232, b: 240 }; // Slate 200 (Inactive)
            } else {
                // Fallback for non-heatmap modes
                if (p.zone === 'Frontal') baseColor = { r: 239, g: 68, b: 68 };
                else if (p.zone.includes('Temporal')) baseColor = { r: 245, g: 158, b: 11 };
                else if (p.zone.includes('Parietal')) baseColor = { r: 148, g: 163, b: 184 };
                else if (p.zone === 'Cerebellum') baseColor = { r: 100, g: 116, b: 139 };
            }
        }
        
        const r = Math.floor(baseColor.r * p.intensity);
        const g = Math.floor(baseColor.g * p.intensity);
        const b = Math.floor(baseColor.b * p.intensity);
        
        // Apply alpha to the final color string
        const colorString = `rgba(${r},${g},${b},${alpha})`;
        ctx.fillStyle = colorString;
        ctx.arc(p.x, p.y, 4.5 * p.scale, 0, Math.PI * 2);
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [particles, activeZone, autoRotate, cumulativeStats]);

  const handleStart = (x, y) => { isDragging.current = true; lastMouse.current = { x, y }; };
  const handleMove = (x, y) => {
    if (!isDragging.current) return;
    const dx = x - lastMouse.current.x;
    const dy = y - lastMouse.current.y;
    rotationRef.current.x += dy * 0.01;
    rotationRef.current.y += dx * 0.01;
    lastMouse.current = { x, y };
  };
  const handleEnd = () => { isDragging.current = false; };

  return (
    <div ref={containerRef} className="w-full h-full relative">
        <canvas ref={canvasRef} className="w-full h-full bg-transparent cursor-pointer touch-none"
        onClick={(e) => handleInteraction(e.clientX, e.clientY)}
        onMouseDown={(e) => handleStart(e.nativeEvent.offsetX, e.nativeEvent.offsetY)}
        onMouseMove={(e) => handleMove(e.nativeEvent.offsetX, e.nativeEvent.offsetY)}
        onMouseUp={handleEnd} onMouseLeave={handleEnd}
        onTouchStart={(e) => { const rect = e.target.getBoundingClientRect(); handleStart(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top); }}
        onTouchMove={(e) => { const rect = e.target.getBoundingClientRect(); handleMove(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top); }}
        onTouchEnd={handleEnd} />
        {isInteractive && !activeZone && <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-slate-400 pointer-events-none animate-pulse">Tap a region to isolate</div>}
        {isInteractive && activeZone && <button onClick={(e) => { e.stopPropagation(); onZoneClick(null); }} className="absolute top-4 right-4 bg-slate-800 text-white p-2 rounded-full shadow-lg opacity-80 hover:opacity-100 transition-opacity"><X size={16} /></button>}
    </div>
  );
};
export default BrainViz;