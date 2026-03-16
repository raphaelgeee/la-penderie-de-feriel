import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../lib/store';
import { getChatSession, generateImage } from '../lib/gemini';
import { Send, Image as ImageIcon, Camera, Loader2, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';
import { clsx } from 'clsx';

export const Chat: React.FC = () => {
  const { chatHistory, addChatMessage, addClothingItem, profile, updateProfile } = useAppContext();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize chat session
  const chatSession = useRef(getChatSession(chatHistory.map(m => ({
    role: m.role,
    parts: [{ text: m.text }] // Simplified for history, ideally we'd store full parts
  }))));

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

      // Send message
      let response = await chatSession.current.sendMessage({ message: parts });
      
      let aiText = response.text || '';
      let generatedImageUrl: string | undefined = undefined;

      // Handle function calls
      if (response.functionCalls && response.functionCalls.length > 0) {
        for (const call of response.functionCalls) {
          if (call.name === 'generate_virtual_tryon') {
            const prompt = (call.args as any).prompt;
            addChatMessage({
              role: 'model',
              text: "Je prépare ton essayage virtuel, donne-moi quelques secondes mon cœur... ✨",
            });
            
            // Generate image
            const imgUrl = await generateImage(prompt, profile.facePhotos);
            if (imgUrl) {
              generatedImageUrl = imgUrl;
              
              // Send function response back to model
              response = await chatSession.current.sendMessage({
                message: [{
                  functionResponse: {
                    name: call.name,
                    response: { success: true, message: "Image generated successfully" }
                  }
                }]
              });
              aiText = response.text || "Et voilà le résultat ! Qu'est-ce que tu en penses ? 🔥";
            } else {
              response = await chatSession.current.sendMessage({
                message: [{
                  functionResponse: {
                    name: call.name,
                    response: { success: false, message: "Failed to generate image" }
                  }
                }]
              });
              aiText = response.text || "Oups, j'ai eu un petit souci pour générer l'image. On réessaie ?";
            }
          } else if (call.name === 'add_clothes_to_wardrobe') {
            const args = call.args as any;
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
              
              // Send function response back to model
              response = await chatSession.current.sendMessage({
                message: [{
                  functionResponse: {
                    name: call.name,
                    response: { success: true, message: "Item added to wardrobe" }
                  }
                }]
              });
              aiText = response.text || `✅ ${args.name} ajouté à ta garde-robe !`;
            } else {
               response = await chatSession.current.sendMessage({
                message: [{
                  functionResponse: {
                    name: call.name,
                    response: { success: false, message: "No image provided by user" }
                  }
                }]
              });
              aiText = response.text || "Je n'ai pas reçu d'image pour ce vêtement mon cœur !";
            }
          }
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

      // Auto-save profile photos if we detect onboarding context
      // This is a simple heuristic. In a real app, we'd use function calling for this too.
      if (userImage && chatHistory.length < 10 && aiText.toLowerCase().includes('photo 2')) {
         updateProfile({ facePhotos: [...profile.facePhotos, userImage] });
      } else if (userImage && chatHistory.length < 10 && aiText.toLowerCase().includes('photo 3')) {
         updateProfile({ facePhotos: [...profile.facePhotos, userImage] });
      } else if (userImage && chatHistory.length < 10 && aiText.toLowerCase().includes('photo corps')) {
         updateProfile({ facePhotos: [...profile.facePhotos, userImage] }); // Last face photo
      } else if (userImage && chatHistory.length < 10 && aiText.toLowerCase().includes('préférences')) {
         updateProfile({ bodyPhotos: [...profile.bodyPhotos, userImage] });
      }

    } catch (error) {
      console.error("Chat error:", error);
      addChatMessage({
        role: 'model',
        text: "Désolée mon cœur, j'ai eu un petit bug technique. Tu peux répéter ? 🥺",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f5f2ed] pb-16">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h1 className="text-xl font-serif font-medium text-gray-900">La Penderie</h1>
        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
          <Sparkles className="text-[#FF6321]" size={16} />
        </div>
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
                <img src={msg.generatedImage} alt="Virtual Try-on" className="w-full h-auto object-cover" />
              </div>
            )}

            {msg.text && (
              <div className={clsx(
                "px-5 py-3.5 rounded-3xl text-[15px] leading-relaxed",
                msg.role === 'user' 
                  ? "bg-[#FF6321] text-white rounded-tr-sm" 
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
              <Loader2 className="animate-spin text-[#FF6321]" size={18} />
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
            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-[#FF6321]">
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
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-400 hover:text-[#FF6321] transition-colors rounded-full bg-gray-50 mb-1"
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
            className="p-3.5 bg-[#FF6321] text-white rounded-full disabled:opacity-50 disabled:bg-gray-300 transition-colors mb-1 shadow-sm"
          >
            <Send size={20} className="ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
