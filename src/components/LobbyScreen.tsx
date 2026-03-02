import { motion } from 'motion/react';
import { useSocket } from '../SocketContext';
import { Users, Play, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export function LobbyScreen() {
  const { room, socket, startGame } = useSocket();
  const [copied, setCopied] = useState(false);

  if (!room || !socket) return null;

  const me = room.players.find(p => p.id === socket.id);
  const isHost = me?.isHost;

  const handleCopy = () => {
    navigator.clipboard.writeText(room.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="min-h-screen flex flex-col p-6 bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 relative"
    >
      <div className="flex-1 w-full max-w-md mx-auto flex flex-col pt-8">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/20 mb-8 text-center">
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">غرفة الانتظار</h2>
          <p className="text-blue-200 mb-4 text-sm">شارك الكود مع أصحابك</p>
          
          <button 
            onClick={handleCopy}
            className="w-full bg-black/30 hover:bg-black/40 border border-white/10 rounded-2xl p-4 flex items-center justify-between group transition-all"
          >
            <span className="text-3xl font-mono font-bold tracking-[0.2em] text-white">{room.id}</span>
            {copied ? <CheckCircle className="text-green-400" /> : <Copy className="text-blue-300 group-hover:text-white" />}
          </button>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users size={20} className="text-yellow-400" />
              اللاعبين
            </h3>
            <span className="bg-white/10 text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
              {room.players.length} / 10
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {room.players.map((player) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white/5 border ${player.id === socket.id ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-white/10'} rounded-2xl p-4 flex flex-col items-center justify-center gap-2 relative overflow-hidden`}
              >
                {player.isHost && (
                  <div className="absolute top-2 right-2 text-xs bg-yellow-500 text-slate-900 px-2 py-0.5 rounded-full font-bold">
                    مضيف
                  </div>
                )}
                <span className="text-4xl drop-shadow-lg">{player.emoji}</span>
                <span className="font-bold text-white truncate w-full text-center">{player.name}</span>
              </motion.div>
            ))}
            
            {/* Empty slots */}
            {Array.from({ length: Math.max(0, 4 - room.players.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-black/20 border border-white/5 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-2 opacity-50">
                <span className="text-4xl grayscale opacity-20">👤</span>
                <span className="font-medium text-blue-200/50 text-sm">في انتظار لاعب...</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 mb-6">
          {isHost ? (
            <button
              onClick={startGame}
              disabled={room.players.length < 2}
              className={`w-full py-5 font-bold rounded-3xl text-xl flex items-center justify-center gap-3 transition-all shadow-xl ${
                room.players.length >= 2 
                  ? 'bg-gradient-to-r from-green-400 to-emerald-600 hover:from-green-300 hover:to-emerald-500 text-white active:scale-95' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Play size={28} fill="currentColor" />
              {room.players.length >= 2 ? 'بدء اللعبة' : 'نحتاج لاعبين على الأقل'}
            </button>
          ) : (
            <div className="w-full py-5 bg-white/5 border border-white/10 text-blue-200 font-bold rounded-3xl text-lg flex items-center justify-center gap-3 text-center">
              <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              بانتظار بدء المضيف...
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
