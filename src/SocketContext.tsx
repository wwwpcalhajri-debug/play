import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Room } from './types';

interface SocketContextType {
  socket: Socket | null;
  room: Room | null;
  isConnected: boolean;
  createRoom: (name: string, emoji: string) => Promise<string>;
  joinRoom: (roomId: string, name: string, emoji: string) => Promise<string>;
  startGame: () => void;
  submitAnswer: (isCorrect: boolean) => void;
  nextQuestion: () => void;
  goToPunishments: () => void;
  openPunishment: (punishmentId: number) => void;
  closePunishment: (punishmentId: number) => void;
  shufflePunishments: () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // In production, connect to the same host. In dev, connect to current host.
    const newSocket = io({
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('room_state', (updatedRoom: Room) => {
      setRoom(updatedRoom);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const createRoom = (name: string, emoji: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject('Socket not connected');
      socket.emit('create_room', { name, emoji }, (response: any) => {
        if (response.success) {
          resolve(response.roomId);
        } else {
          reject(response.message);
        }
      });
    });
  };

  const joinRoom = (roomId: string, name: string, emoji: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject('Socket not connected');
      socket.emit('join_room', { roomId, name, emoji }, (response: any) => {
        if (response.success) {
          resolve(response.roomId);
        } else {
          reject(response.message);
        }
      });
    });
  };

  const startGame = () => {
    if (socket && room) {
      socket.emit('start_game', room.id);
    }
  };

  const submitAnswer = (isCorrect: boolean) => {
    if (socket && room) {
      socket.emit('submit_answer', { roomId: room.id, isCorrect });
    }
  };

  const nextQuestion = () => {
    if (socket && room) {
      socket.emit('next_question', room.id);
    }
  };

  const goToPunishments = () => {
    if (socket && room) {
      socket.emit('go_to_punishments', room.id);
    }
  };

  const openPunishment = (punishmentId: number) => {
    if (socket && room) {
      socket.emit('open_punishment', { roomId: room.id, punishmentId });
    }
  };

  const closePunishment = (punishmentId: number) => {
    if (socket && room) {
      socket.emit('close_punishment', { roomId: room.id, punishmentId });
    }
  };

  const shufflePunishments = () => {
    if (socket && room) {
      socket.emit('shuffle_punishments', room.id);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        room,
        isConnected,
        createRoom,
        joinRoom,
        startGame,
        submitAnswer,
        nextQuestion,
        goToPunishments,
        openPunishment,
        closePunishment,
        shufflePunishments
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
