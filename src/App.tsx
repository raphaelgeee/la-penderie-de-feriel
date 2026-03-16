/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider } from './lib/store';
import { Chat } from './components/Chat';
import { Wardrobe } from './components/Wardrobe';
import { Profile } from './components/Profile';
import { BottomNav } from './components/BottomNav';
import { Delete } from 'lucide-react';
import { clsx } from 'clsx';

function PinGate({ children }: { children: React.ReactNode }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const savedAuth = localStorage.getItem('feriel_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handlePress = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError(false);
      if (newPin.length === 4) {
        if (newPin === '2704') {
          localStorage.setItem('feriel_auth', 'true');
          setIsAuthenticated(true);
        } else {
          setError(true);
          setTimeout(() => setPin(''), 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  if (isAuthenticated) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#f5f2ed] flex flex-col items-center justify-center p-6">
      <img src="/logo.svg" alt="Fériel — La Penderie" className="w-56 mb-6" />
      <p className="text-gray-500 mb-10">Entrez votre code secret</p>

      <div className="flex space-x-6 mb-12">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={clsx(
              "w-4 h-4 rounded-full border-2 transition-all duration-200",
              pin.length > i ? "bg-[#C9952C] border-[#C9952C]" : "border-gray-300",
              error && "bg-red-500 border-red-500 animate-pulse"
            )}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-x-8 gap-y-6 max-w-[280px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handlePress(num.toString())}
            className="w-16 h-16 rounded-full bg-white text-2xl font-medium text-gray-900 shadow-sm active:bg-gray-100 transition-colors flex items-center justify-center"
          >
            {num}
          </button>
        ))}
        <div />
        <button
          onClick={() => handlePress('0')}
          className="w-16 h-16 rounded-full bg-white text-2xl font-medium text-gray-900 shadow-sm active:bg-gray-100 transition-colors flex items-center justify-center"
        >
          0
        </button>
        <button
          onClick={handleDelete}
          className="w-16 h-16 rounded-full text-gray-500 active:bg-gray-200 transition-colors flex items-center justify-center"
        >
          <Delete size={28} />
        </button>
      </div>
    </div>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<'chat' | 'wardrobe' | 'profile'>('chat');

  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-white shadow-2xl overflow-hidden relative">
      {activeTab === 'chat' && <Chat />}
      {activeTab === 'wardrobe' && <Wardrobe />}
      {activeTab === 'profile' && <Profile />}
      
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <PinGate>
      <AppProvider>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <AppContent />
        </div>
      </AppProvider>
    </PinGate>
  );
}
