import { motion } from 'motion/react';
import { useSocket } from '../SocketContext';
import { Trophy, ArrowRight, XCircle, CheckCircle2 } from 'lucide-react';

export function LeaderboardScreen() {
  const { room, socket, nextQuestion, goToPunishments } = useSocket();

  if (!room || !socket) return null;

  const me = room.players.find(p => p.id === socket.id);
  const isHost = me?.isHost;
  const isLastQuestion = room.currentQuestionIndex >= 14;

  // Sort players by score descending, then by errors ascending
  const sortedPlayers = [...room.players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.errors - b.errors;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="min-h-screen flex flex-col p-6 bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 relative overflow-hidden"
    >
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-10 right-10 text-6xl">🌙</div>
        <div className="absolute top-40 left-10 text-4xl">⭐</div>
        <div className="absolute bottom-20 right-20 text-5xl">✨</div>
      </div>

      <div className="flex-1 w-full max-w-md mx-auto flex flex-col pt-8 z-10">
        <div className="text-center mb-8">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Trophy size={64} className="mx-auto text-yellow-400 mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
          </motion.div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
            لوحة الصدارة
          </h2>
          <p className="text-blue-200 mt-2 font-medium">الترتيب الحالي بعد السؤال {room.currentQuestionIndex + 1}</p>
        </div>

        <div className="flex-1 space-y-3">
          {sortedPlayers.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-4 p-4 rounded-2xl border ${
                index === 0 
                  ? 'bg-yellow-500/20 border-yellow-500/50 shadow-[0_0_15px_rgba(250,204,21,0.2)]' 
                  : index === 1
                    ? 'bg-slate-300/20 border-slate-300/50'
                    : index === 2
                      ? 'bg-amber-700/20 border-amber-700/50'
                      : 'bg-white/5 border-white/10'
              } ${player.id === socket.id ? 'ring-2 ring-blue-400' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                index === 0 ? 'bg-yellow-500 text-slate-900' :
                index === 1 ? 'bg-slate-300 text-slate-900' :
                index === 2 ? 'bg-amber-700 text-white' :
                'bg-black/30 text-white/50'
              }`}>
                {index + 1}
              </div>
              
              <div className="text-3xl">{player.emoji}</div>
              
              <div className="flex-1">
                <div className="font-bold text-lg text-white">{player.name}</div>
                <div className="text-sm text-blue-200 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 size={14} className="text-green-400" /> {player.score}
                  </span>
                  <span className="flex items-center gap-1">
                    <XCircle size={14} className="text-red-400" /> {player.errors}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {isHost && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 mb-6"
          >
            {isLastQuestion ? (
              <button
                onClick={goToPunishments}
                className="w-full py-5 bg-gradient-to-r from-red-500 to-rose-700 hover:from-red-400 hover:to-rose-600 text-white font-bold rounded-3xl text-xl flex items-center justify-center gap-3 shadow-2xl transition-transform active:scale-95"
              >
                انتقل للعقوبات 😈
                <ArrowRight size={24} />
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="w-full py-5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-slate-900 font-bold rounded-3xl text-xl flex items-center justify-center gap-3 shadow-2xl transition-transform active:scale-95"
              >
                السؤال التالي
                <ArrowRight size={24} />
              </button>
            )}
          </motion.div>
        )}
        
        {!isHost && (
          <div className="mt-8 mb-6 w-full py-5 bg-white/5 border border-white/10 text-blue-200 font-bold rounded-3xl text-lg flex items-center justify-center gap-3 text-center">
            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            بانتظار المضيف...
          </div>
        )}
      </div>
    </motion.div>
  );
}
