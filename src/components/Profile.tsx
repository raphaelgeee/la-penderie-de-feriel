import React from 'react';
import { useAppContext } from '../lib/store';
import { Camera, User, Palette, Ban } from 'lucide-react';

export const Profile: React.FC = () => {
  const { profile } = useAppContext();

  return (
    <div className="flex-1 overflow-y-auto bg-[#f5f2ed] pb-20">
      <div className="p-6">
        <h1 className="text-3xl font-serif text-gray-900 mb-6">Mon Profil</h1>

        <div className="space-y-6">
          {/* Photos Section */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <Camera className="text-[#C9952C]" size={24} />
              <h2 className="text-lg font-medium text-gray-900">Mes Photos</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Visage</h3>
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {profile.facePhotos.length > 0 ? (
                    profile.facePhotos.map((photo, i) => (
                      <div key={i} className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                        <img src={photo} alt={`Visage ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                      Aucune
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Corps</h3>
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {profile.bodyPhotos.length > 0 ? (
                    profile.bodyPhotos.map((photo, i) => (
                      <div key={i} className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                        <img src={photo} alt={`Corps ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                      Aucune
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Style Preferences */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <User className="text-[#C9952C]" size={24} />
              <h2 className="text-lg font-medium text-gray-900">Mon Style</h2>
            </div>
            <p className="text-gray-600 text-sm">
              {profile.style || "Non défini. Parle avec La Penderie pour définir ton style !"}
            </p>
          </div>

          {/* Colors */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <Palette className="text-[#C9952C]" size={24} />
              <h2 className="text-lg font-medium text-gray-900">Couleurs Préférées</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.favoriteColors.length > 0 ? (
                profile.favoriteColors.map((color, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                    {color}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 text-sm">Aucune couleur définie.</p>
              )}
            </div>
          </div>

          {/* Exclusions */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <Ban className="text-red-500" size={24} />
              <h2 className="text-lg font-medium text-gray-900">À Éviter</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Couleurs</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.avoidColors.length > 0 ? (
                    profile.avoidColors.map((color, i) => (
                      <span key={i} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm">
                        {color}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">Aucune.</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Pièces / Styles</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.avoidItems.length > 0 ? (
                    profile.avoidItems.map((item, i) => (
                      <span key={i} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm">
                        {item}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">Aucun.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
