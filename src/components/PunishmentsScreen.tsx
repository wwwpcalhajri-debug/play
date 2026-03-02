import { motion, AnimatePresence } from 'motion/react';
import { useSocket } from '../SocketContext';
import { Skull, X, RefreshCw } from 'lucide-react';

export function PunishmentsScreen() {
  const { room, socket, openPunishment, closePunishment, shufflePunishments } = useSocket();

  if (!room || !socket) return null;

  const me = room.players.find(p => p.id === socket.id);
  const isHost = me?.isHost;

  // Sort players by errors descending
  const sortedPlayers = [...room.players].sort((a, b) => b.errors - a.errors);
  const currentPlayer = sortedPlayers[room.currentPunishmentPlayerIndex];
  const isMyTurn = currentPlayer?.id === socket.id;
  const isGameOver = room.currentPunishmentPlayerIndex >= sortedPlayers.length;

  const handleSquareClick = (id: number) => {
    if (isMyTurn) {
      openPunishment(id);
    }
  };

  const activePunishment = room.punishments.find(p => p.isOpen);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="min-h-screen flex flex-col p-4 md:p-6 bg-gradient-to-br from-red-900 via-rose-900 to-slate-900 relative overflow-hidden"
    >
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-10 right-10 text-6xl">🔥</div>
        <div className="absolute top-40 left-10 text-4xl">😈</div>
        <div className="absolute bottom-20 right-20 text-5xl">💀</div>
      </div>

      <div className="flex-1 w-full max-w-2xl mx-auto flex flex-col pt-8 z-10">
        <div className="text-center mb-6">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Skull size={64} className="mx-auto text-red-500 mb-4 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">
            مرحلة العقوبات
          </h2>
          <p className="text-red-200 mt-2 font-medium">الترتيب حسب الأخطاء (من الأعلى للأقل)</p>
        </div>

        {/* Current Player Turn */}
        {isGameOver ? (
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 md:p-6 shadow-2xl border border-white/20 mb-8 text-center">
            <h3 className="text-3xl font-black text-yellow-400 mb-2">🎉 انتهت اللعبة! 🎉</h3>
            <p className="text-white font-medium">تم تنفيذ جميع العقوبات بنجاح (أو بالقوة 😂)</p>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 md:p-6 shadow-2xl border border-white/20 mb-8 text-center">
            <h3 className="text-xl font-bold text-white mb-2">الدور الآن على:</h3>
            <div className="flex items-center justify-center gap-4">
              <span className="text-5xl">{currentPlayer?.emoji}</span>
              <span className="text-2xl font-bold text-yellow-400">{currentPlayer?.name}</span>
              <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-bold border border-red-500/50">
                {currentPlayer?.errors} أخطاء
              </span>
              <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-bold border border-yellow-500/50">
                اختار: {room.currentPlayerPunishmentsPicked} / {currentPlayer?.errors}
              </span>
            </div>
            {isMyTurn ? (
              <p className="text-green-400 mt-4 font-bold animate-pulse">اختر مربعاً لعقوبتك!</p>
            ) : (
              <p className="text-blue-200 mt-4 font-medium">بانتظار اختياره...</p>
            )}
          </div>
        )}

        {/* Punishments Grid */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 flex-1">
          {room.punishments.map((punishment, index) => {
            const isOpened = punishment.openedBy !== null;
            
            return (
              <motion.button
                key={punishment.id}
                whileHover={!isOpened && isMyTurn ? { scale: 1.05 } : {}}
                whileTap={!isOpened && isMyTurn ? { scale: 0.95 } : {}}
                onClick={() => handleSquareClick(punishment.id)}
                disabled={isOpened || !isMyTurn}
                className={`relative aspect-square rounded-2xl border-2 flex items-center justify-center text-3xl font-black transition-all ${
                  isOpened 
                    ? 'bg-black/40 border-white/5 text-white/20 cursor-not-allowed' 
                    : isMyTurn
                      ? 'bg-gradient-to-br from-yellow-500 to-orange-500 border-yellow-400 text-slate-900 shadow-lg cursor-pointer hover:shadow-yellow-500/50'
                      : 'bg-white/10 border-white/20 text-white/50 cursor-not-allowed'
                }`}
              >
                {isOpened ? <X size={40} /> : index + 1}
              </motion.button>
            );
          })}
        </div>

        {/* Host Controls */}
        {isHost && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 mb-6"
          >
            <button
              onClick={shufflePunishments}
              className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-3xl text-lg flex items-center justify-center gap-3 shadow-2xl transition-transform active:scale-95 border border-white/20"
            >
              <RefreshCw size={24} />
              تبديل العقوبات المتبقية
            </button>
          </motion.div>
        )}
      </div>

      {/* Active Punishment Modal */}
      <AnimatePresence>
        {activePunishment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => {
              if (activePunishment.openedBy === socket.id) {
                closePunishment(activePunishment.id);
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-gradient-to-br from-red-600 to-rose-800 p-8 rounded-3xl shadow-2xl border-4 border-yellow-400 max-w-md w-full text-center relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-7xl drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]">
                😈
              </div>
              <h3 className="text-3xl font-black text-white mt-8 mb-6 leading-relaxed">
                {activePunishment.text}
              </h3>
              
              {activePunishment.openedBy === socket.id ? (
                <button
                  onClick={() => closePunishment(activePunishment.id)}
                  className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-black rounded-2xl text-xl transition-transform active:scale-95 shadow-lg"
                >
                  تم التنفيذ!
                </button>
              ) : (
                <p className="text-yellow-200 font-bold animate-pulse">
                  بانتظار تنفيذ العقوبة...
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
