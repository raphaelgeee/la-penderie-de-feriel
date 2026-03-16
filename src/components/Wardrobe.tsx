import React, { useState } from 'react';
import { useAppContext } from '../lib/store';
import { Plus, Trash2, X } from 'lucide-react';
import { clsx } from 'clsx';

export const Wardrobe: React.FC = () => {
  const { wardrobe, removeClothingItem } = useAppContext();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const categories = [...new Set(wardrobe.map(item => item.category))];

  const handleDelete = (id: string) => {
    removeClothingItem(id);
    setConfirmDelete(null);
    setSelectedItem(null);
  };

  const selectedClothing = wardrobe.find(item => item.id === selectedItem);

  return (
    <div className="flex-1 overflow-y-auto bg-[#f5f2ed] pb-20">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-serif text-gray-900">Ma Garde-robe</h1>
          {wardrobe.length > 0 && (
            <span className="text-sm text-gray-400 font-medium">{wardrobe.length} pièce{wardrobe.length > 1 ? 's' : ''}</span>
          )}
        </div>

        {wardrobe.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12 px-4 bg-white rounded-3xl shadow-sm">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="text-[#FF6321]" size={32} />
            </div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">Ta garde-robe est vide</h2>
            <p className="text-gray-500 text-sm">
              Envoie une photo de vêtement à La Penderie dans l'onglet Assistant pour commencer !
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category}>
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">{category}</h2>
                <div className="grid grid-cols-2 gap-3">
                  {wardrobe
                    .filter((item) => item.category === category)
                    .map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedItem(item.id)}
                        className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col text-left active:scale-[0.98] transition-transform"
                      >
                        <div className="aspect-square w-full bg-gray-100 relative">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-3">
                          <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</h3>
                          <p className="text-xs text-gray-500 mt-1">{item.color} · {item.season}</p>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      {selectedClothing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center" onClick={() => { setSelectedItem(null); setConfirmDelete(null); }}>
          <div
            className="bg-white rounded-t-3xl w-full max-w-md max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 flex justify-end">
              <button onClick={() => { setSelectedItem(null); setConfirmDelete(null); }} className="p-2 text-gray-400 active:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="px-6 pb-8">
              <div className="aspect-square w-full max-w-[280px] mx-auto rounded-2xl overflow-hidden mb-6 bg-gray-100">
                <img src={selectedClothing.image} alt={selectedClothing.name} className="w-full h-full object-cover" />
              </div>

              <h2 className="text-xl font-medium text-gray-900 mb-1">{selectedClothing.name}</h2>
              <p className="text-sm text-gray-500 mb-4">{selectedClothing.category}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">🎨 {selectedClothing.color}</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">🌡️ {selectedClothing.season}</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">💃 {selectedClothing.style}</span>
                {selectedClothing.material && (
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">🧶 {selectedClothing.material}</span>
                )}
              </div>

              {confirmDelete === selectedClothing.id ? (
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleDelete(selectedClothing.id)}
                    className="flex-1 py-3 bg-red-500 text-white rounded-2xl text-sm font-medium active:bg-red-600 transition-colors"
                  >
                    Confirmer la suppression
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl text-sm font-medium active:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(selectedClothing.id)}
                  className="w-full py-3 bg-red-50 text-red-600 rounded-2xl text-sm font-medium flex items-center justify-center space-x-2 active:bg-red-100 transition-colors"
                >
                  <Trash2 size={16} />
                  <span>Supprimer de la garde-robe</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
