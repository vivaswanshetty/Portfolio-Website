import { createContext, useContext } from 'react';

export const GlobalAudioContext = createContext({
    isMuted: false,
    isPlaying: false,
    toggleMute: () => {},
    setDuck: () => {},
});

export const useGlobalAudio = () => useContext(GlobalAudioContext);
