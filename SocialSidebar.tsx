import React, { useState, useEffect, useRef } from 'react';
import { useLibrary } from '../context/LibraryContext';
import { ChevronRight, Send, Paperclip, FileText, UserCircle, MessageSquare, ArrowLeft } from 'lucide-react';

export const SocialSidebar: React.FC = () => {
  const { user, messages, sendMessage, users, showToast } = useLibrary();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'public' | 'dms'>('public');
  const [messageInput, setMessageInput] = useState('');
  const [activeDM, setActiveDM] = useState<string | null>(null); 
  const [dmSearchId, setDmSearchId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, activeTab, activeDM]);

  const getChannelId = () => {
    if (activeTab === 'public') return 'global';
    if (activeDM && user) {
        return [user.id, activeDM].sort().join('-');
    }
    return null;
  };

  const currentChannelId = getChannelId();

  const handleSend = () => {
    if (!messageInput.trim() && !fileInputRef.current?.files?.length) return;
    if (!currentChannelId) return;

    sendMessage(messageInput, currentChannelId);
    setMessageInput('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentChannelId) return;

    if (file.size > 1024 * 1024) { 
        showToast('File too large (limit 1MB)', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        sendMessage(
            file.type.startsWith('image/') ? 'Sent a photo' : 'Sent a file',
            currentChannelId,
            {
                type: file.type.startsWith('image/') ? 'image' : 'file',
                url: base64,
                name: file.name
            }
        );
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startDM = (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = dmSearchId.toUpperCase().trim();
    if (targetId === user?.id) {
        showToast("You can't DM yourself", 'error');
        return;
    }
    const targetUser = users.find(u => u.id === targetId);
    
    if (targetUser) {
        setActiveDM(targetId);
        setDmSearchId('');
    } else {
        showToast('User not found. Try a valid ID.', 'error');
    }
  };

  const activeDMUser = activeDM ? users.find(u => u.id === activeDM) : null;

  const currentMessages = messages.filter(m => m.channelId === currentChannelId);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getRecentDMs = () => {
      if (!user) return [];
      const interactions = new Set<string>();
      messages.forEach(m => {
          if (m.channelId !== 'global' && m.channelId.includes(user.id)) {
              const ids = m.channelId.split('-');
              const otherId = ids[0] === user.id ? ids[1] : ids[0];
              interactions.add(otherId);
          }
      });
      return Array.from(interactions);
  };

  return (

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-1/2 right-0 transform -translate-y-1/2 z-40 bg-black text-white dark:bg-white dark:text-black p-3 transition-transform duration-300 shadow-xl ${
          isOpen ? 'translate-x-full' : 'translate-x-0'
        } border-l border-y border-white dark:border-black rounded-l-md`}
        title="Open Social Hub"
      >
        <MessageSquare size={20} />
      </button>


      <div
        className={`fixed top-0 right-0 h-full w-96 bg-paper dark:bg-zinc-900 border-l border-black dark:border-white z-50 transform transition-transform duration-300 shadow-2xl flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-black dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                Social Hub
            </h2>
            <button onClick={() => setIsOpen(false)} className="hover:bg-zinc-200 dark:hover:bg-zinc-700 p-1 rounded">
                <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex gap-2">
            <button 
                onClick={() => { setActiveTab('public'); setActiveDM(null); }}
                className={`flex-1 py-2 text-sm font-bold border rounded-md transition-colors ${activeTab === 'public' ? 'bg-black text-white dark:bg-white dark:text-black border-transparent' : 'bg-transparent border-zinc-300 text-zinc-500 hover:text-black dark:hover:text-white'}`}
            >
                Global Chat
            </button>
            <button 
                onClick={() => setActiveTab('dms')}
                className={`flex-1 py-2 text-sm font-bold border rounded-md transition-colors ${activeTab === 'dms' ? 'bg-black text-white dark:bg-white dark:text-black border-transparent' : 'bg-transparent border-zinc-300 text-zinc-500 hover:text-black dark:hover:text-white'}`}
            >
                Direct Messages
            </button>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-black relative">
            
            {/* DM List View */}
            {activeTab === 'dms' && !activeDM && (
                <div className="p-6 h-full flex flex-col overflow-y-auto animate-fade-in">
                    <div className="text-center mb-6">
                        <UserCircle size={48} className="text-zinc-300 mx-auto mb-4" />
                        <h3 className="font-bold text-lg mb-2">Private Conversations</h3>
                        <p className="text-xs text-zinc-500 mb-4">Enter a USN to start a new chat.</p>
                        
                        <form onSubmit={startDM} className="w-full relative flex gap-2">
                            <input 
                                value={dmSearchId}
                                onChange={(e) => setDmSearchId(e.target.value.toUpperCase())}
                                placeholder="USN / ID"
                                className="flex-1 p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded text-center font-mono uppercase focus:border-black dark:focus:border-white outline-none text-sm"
                            />
                            <button type="submit" className="bg-black text-white dark:bg-white dark:text-black px-4 rounded font-bold text-sm hover:opacity-90">
                                Go
                            </button>
                        </form>
                    </div>

                    <div className="w-full border-t border-zinc-100 dark:border-zinc-800 pt-4">
                        <p className="text-xs font-bold uppercase text-zinc-400 mb-3">Recent Chats</p>
                        <div className="space-y-2">
                            {getRecentDMs().length === 0 ? (
                                <p className="text-xs text-zinc-400 text-center py-4">No recent conversations.</p>
                            ) : (
                                getRecentDMs().map(otherId => {
                                    const otherUser = users.find(u => u.id === otherId);
                                    return (
                                        <button 
                                            key={otherId}
                                            onClick={() => setActiveDM(otherId)}
                                            className="w-full text-left p-3 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs">
                                                    {otherUser?.name.charAt(0) || otherId.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm leading-none">{otherUser?.name || 'Unknown User'}</div>
                                                    <div className="text-[10px] font-mono text-zinc-400 mt-1">{otherId}</div>
                                                </div>
                                            </div>
                                            <ChevronRight size={14} className="text-zinc-300 group-hover:text-black dark:group-hover:text-white" />
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Active Chat View (Global or DM) */}
            {((activeTab === 'public') || (activeTab === 'dms' && activeDM)) && (
                <>
                   {/* DM Header */}
                   {activeTab === 'dms' && activeDMUser && (
                       <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3 shadow-sm z-10">
                           <button onClick={() => setActiveDM(null)} className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full">
                               <ArrowLeft size={16} />
                           </button>
                           <div className="flex-1">
                               <div className="font-bold text-sm leading-none">{activeDMUser.name}</div>
                               <div className="text-[10px] font-mono text-zinc-500">{activeDMUser.id}</div>
                           </div>
                       </div>
                   )}

                   {/* Message List */}
                   <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-paper dark:bg-zinc-950">
                        {currentMessages.length === 0 ? (
                            <div className="text-center text-zinc-400 text-sm mt-10">
                                <p>No messages yet.</p>
                                <p className="text-xs mt-1">Start the conversation!</p>
                            </div>
                        ) : (
                            currentMessages.map((msg, index) => {
                                const isMe = msg.senderId === user?.id;
                                const showName = !isMe && (index === 0 || currentMessages[index - 1].senderId !== msg.senderId);
                                
                                return (
                                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        {/* Sender Name (Only for others) */}
                                        {showName && (
                                            <span className="text-[10px] font-bold text-zinc-500 mb-1 ml-1">
                                                {msg.senderName}
                                            </span>
                                        )}

                                        <div className={`
                                            max-w-[85%] rounded-2xl p-3 shadow-sm relative group
                                            ${isMe 
                                                ? 'bg-black text-white dark:bg-white dark:text-black rounded-tr-sm' 
                                                : 'bg-white text-black dark:bg-zinc-800 dark:text-white rounded-tl-sm border border-zinc-100 dark:border-zinc-700'
                                            }
                                        `}>
                                            {msg.attachment && (
                                                <div className="mb-2">
                                                    {msg.attachment.type === 'image' ? (
                                                        <img src={msg.attachment.url} alt="attachment" className="rounded-lg max-h-48 object-cover border border-white/10 w-full" />
                                                    ) : (
                                                        <div className="flex items-center gap-2 p-2 bg-white/10 rounded border border-white/20">
                                                            <FileText size={16} />
                                                            <span className="text-xs truncate max-w-[150px]">{msg.attachment.name}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</p>
                                        </div>
                                        <span className="text-[9px] text-zinc-400 mt-1 px-1 font-mono tracking-tight">
                                            {formatTime(msg.timestamp)}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                   </div>

                   {/* Input Area */}
                   <div className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                onChange={handleFileUpload}
                                accept="image/*,.pdf,.doc,.docx"
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 text-zinc-400 hover:text-black dark:hover:text-white transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"
                                title="Attach File"
                            >
                                <Paperclip size={18} />
                            </button>
                            <input 
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type a message..."
                                className="flex-1 bg-zinc-100 dark:bg-zinc-800 border-none rounded-full px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
                            />
                            <button 
                                onClick={handleSend}
                                disabled={!messageInput.trim()}
                                className="p-2 bg-black text-white dark:bg-white dark:text-black rounded-full disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-transform"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                   </div>
                </>
            )}
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 transition-opacity animate-fade-in"
        />
      )}
    </>
  );
};
