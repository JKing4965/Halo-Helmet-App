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
    frontal: { x: 0, y: -10, z: 40 },
    parietal: { x: 0, y: -25, z: 0 },
    occipital: { x: 0, y: -10, z: -40 },
    temporal: { x: 40, y: 10, z: 10 },
    cerebellum: { x: 0, y: 25, z: -30 }
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
    addSurfaceCluster(700, 0, -10, 25, 0.9, 0.8, 0.9, 'frontal');
    addSurfaceCluster(700, 0, -25, -5, 1.0, 0.65, 0.8, 'parietal');
    addSurfaceCluster(500, 0, -10, -35, 0.8, 0.8, 0.6, 'occipital');
    addSurfaceCluster(350, 35, 15, 5, 0.4, 0.5, 0.8, 'temporal');
    addSurfaceCluster(350, -35, 15, 5, 0.4, 0.5, 0.8, 'temporal');
    addSurfaceCluster(400, 0, 30, -25, 0.6, 0.4, 0.5, 'cerebellum');
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
        
        // Heatmap Logic (Yellow -> Deep Red)
        if (cumulativeStats) {
            const val = cumulativeStats[p.zone] || 0;
            if (val > 150) baseColor = { r: 127, g: 29, b: 29 }; // Deep Red (900)
            else if (val > 100) baseColor = { r: 220, g: 38, b: 38 }; // Red (600)
            else if (val > 50) baseColor = { r: 249, g: 115, b: 22 }; // Orange (500)
            else if (val > 0) baseColor = { r: 250, g: 204, b: 21 }; // Yellow (400) - making it slightly darker than 'light yellow' so it shows on white
            else baseColor = { r: 226, g: 232, b: 240 }; // Slate 200 (Inactive/Blank)
        } 
        // Default Logic (Interactive / Static)
        else {
            if (p.zone === 'frontal') baseColor = { r: 239, g: 68, b: 68 };
            else if (p.zone === 'temporal') baseColor = { r: 245, g: 158, b: 11 };
            else if (p.zone === 'parietal') baseColor = { r: 148, g: 163, b: 184 };
            else if (p.zone === 'cerebellum') baseColor = { r: 100, g: 116, b: 139 };
            
            if (activeZone && p.zone !== activeZone) baseColor = { r: 50, g: 50, b: 60 };
        }
        
        const r = Math.floor(baseColor.r * p.intensity);
        const g = Math.floor(baseColor.g * p.intensity);
        const b = Math.floor(baseColor.b * p.intensity);
        
        const colorString = `rgb(${r},${g},${b})`;
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