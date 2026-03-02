import { motion } from 'motion/react';
import { useSocket } from '../SocketContext';
import { QUESTIONS } from '../data/questions';

export function TransitionScreen() {
  const { room } = useSocket();

  if (!room) return null;

  const currentQuestion = QUESTIONS[room.currentQuestionIndex];
  const difficulty = currentQuestion?.difficulty || 'easy';

  let bgClass = '';
  let text = '';
  let emojis = '';

  if (difficulty === 'easy') {
    bgClass = 'from-green-400 to-emerald-600';
    text = 'سهلة؟ لا تتحمس 😏';
    emojis = '😎 😌 ✌️';
  } else if (difficulty === 'medium') {
    bgClass = 'from-yellow-400 to-orange-500';
    text = 'هنا تبدأ المصايب 😈';
    emojis = '🔥 🤔 😬';
  } else {
    bgClass = 'from-red-500 to-rose-700';
    text = 'شد حيلك...🔥';
    emojis = '😱 💀 💥';
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br ${bgClass} relative overflow-hidden`}
    >
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: difficulty === 'hard' ? [-2, 2, -2] : 0
        }}
        transition={{ 
          duration: difficulty === 'hard' ? 0.2 : 2, 
          repeat: Infinity 
        }}
        className="text-center z-10"
      >
        <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-2xl mb-6">
          {text}
        </h1>
        <div className="text-6xl md:text-8xl flex gap-4 justify-center drop-shadow-lg">
          {emojis.split(' ').map((emoji, i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
            >
              {emoji}
            </motion.span>
          ))}
        </div>
      </motion.div>

      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/4 -right-1/4 w-full h-full bg-white/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/4 -left-1/4 w-full h-full bg-black/10 rounded-full blur-3xl"
        />
      </div>
    </motion.div>
  );
}
