import React, { createContext, useContext, useState, useEffect } from 'react';
import { get, set } from 'idb-keyval';

export interface ClothingItem {
  id: string;
  image: string; // base64
  name: string;
  category: string;
  color: string;
  season: string;
  style: string;
  material?: string;
}

export interface UserProfile {
  facePhotos: string[]; // base64
  bodyPhotos: string[]; // base64
  style: string;
  favoriteColors: string[];
  avoidColors: string[];
  avoidItems: string[];
  onboardingComplete: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // base64
  generatedImage?: string; // base64
  timestamp: number;
}

interface AppState {
  wardrobe: ClothingItem[];
  profile: UserProfile;
  chatHistory: ChatMessage[];
  addClothingItem: (item: Omit<ClothingItem, 'id'>) => void;
  removeClothingItem: (idOrName: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChat: () => void;
}

const defaultProfile: UserProfile = {
  facePhotos: [],
  bodyPhotos: [],
  style: '',
  favoriteColors: [],
  avoidColors: [],
  avoidItems: [],
  onboardingComplete: false,
};

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wardrobe, setWardrobe] = useState<ClothingItem[]>([]);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const storedWardrobe = await get('wardrobe');
      const storedProfile = await get('profile');
      const storedChat = await get('chatHistory');

      if (storedWardrobe) setWardrobe(storedWardrobe);
      if (storedProfile) setProfile({ ...defaultProfile, ...storedProfile });
      if (storedChat && storedChat.length > 0) {
        setChatHistory(storedChat);
      } else {
        const welcomeMsg: ChatMessage = {
          id: 'welcome-msg',
          role: 'model',
          text: "Bienvenue mon cœur ! ✨\n\nJe suis La Penderie de Fériel, ton styliste perso. Mon job : te proposer des tenues parfaites à partir de TA vraie garde-robe, et te montrer le résultat directement sur toi grâce à l'essayage virtuel.\n\nFini les 45 minutes devant le dressing à dire \"j'ai rien à me mettre\" 😄\n\nPour que je sois vraiment efficace, on va commencer par 3 choses simples. Je te guide, tu n'as qu'à suivre.\n\nOn y va ? 💛",
          timestamp: Date.now()
        };
        setChatHistory([welcomeMsg]);
        saveState('chatHistory', [welcomeMsg]);
      }
      setIsLoaded(true);
    };
    loadData();
  }, []);

  const saveState = async (key: string, value: any) => {
    await set(key, value);
  };

  const addClothingItem = (item: Omit<ClothingItem, 'id'>) => {
    const newItem = { ...item, id: Date.now().toString() };
    const newWardrobe = [...wardrobe, newItem];
    setWardrobe(newWardrobe);
    saveState('wardrobe', newWardrobe);
  };

  const removeClothingItem = (idOrName: string) => {
    const newWardrobe = wardrobe.filter(
      (item) => item.id !== idOrName && item.name.toLowerCase() !== idOrName.toLowerCase()
    );
    setWardrobe(newWardrobe);
    saveState('wardrobe', newWardrobe);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    saveState('profile', newProfile);
  };

  const addChatMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg = { ...msg, id: Date.now().toString(), timestamp: Date.now() };
    const newHistory = [...chatHistory, newMsg];
    setChatHistory(newHistory);
    saveState('chatHistory', newHistory);
  };

  const clearChat = () => {
    setChatHistory([]);
    saveState('chatHistory', []);
  };

  if (!isLoaded) return <div className="flex items-center justify-center h-screen bg-[#f5f2ed]">Chargement...</div>;

  return (
    <AppContext.Provider value={{ wardrobe, profile, chatHistory, addClothingItem, removeClothingItem, updateProfile, addChatMessage, clearChat }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
