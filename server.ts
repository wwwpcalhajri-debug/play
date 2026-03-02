import express from "express";
import { createServer as createViteServer } from "vite";
import { Server } from "socket.io";
import http from "http";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Game State Types
type Player = {
  id: string;
  name: string;
  emoji: string;
  score: number;
  errors: number;
  hasAnswered: boolean;
  lastAnswerCorrect: boolean | null;
  isHost: boolean;
};

type Punishment = {
  id: number;
  text: string;
  isOpen: boolean;
  openedBy: string | null;
};

type RoomStatus = 'lobby' | 'transition' | 'question' | 'leaderboard' | 'punishments';

type Room = {
  id: string;
  hostId: string;
  players: Player[];
  status: RoomStatus;
  currentQuestionIndex: number;
  timer: number;
  punishments: Punishment[];
};

const rooms = new Map<string, Room>();

const INITIAL_PUNISHMENTS = [
  "ارقص مصري 💃",
  "نظف الجلسة 🧹",
  "حب رأس واحد من اختيارك 😘",
  "اجلب موية للاعب يبي 🥤",
  "ارقص هندي مع أغنية 🕺",
  "غن أغنية قصيرة 🎤",
  "اجلس واقف دقيقتين 🧍",
  "العب بصلة لحالك 🧅",
  "اضحك من القلب 😂",
  "خلى اللاعبين يدغدغوك 🤭",
  "قل جملة طويلة باللهجة المصرية 🗣️",
  "غن أغنية من اختيار لاعب على يمينك 🎶",
  "غن دوها كاملة 🎵",
  "أعطِ لاعب ريال واحد 💸",
  "اجلس فاتح فمك دقيقتين 😮"
];

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getRoomState(roomId: string) {
  return rooms.get(roomId);
}

