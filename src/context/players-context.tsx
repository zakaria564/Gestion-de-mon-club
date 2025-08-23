
"use client";

import React, { createContext, useState, ReactNode } from 'react';
import { players as initialPlayers, type Player } from '@/lib/data';

type PlayerWithoutId = Omit<Player, 'id'>;

interface PlayersContextType {
  players: Player[];
  addPlayer: (player: PlayerWithoutId) => void;
  updatePlayer: (player: Player) => void;
  deletePlayer: (playerId: number) => void;
}

export const PlayersContext = createContext<PlayersContextType | undefined>(undefined);

export const PlayersProvider = ({ children }: { children: ReactNode }) => {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);

  const addPlayer = (player: PlayerWithoutId) => {
    setPlayers(prevPlayers => {
        const newId = prevPlayers.length > 0 ? Math.max(...prevPlayers.map(p => p.id)) + 1 : 1;
        return [...prevPlayers, { id: newId, ...player }];
    });
  };

  const updatePlayer = (updatedPlayer: Player) => {
    setPlayers(prevPlayers => 
        prevPlayers.map(player => 
            player.id === updatedPlayer.id ? updatedPlayer : player
        )
    );
  };

  const deletePlayer = (playerId: number) => {
    setPlayers(prevPlayers => prevPlayers.filter(player => player.id !== playerId));
  };

  return (
    <PlayersContext.Provider value={{ players, addPlayer, updatePlayer, deletePlayer }}>
      {children}
    </PlayersContext.Provider>
  );
};
