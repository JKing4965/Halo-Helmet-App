import React from 'react';

const ToggleSlider = ({ leftLabel, rightLabel, value, onToggle }) => (
  <div className="flex flex-col gap-2 w-full">
    <div className="bg-slate-200 p-1 rounded-xl flex relative h-10 items-center cursor-pointer" onClick={() => onToggle(value === leftLabel ? rightLabel : leftLabel)}>
      <button className={`flex-1 z-10 text-xs font-bold transition-colors duration-300 bg-transparent ${value === leftLabel ? 'text-white' : 'text-slate-600'}`}>{leftLabel}</button>
      <button className={`flex-1 z-10 text-xs font-bold transition-colors duration-300 bg-transparent ${value === rightLabel ? 'text-white' : 'text-slate-600'}`}>{rightLabel}</button>
      <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#0f4c81] rounded-lg shadow-sm transition-all duration-300 ${value === leftLabel ? 'left-1' : 'left-[calc(50%+2px)]'}`}></div>
    </div>
  </div>
);

export default ToggleSlider;