import React, { useCallback, useEffect, useRef, useState } from 'react';
import ambientThemeUrl from '../assets/ambient_theme.mp3';
import { GlobalAudioContext } from './useGlobalAudio';

const BASE_VOLUME = 0.20;
const DUCKED_VOLUME = 0.08;

export const GlobalAudioProvider = ({ children }) => {
    const audioRef = useRef(null);
    const mutedRef = useRef(false);
    const duckRef = useRef(false);
    const fadeRafRef = useRef(null);

    const [isMuted, setIsMuted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    const rampVolumeTo = useCallback((target) => {
        if (fadeRafRef.current) cancelAnimationFrame(fadeRafRef.current);
        const step = () => {
            const el = audioRef.current;
            if (!el) return;
            const diff = target - el.volume;
            if (Math.abs(diff) < 0.005) {
                el.volume = target;
                fadeRafRef.current = null;
                return;
            }
            el.volume = Math.max(0, Math.min(1, el.volume + diff * 0.14));
            fadeRafRef.current = requestAnimationFrame(step);
        };
        fadeRafRef.current = requestAnimationFrame(step);
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof Audio === 'undefined') return undefined;

        const audio = new Audio(ambientThemeUrl);
        audio.loop = true;
        audio.preload = 'auto';
        audio.volume = BASE_VOLUME;
        audioRef.current = audio;

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);

        let unlockAttached = false;
        const detachUnlock = () => {
            if (!unlockAttached) return;
            unlockAttached = false;
            window.removeEventListener('pointerdown', handleFirstInteraction, true);
            window.removeEventListener('click', handleFirstInteraction, true);
            window.removeEventListener('keydown', handleFirstInteraction, true);
            window.removeEventListener('touchend', handleFirstInteraction, true);
        };

        function handleFirstInteraction() {
            if (mutedRef.current || !audioRef.current) {
                detachUnlock();
                return;
            }
            audioRef.current
                .play()
                .then(() => {
                    detachUnlock();
                })
                .catch(() => {});
        }

        const attachUnlock = () => {
            if (unlockAttached) return;
            unlockAttached = true;
            window.addEventListener('pointerdown', handleFirstInteraction, { capture: true, passive: true });
            window.addEventListener('click', handleFirstInteraction, { capture: true, passive: true });
            window.addEventListener('keydown', handleFirstInteraction, { capture: true, passive: true });
            window.addEventListener('touchend', handleFirstInteraction, { capture: true, passive: true });
        };

        // Start playback immediately if permitted by browser policy; otherwise unlock cleanly on first gesture
        const tryPlay = audio.play();
        if (tryPlay && typeof tryPlay.catch === 'function') {
            tryPlay.catch(() => {
                attachUnlock();
            });
        }

        return () => {
            detachUnlock();
            if (fadeRafRef.current) cancelAnimationFrame(fadeRafRef.current);
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
            audio.pause();
            audio.src = '';
            audioRef.current = null;
        };
    }, []);

    const toggleMute = useCallback(() => {
        const audio = audioRef.current;
        const nextMuted = !mutedRef.current;
        mutedRef.current = nextMuted;
        setIsMuted(nextMuted);

        if (!audio) return nextMuted;

        if (nextMuted) {
            audio.muted = true;
            audio.pause();
        } else {
            audio.muted = false;
            audio.volume = duckRef.current ? DUCKED_VOLUME : BASE_VOLUME;
            audio.play().catch(() => {});
        }
        return nextMuted;
    }, []);

    const setDuck = useCallback(
        (ducked) => {
            const nextDuck = Boolean(ducked);
            if (duckRef.current === nextDuck) return;
            duckRef.current = nextDuck;
            if (!audioRef.current || mutedRef.current) return;
            rampVolumeTo(nextDuck ? DUCKED_VOLUME : BASE_VOLUME);
        },
        [rampVolumeTo]
    );

    return (
        <GlobalAudioContext.Provider value={{ isMuted, isPlaying, toggleMute, setDuck }}>
            {children}
        </GlobalAudioContext.Provider>
    );
};
