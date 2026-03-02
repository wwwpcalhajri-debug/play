import { motion } from 'motion/react';
import { useSocket } from '../SocketContext';
import { QUESTIONS } from '../data/questions';
import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Timer, Users, ArrowRight } from 'lucide-react';

export function QuestionScreen() {
  const { room, socket, submitAnswer, nextQuestion } = useSocket();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  if (!room || !socket) return null;

  const me = room.players.find(p => p.id === socket.id);
  const isHost = me?.isHost;
  const currentQuestion = QUESTIONS[room.currentQuestionIndex];
  const hasAnswered = me?.hasAnswered;

  useEffect(() => {
    // Reset selection when question changes
    setSelectedOption(null);
  }, [room.currentQuestionIndex]);

  const handleOptionClick = (index: number) => {
    if (hasAnswered) return;
    setSelectedOption(index);
    submitAnswer(index === currentQuestion.correctAnswerIndex);
  };

  const allAnswered = room.players.every(p => p.hasAnswered);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="min-h-screen flex flex-col p-4 md:p-6 bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 relative overflow-hidden"
    >
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-10 right-10 text-6xl">🌙</div>
        <div className="absolute top-40 left-10 text-4xl">⭐</div>
        <div className="absolute bottom-20 right-20 text-5xl">✨</div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6 z-10">
        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl border border-white/20">
          <span className="text-yellow-400 font-bold">{room.currentQuestionIndex + 1} / 15</span>
        </div>
        
        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${room.timer <= 5 ? 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse' : 'bg-white/10 border-white/20 text-blue-200'}`}>
          <Timer size={20} />
          <span className="font-mono font-bold text-xl">{room.timer}</span>
        </div>

        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl border border-white/20 text-red-400">
          <XCircle size={20} />
          <span className="font-bold">{me?.errors || 0}</span>
        </div>
      </div>

      {/* Question Card */}
      <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full z-10">
        <motion.div 
          key={currentQuestion.id}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-2xl border border-white/20 mb-8 text-center relative"
        >
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-slate-900 font-bold px-6 py-1 rounded-full text-sm shadow-lg border-2 border-slate-900">
            سؤال {room.currentQuestionIndex + 1}
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white leading-relaxed mt-4">
            {currentQuestion.text}
          </h2>
        </motion.div>

        {/* Options */}
        <div className="space-y-4">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedOption === index;
            const isCorrect = index === currentQuestion.correctAnswerIndex;
            
            let buttonClass = "bg-white/5 border-white/10 hover:bg-white/10 text-white";
            
            if (hasAnswered) {
              if (isCorrect) {
                buttonClass = "bg-green-500/20 border-green-500 text-green-300";
              } else if (isSelected) {
                buttonClass = "bg-red-500/20 border-red-500 text-red-300";
              } else {
                buttonClass = "bg-white/5 border-white/10 text-white/50 opacity-50";
              }
            } else if (isSelected) {
              buttonClass = "bg-yellow-500/20 border-yellow-500 text-yellow-300";
            }

            return (
              <motion.button
                key={index}
                whileHover={!hasAnswered ? { scale: 1.02 } : {}}
                whileTap={!hasAnswered ? { scale: 0.98 } : {}}
                onClick={() => handleOptionClick(index)}
                disabled={hasAnswered}
                className={`w-full p-5 rounded-2xl border-2 font-bold text-lg md:text-xl transition-all flex items-center justify-between group ${buttonClass}`}
              >
                <span>{option}</span>
                {hasAnswered && isCorrect && <CheckCircle2 className="text-green-400" />}
                {hasAnswered && isSelected && !isCorrect && <XCircle className="text-red-400" />}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Players Status Footer */}
      <div className="mt-8 bg-black/20 rounded-3xl p-4 border border-white/5 z-10">
        <div className="flex items-center gap-2 mb-3 text-blue-200 text-sm font-medium px-2">
          <Users size={16} />
          <span>حالة اللاعبين</span>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          {room.players.map(p => (
            <div 
              key={p.id} 
              className={`relative w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 transition-all ${
                p.hasAnswered 
                  ? p.lastAnswerCorrect === true 
                    ? 'border-green-500 bg-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.4)]' 
                    : p.lastAnswerCorrect === false 
                      ? 'border-red-500 bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                      : 'border-yellow-500 bg-yellow-500/20'
                  : 'border-white/20 bg-white/5 opacity-50 grayscale'
              }`}
            >
              {p.emoji}
              {p.hasAnswered && p.lastAnswerCorrect !== null && (
                <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full">
                  {p.lastAnswerCorrect ? (
                    <CheckCircle2 size={16} className="text-green-500" fill="currentColor" />
                  ) : (
                    <XCircle size={16} className="text-red-500" fill="currentColor" />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Host Controls */}
      {isHost && allAnswered && (
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50"
        >
          <button
            onClick={nextQuestion}
            className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-slate-900 font-bold rounded-2xl text-lg flex items-center justify-center gap-2 shadow-2xl border-2 border-slate-900"
          >
            الانتقال للسؤال التالي
            <ArrowRight size={20} />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