function broadcastRoomState(roomId: string) {
  const room = rooms.get(roomId);
  if (room) {
    io.to(roomId).emit('room_state', room);
  }
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('create_room', ({ name, emoji }, callback) => {
    const roomId = generateRoomCode();
    const player: Player = {
      id: socket.id,
      name,
      emoji,
      score: 0,
      errors: 0,
      hasAnswered: false,
      lastAnswerCorrect: null,
      isHost: true
    };

    const room: Room = {
      id: roomId,
      hostId: socket.id,
      players: [player],
      status: 'lobby',
      currentQuestionIndex: 0,
      timer: 30,
      punishments: INITIAL_PUNISHMENTS.map((text, index) => ({
        id: index,
        text,
        isOpen: false,
        openedBy: null
      })),
      currentPunishmentPlayerIndex: 0,
      currentPlayerPunishmentsPicked: 0
    };

    rooms.set(roomId, room);
    socket.join(roomId);
    callback({ success: true, roomId });
    broadcastRoomState(roomId);
  });

  socket.on('join_room', ({ roomId, name, emoji }, callback) => {
    const room = rooms.get(roomId);
    if (!room) {
      return callback({ success: false, message: 'الغرفة غير موجودة' });
    }
    if (room.status !== 'lobby') {
      return callback({ success: false, message: 'اللعبة بدأت بالفعل' });
    }
    if (room.players.length >= 10) {
      return callback({ success: false, message: 'الغرفة ممتلئة' });
    }
    if (room.players.some(p => p.name === name)) {
      return callback({ success: false, message: 'الاسم مستخدم بالفعل' });
    }

    const player: Player = {
      id: socket.id,
      name,
      emoji,
      score: 0,
      errors: 0,
      hasAnswered: false,
      lastAnswerCorrect: null,
      isHost: false
    };

    room.players.push(player);
    socket.join(roomId);
    callback({ success: true, roomId });
    broadcastRoomState(roomId);
  });

  socket.on('start_game', (roomId) => {
    const room = rooms.get(roomId);
    if (room && room.hostId === socket.id) {
      room.status = 'transition';
      broadcastRoomState(roomId);
      
      // After 3 seconds transition to question
      setTimeout(() => {
        if (rooms.has(roomId)) {
          const r = rooms.get(roomId)!;
          r.status = 'question';
          r.timer = 30;
          r.players.forEach(p => {
            p.hasAnswered = false;
            p.lastAnswerCorrect = null;
          });
          broadcastRoomState(roomId);
          startTimer(roomId);
        }
      }, 3000);
    }
  });

  socket.on('submit_answer', ({ roomId, isCorrect }) => {
    const room = rooms.get(roomId);
    if (room && room.status === 'question') {
      const player = room.players.find(p => p.id === socket.id);
      if (player && !player.hasAnswered) {
        player.hasAnswered = true;
        player.lastAnswerCorrect = isCorrect;
        if (isCorrect) {
          player.score += 10;
        } else {
          player.errors += 1;
        }
        broadcastRoomState(roomId);

        // Check if all players answered
        if (room.players.every(p => p.hasAnswered)) {
          endQuestion(roomId);
        }
      }
    }
  });

  socket.on('next_question', (roomId) => {
    const room = rooms.get(roomId);
    if (room && room.hostId === socket.id) {
      room.currentQuestionIndex++;
      if (room.currentQuestionIndex >= 15) {
        room.status = 'punishments';
        broadcastRoomState(roomId);
      } else {
        // Show transition only at start of Medium (index 5) or Hard (index 10)
        const isNewRound = room.currentQuestionIndex === 5 || room.currentQuestionIndex === 10;
        
        if (isNewRound) {
          room.status = 'transition';
          broadcastRoomState(roomId);
          setTimeout(() => {
            if (rooms.has(roomId)) {
              const r = rooms.get(roomId)!;
              r.status = 'question';
              r.timer = 30;
              r.players.forEach(p => {
                p.hasAnswered = false;
                p.lastAnswerCorrect = null;
              });
              broadcastRoomState(roomId);
              startTimer(roomId);
            }
          }, 3000);
        } else {
          // Go directly to next question
          room.status = 'question';
          room.timer = 30;
          room.players.forEach(p => {
            p.hasAnswered = false;
            p.lastAnswerCorrect = null;
          });
          broadcastRoomState(roomId);
          startTimer(roomId);
        }
      }
    }
  });

  socket.on('go_to_punishments', (roomId) => {
    const room = rooms.get(roomId);
    if (room && room.hostId === socket.id) {
      room.status = 'punishments';
      
      // Initialize punishment turn properly (skip 0 errors)
      const sortedPlayers = [...room.players].sort((a, b) => b.errors - a.errors);
      room.currentPunishmentPlayerIndex = 0;
      room.currentPlayerPunishmentsPicked = 0;
      while (
        room.currentPunishmentPlayerIndex < sortedPlayers.length && 
        sortedPlayers[room.currentPunishmentPlayerIndex].errors === 0
      ) {
        room.currentPunishmentPlayerIndex++;
      }
      
      broadcastRoomState(roomId);
    }
  });

  socket.on('open_punishment', ({ roomId, punishmentId }) => {
    const room = rooms.get(roomId);
    if (room && room.status === 'punishments') {
      const punishment = room.punishments.find(p => p.id === punishmentId);
      if (punishment && !punishment.isOpen && !punishment.openedBy) {
        punishment.isOpen = true;
        punishment.openedBy = socket.id;
        broadcastRoomState(roomId);
      }
    }
  });

  socket.on('close_punishment', ({ roomId, punishmentId }) => {
    const room = rooms.get(roomId);
    if (room && room.status === 'punishments') {
      const punishment = room.punishments.find(p => p.id === punishmentId);
      if (punishment && punishment.isOpen && punishment.openedBy === socket.id) {
        punishment.isOpen = false;
        room.currentPlayerPunishmentsPicked++;
        
        const sortedPlayers = [...room.players].sort((a, b) => b.errors - a.errors);
        const currentPlayer = sortedPlayers[room.currentPunishmentPlayerIndex];
        
        if (currentPlayer && room.currentPlayerPunishmentsPicked >= currentPlayer.errors) {
          room.currentPunishmentPlayerIndex++;
          room.currentPlayerPunishmentsPicked = 0;
          
          // Skip players with 0 errors
          while (
            room.currentPunishmentPlayerIndex < sortedPlayers.length && 
            sortedPlayers[room.currentPunishmentPlayerIndex].errors === 0
          ) {
            room.currentPunishmentPlayerIndex++;
          }
        }
        
        broadcastRoomState(roomId);
      }
    }
  });

  socket.on('shuffle_punishments', (roomId) => {
    const room = rooms.get(roomId);
    if (room && room.hostId === socket.id) {
      // Reset all punishments to closed and unassigned
      room.punishments.forEach(p => {
        p.isOpen = false;
        p.openedBy = null;
      });
      
      // Shuffle texts
      const texts = room.punishments.map(p => p.text);
      for (let i = texts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [texts[i], texts[j]] = [texts[j], texts[i]];
      }
      room.punishments.forEach((p, i) => {
        p.text = texts[i];
      });
      
      broadcastRoomState(roomId);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Handle player disconnect
    rooms.forEach((room, roomId) => {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        const player = room.players[playerIndex];
        room.players.splice(playerIndex, 1);
        
        if (room.players.length === 0) {
          rooms.delete(roomId);
        } else if (player.isHost) {
          room.players[0].isHost = true;
          room.hostId = room.players[0].id;
          broadcastRoomState(roomId);
        } else {
          broadcastRoomState(roomId);
        }
      }
    });
  });
});

const activeTimers = new Map<string, NodeJS.Timeout>();

function startTimer(roomId: string) {
  if (activeTimers.has(roomId)) {
    clearInterval(activeTimers.get(roomId)!);
  }

  const interval = setInterval(() => {
    const room = rooms.get(roomId);
    if (room && room.status === 'question') {
      room.timer--;
      broadcastRoomState(roomId);
      if (room.timer <= 0) {
        endQuestion(roomId);
      }
    } else {
      clearInterval(interval);
      activeTimers.delete(roomId);
    }
  }, 1000);

  activeTimers.set(roomId, interval);
}

function endQuestion(roomId: string) {
  if (activeTimers.has(roomId)) {
    clearInterval(activeTimers.get(roomId)!);
    activeTimers.delete(roomId);
  }
  const room = rooms.get(roomId);
  if (room) {
    // Mark unanswered as errors
    room.players.forEach(p => {
      if (!p.hasAnswered) {
        p.hasAnswered = true;
        p.lastAnswerCorrect = false;
        p.errors += 1;
      }
    });

    // Only go to leaderboard if it's the last question
    if (room.currentQuestionIndex >= 14) {
      room.status = 'leaderboard';
    } else {
      // Stay on 'question' screen so host can click "Next Question"
    }
    
    broadcastRoomState(roomId);
  }
}

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
