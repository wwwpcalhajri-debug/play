export type Player = {
  id: string;
  name: string;
  emoji: string;
  score: number;
  errors: number;
  hasAnswered: boolean;
  lastAnswerCorrect: boolean | null;
  isHost: boolean;
};

export type Punishment = {
  id: number;
  text: string;
  isOpen: boolean;
  openedBy: string | null;
};

export type RoomStatus = 'lobby' | 'transition' | 'question' | 'leaderboard' | 'punishments';

export type Room = {
  id: string;
  hostId: string;
  players: Player[];
  status: RoomStatus;
  currentQuestionIndex: number;
  timer: number;
  punishments: Punishment[];
  currentPunishmentPlayerIndex: number;
  currentPlayerPunishmentsPicked: number;
};
