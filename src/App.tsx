/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SocketProvider, useSocket } from './SocketContext';
import { HomeScreen } from './components/HomeScreen';
import { LobbyScreen } from './components/LobbyScreen';
import { TransitionScreen } from './components/TransitionScreen';
import { QuestionScreen } from './components/QuestionScreen';
import { LeaderboardScreen } from './components/LeaderboardScreen';
import { PunishmentsScreen } from './components/PunishmentsScreen';
import { motion, AnimatePresence } from 'motion/react';

function GameRouter() {
  const { room } = useSocket();

  if (!room) {
    return <HomeScreen />;
  }

  return (
    <AnimatePresence mode="wait">
      {room.status === 'lobby' && <LobbyScreen key="lobby" />}
      {room.status === 'transition' && <TransitionScreen key="transition" />}
      {room.status === 'question' && <QuestionScreen key="question" />}
      {room.status === 'leaderboard' && <LeaderboardScreen key="leaderboard" />}
      {room.status === 'punishments' && <PunishmentsScreen key="punishments" />}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <SocketProvider>
      <div className="min-h-screen bg-slate-900 text-white font-sans overflow-hidden" dir="rtl">
        <GameRouter />
      </div>
    </SocketProvider>
  );
}
