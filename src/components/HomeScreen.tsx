import { useState } from 'react';
import { motion } from 'motion/react';
import { useSocket } from '../SocketContext';
import { Users, Plus, LogIn } from 'lucide-react';

const EMOJIS = ['❤️', '🎶', '👻', '🐨', '🦄', '🦑', '🕸️', '🦴', '👀', '🧠', '🦷'];

export function HomeScreen() {
  const { createRoom, joinRoom } = useSocket();
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name) return setError('أدخل اسمك أولاً');
    try {
      await createRoom(name, emoji);
    } catch (err: any) {
      setError(err);
    }
  };

  const handleJoin = async () => {
    if (!name) return setError('أدخل اسمك أولاً');
    if (!roomId) return setError('أدخل كود الغرفة');
    try {
      await joinRoom(roomId.toUpperCase(), name, emoji);
    } catch (err: any) {
      setError(err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 relative"
    >
      {/* Decorative stars/lanterns could go here */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-10 right-10 text-6xl">🌙</div>
        <div className="absolute top-40 left-10 text-4xl">⭐</div>
        <div className="absolute bottom-20 right-20 text-5xl">✨</div>
      </div>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 z-10">
        <h1 className="text-5xl font-black text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
          مين الغبي
        </h1>
        <p className="text-center text-blue-200 mb-8 font-medium">لعبة التحدي الرمضانية</p>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-6 text-center text-sm">
            {error}
          </div>
        )}

        {mode === 'menu' && (
          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-slate-900 font-bold rounded-2xl text-lg flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg"
            >
              <Plus size={24} />
              إنشاء غرفة
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-lg flex items-center justify-center gap-2 transition-transform active:scale-95 border border-white/10"
            >
              <LogIn size={24} />
              الانضمام لغرفة
            </button>
          </div>
        )}

        {(mode === 'create' || mode === 'join') && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">اسمك</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="اكتب اسمك هنا..."
                maxLength={12}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">اختر إيموجي</label>
              <div className="grid grid-cols-6 gap-2">
                {EMOJIS.map(e => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    className={`text-2xl p-2 rounded-xl transition-all ${emoji === e ? 'bg-yellow-500/30 border border-yellow-500 scale-110' : 'bg-black/20 border border-transparent hover:bg-white/10'}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {mode === 'join' && (
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">كود الغرفة</label>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 text-center text-2xl tracking-widest uppercase"
                  placeholder="XXXXXX"
                  maxLength={6}
                />
              </div>
            )}

            <div className="pt-4 space-y-3">
              <button
                onClick={mode === 'create' ? handleCreate : handleJoin}
                className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-slate-900 font-bold rounded-2xl text-lg flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg"
              >
                {mode === 'create' ? 'يلا نبدأ' : 'دخول'}
              </button>
              <button
                onClick={() => { setMode('menu'); setError(''); }}
                className="w-full py-3 text-blue-300 hover:text-white font-medium rounded-2xl text-sm transition-colors"
              >
                رجوع
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
