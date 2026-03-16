import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAppContext } from '../lib/store';
import { getChatSession, generateImage, fetchWeather } from '../lib/gemini';
import { Send, Camera, Loader2, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';
import { clsx } from 'clsx';

export const Chat: React.FC = () => {
  const { chatHistory, addChatMessage, addClothingItem, removeClothingItem, profile, updateProfile, wardrobe } = useAppContext();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track wardrobe/profile for session refresh
  const sessionRef = useRef<ReturnType<typeof getChatSession> | null>(null);
  const wardrobeRef = useRef(wardrobe);
  const profileRef = useRef(profile);

  // Initialize or refresh chat session when wardrobe/profile changes
  const getSession = useCallback(() => {
    if (
      !sessionRef.current ||
      wardrobeRef.current !== wardrobe ||
      profileRef.current !== profile
    ) {
      wardrobeRef.current = wardrobe;
      profileRef.current = profile;
      sessionRef.current = getChatSession(
        chatHistory.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        wardrobe,
        profile
      );
    }
    return sessionRef.current;
  }, [wardrobe, profile, chatHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    const userText = input;
    const userImage = selectedImage;

    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    // Add user message to UI
    addChatMessage({
      role: 'user',
      text: userText,
      image: userImage || undefined,
    });

    try {
      // Prepare parts for Gemini
      const parts: any[] = [];
      if (userText) parts.push({ text: userText });
      if (userImage) {
        const mimeType = userImage.split(';')[0].split(':')[1];
        const base64Data = userImage.split(',')[1];
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        });
      }

      const session = getSession();

      // Send message
      let response = await session.sendMessage({ message: parts });

      let aiText = response.text || '';
      let generatedImageUrl: string | undefined = undefined;

      // Handle function calls (may be chained)
      while (response.functionCalls && response.functionCalls.length > 0) {
        const functionResponses: any[] = [];

        for (const call of response.functionCalls) {
          const args = call.args as any;

          if (call.name === 'generate_virtual_tryon') {
            addChatMessage({
              role: 'model',
              text: "Je prépare ton essayage virtuel, donne-moi quelques secondes mon coeur... ✨",
            });

            const imgUrl = await generateImage(args.prompt, profile.facePhotos.concat(profile.bodyPhotos));
            if (imgUrl) {
              generatedImageUrl = imgUrl;
              functionResponses.push({
                functionResponse: {
                  name: call.name,
                  response: { success: true, message: "Image generated successfully" }
                }
              });
            } else {
              functionResponses.push({
                functionResponse: {
                  name: call.name,
                  response: { success: false, message: "Failed to generate image" }
                }
              });
            }
          } else if (call.name === 'add_clothes_to_wardrobe') {
            if (userImage) {
              addClothingItem({
                name: args.name,
                category: args.category,
                color: args.color,
                season: args.season,
                style: args.style,
                material: args.material,
                image: userImage,
              });
              functionResponses.push({
                functionResponse: {
                  name: call.name,
                  response: { success: true, message: `${args.name} ajouté. Garde-robe: ${wardrobe.length + 1} pièces.` }
                }
              });
            } else {
              functionResponses.push({
                functionResponse: {
                  name: call.name,
                  response: { success: false, message: "No image provided by user" }
                }
              });
            }
          } else if (call.name === 'remove_clothes_from_wardrobe') {
            const idOrName = args.item_id || args.item_name || '';
            if (idOrName) {
              removeClothingItem(idOrName);
              functionResponses.push({
                functionResponse: {
                  name: call.name,
                  response: { success: true, message: `${idOrName} supprimé de la garde-robe.` }
                }
              });
            } else {
              functionResponses.push({
                functionResponse: {
                  name: call.name,
                  response: { success: false, message: "No item ID or name provided" }
                }
              });
            }
          } else if (call.name === 'save_profile_photo') {
            if (userImage) {
              if (args.photo_type === 'face') {
                updateProfile({ facePhotos: [...profile.facePhotos, userImage] });
                functionResponses.push({
                  functionResponse: {
                    name: call.name,
                    response: { success: true, message: `Photo visage ${profile.facePhotos.length + 1} sauvegardée.` }
                  }
                });
              } else if (args.photo_type === 'body') {
                updateProfile({ bodyPhotos: [...profile.bodyPhotos, userImage] });
                functionResponses.push({
                  functionResponse: {
                    name: call.name,
                    response: { success: true, message: `Photo corps ${profile.bodyPhotos.length + 1} sauvegardée.` }
                  }
                });
              } else {
                functionResponses.push({
                  functionResponse: {
                    name: call.name,
                    response: { success: false, message: "Invalid photo_type. Use 'face' or 'body'." }
                  }
                });
              }
            } else {
              functionResponses.push({
                functionResponse: {
                  name: call.name,
                  response: { success: false, message: "No image provided by user" }
                }
              });
            }
          } else if (call.name === 'update_preferences') {
            const updates: any = {};
            if (args.style) updates.style = args.style;
            if (args.favorite_colors) updates.favoriteColors = args.favorite_colors;
            if (args.avoid_colors) updates.avoidColors = args.avoid_colors;
            if (args.avoid_items) updates.avoidItems = args.avoid_items;

            // If all preferences have been set, mark onboarding complete
            const newProfile = { ...profile, ...updates };
            if (newProfile.style && newProfile.facePhotos.length > 0) {
              updates.onboardingComplete = true;
            }

            updateProfile(updates);
            functionResponses.push({
              functionResponse: {
                name: call.name,
                response: { success: true, message: "Préférences mises à jour." }
              }
            });
          } else if (call.name === 'get_weather') {
            const weatherData = await fetchWeather(args.city, args.days || 1);
            functionResponses.push({
              functionResponse: {
                name: call.name,
                response: { success: true, data: weatherData }
              }
            });
          }
        }

        // Send all function responses back
        if (functionResponses.length > 0) {
          response = await session.sendMessage({ message: functionResponses });
          aiText = response.text || aiText;
        } else {
          break;
        }
      }

      // Add AI response to UI
      if (aiText || generatedImageUrl) {
        addChatMessage({
          role: 'model',
          text: aiText,
          generatedImage: generatedImageUrl,
        });
      }

      // Force session refresh on next message to pick up new wardrobe/profile state
      sessionRef.current = null;

    } catch (error) {
      console.error("Chat error:", error);
      addChatMessage({
        role: 'model',
        text: "Désolée mon coeur, j'ai eu un petit bug technique. Tu peux répéter ? 🥺",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f5f2ed] pb-16">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-10 px-6 py-3 border-b border-gray-100 flex items-center justify-center">
        <img src="/logo.svg" alt="Fériel — La Penderie" className="h-10" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {chatHistory.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-10">
            Dis "Bonjour" pour commencer ! 👋
          </div>
        )}

        {chatHistory.map((msg) => (
          <div key={msg.id} className={clsx("flex flex-col max-w-[85%]", msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start")}>
            {msg.image && (
              <div className="mb-2 rounded-2xl overflow-hidden border-2 border-white shadow-sm max-w-[200px]">
                <img src={msg.image} alt="Upload" className="w-full h-auto object-cover" />
              </div>
            )}

            {msg.generatedImage && (
              <div className="mb-2 rounded-3xl overflow-hidden shadow-md w-full max-w-[280px]">
                <img src={msg.generatedImage} alt="Essayage virtuel" className="w-full h-auto object-cover" />
              </div>
            )}

            {msg.text && (
              <div className={clsx(
                "px-5 py-3.5 rounded-3xl text-[15px] leading-relaxed",
                msg.role === 'user'
                  ? "bg-[#C9952C] text-white rounded-tr-sm"
                  : "bg-white text-gray-800 shadow-sm rounded-tl-sm"
              )}>
                <div className="markdown-body prose prose-sm max-w-none">
                  <Markdown>{msg.text}</Markdown>
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex max-w-[85%] mr-auto items-start">
            <div className="px-5 py-4 bg-white shadow-sm rounded-3xl rounded-tl-sm flex items-center space-x-2">
              <Loader2 className="animate-spin text-[#C9952C]" size={18} />
              <span className="text-sm text-gray-500">La Penderie réfléchit...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white px-4 py-3 border-t border-gray-100 pb-safe">
        {selectedImage && (
          <div className="mb-3 relative inline-block">
            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-[#C9952C]">
              <img src={selectedImage} alt="Selected" className="w-full h-full object-cover" />
            </div>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex items-end space-x-2">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-400 hover:text-[#C9952C] active:text-[#C9952C] transition-colors rounded-full bg-gray-50 mb-1"
          >
            <Camera size={22} />
          </button>

          <div className="flex-1 bg-gray-50 rounded-3xl border border-gray-200 overflow-hidden flex items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Écris un message..."
              className="w-full max-h-32 bg-transparent px-4 py-3.5 text-[15px] focus:outline-none resize-none"
              rows={1}
              style={{ minHeight: '52px' }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={(!input.trim() && !selectedImage) || isLoading}
            className="p-3.5 bg-[#C9952C] text-white rounded-full disabled:opacity-50 disabled:bg-gray-300 transition-colors mb-1 shadow-sm"
          >
            <Send size={20} className="ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
