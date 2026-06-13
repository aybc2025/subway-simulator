import React from 'react';
import { useGameStore } from './store/gameStore';
import MainMenu from './components/MainMenu';
import GameScreen from './components/GameScreen';
import CompleteScreen from './components/CompleteScreen';
import RotateOverlay from './components/RotateOverlay';

export default function App() {
  const screen = useGameStore((s) => s.screen);
  return (
    <div className="fixed inset-0 bg-panel text-white select-none overflow-hidden">
      {screen === 'menu' && <MainMenu />}
      {screen === 'game' && <GameScreen />}
      {screen === 'complete' && <CompleteScreen />}
      <RotateOverlay />
    </div>
  );
}
