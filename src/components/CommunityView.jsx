import React, { useState } from 'react';
import { Search, ChevronLeft } from 'lucide-react';
import FriendRow from './shared/FriendRow.jsx';
import { MOCK_FRIENDS } from '../utils/constants';

const CommunityView = ({ onBack, onFriendClick }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFriends = MOCK_FRIENDS.filter(friend => 
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-[#f8fafc] animate-in slide-in-from-right-8 duration-300">
      <div className="flex items-center gap-3 p-6 pb-2 shrink-0">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-slate-900">Community</h1>
      </div>

      <div className="px-6 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search friends..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f4c81] text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide">
        <div className="space-y-2">
          {filteredFriends.length > 0 ? (
            filteredFriends.map(friend => (
              <div key={friend.id} onClick={() => onFriendClick(friend)} className="cursor-pointer">
                <FriendRow friend={friend} />
              </div>
            ))
          ) : (
            <div className="text-center text-slate-400 py-8 text-sm">No friends found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityView;
