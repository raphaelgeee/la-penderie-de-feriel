import React from 'react';
import { useAppContext } from '../lib/store';
import { Plus } from 'lucide-react';

export const Wardrobe: React.FC = () => {
  const { wardrobe } = useAppContext();

  return (
    <div className="flex-1 overflow-y-auto bg-[#f5f2ed] pb-20">
      <div className="p-6">
        <h1 className="text-3xl font-serif text-gray-900 mb-6">Ma Garde-robe</h1>
        
        {wardrobe.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12 px-4 bg-white rounded-3xl shadow-sm">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="text-[#FF6321]" size={32} />
            </div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">Ta garde-robe est vide</h2>
            <p className="text-gray-500 text-sm">
              Demande à La Penderie d'ajouter un vêtement dans l'onglet Assistant pour commencer !
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {wardrobe.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col">
                <div className="aspect-square w-full bg-gray-100 relative">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{item.category}</p>
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{item.color} • {item.season}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
