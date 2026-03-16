import React from 'react';
import { MessageCircle, Shirt, User } from 'lucide-react';
import { clsx } from 'clsx';

interface BottomNavProps {
  activeTab: 'chat' | 'wardrobe' | 'profile';
  setActiveTab: (tab: 'chat' | 'wardrobe' | 'profile') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('chat')}
          className={clsx("flex flex-col items-center justify-center w-full h-full space-y-1", activeTab === 'chat' ? "text-[#FF6321]" : "text-gray-400")}
        >
          <MessageCircle size={24} />
          <span className="text-[10px] font-medium uppercase tracking-wider">Assistant</span>
        </button>
        <button
          onClick={() => setActiveTab('wardrobe')}
          className={clsx("flex flex-col items-center justify-center w-full h-full space-y-1", activeTab === 'wardrobe' ? "text-[#FF6321]" : "text-gray-400")}
        >
          <Shirt size={24} />
          <span className="text-[10px] font-medium uppercase tracking-wider">Garde-robe</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={clsx("flex flex-col items-center justify-center w-full h-full space-y-1", activeTab === 'profile' ? "text-[#FF6321]" : "text-gray-400")}
        >
          <User size={24} />
          <span className="text-[10px] font-medium uppercase tracking-wider">Profil</span>
        </button>
      </div>
    </div>
  );
};
