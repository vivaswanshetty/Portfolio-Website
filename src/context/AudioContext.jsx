import React, { useCallback, useEffect, useRef, useState } from 'react';
import ambientThemeUrl from '../assets/ambient_theme.mp3';
import { GlobalAudioContext } from './useGlobalAudio';

const BASE_VOLUME = 0.20;
const DUCKED_VOLUME = 0.08;

export const GlobalAudioProvider = ({ children }) => {
    const audioRef = useRef(null);
    const userMutedRef = useRef(false);
    const duckRef = useRef(false);
    const fadeRafRef = useRef(null);

    const [userMuted, setUserMuted] = useState(false);
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

        const syncPlaybackUI = () => {
            setIsPlaying(!audio.paused && !audio.muted);
        };
        audio.addEventListener('play', syncPlaybackUI);
        audio.addEventListener('pause', syncPlaybackUI);
        audio.addEventListener('volumechange', syncPlaybackUI);

        let unlockAttached = false;
        const UNLOCK_EVENTS = ['mousedown', 'mouseup', 'pointerup', 'touchend', 'click', 'keydown'];

        const detachUnlock = () => {
            if (!unlockAttached) return;
            unlockAttached = false;
            UNLOCK_EVENTS.forEach((evt) => {
                window.removeEventListener(evt, handleFirstInteraction, true);
            });
            window.removeEventListener('focus', attemptAutoplay);
        };

        function handleFirstInteraction(e) {
            const target = e?.target;
            // Let the sound toggle button handle its own click without capture-phase race
            if (target instanceof Element && target.closest('.navbar-audio-btn, #sound')) {
                return;
            }
            const el = audioRef.current;
            if (!el || userMutedRef.current) {
                detachUnlock();
                return;
            }
            el.muted = false;
            el.volume = duckRef.current ? DUCKED_VOLUME : BASE_VOLUME;
            const p = el.play();
            if (p && typeof p.then === 'function') {
                p.then(() => {
                    syncPlaybackUI();
                    detachUnlock();
                }).catch(() => {});
            } else {
                syncPlaybackUI();
                detachUnlock();
            }
        }

        function attemptAutoplay() {
            if (!audioRef.current || userMutedRef.current) return;
            audio.muted = false;
            audio.volume = duckRef.current ? DUCKED_VOLUME : BASE_VOLUME;
            const tryPlay = audio.play();
            if (tryPlay && typeof tryPlay.then === 'function') {
                tryPlay
                    .then(() => {
                        syncPlaybackUI();
                        detachUnlock();
                    })
                    .catch(() => {
                        // Browser blocked unmuted autoplay on cold load: wait cleanly for first activation
                        syncPlaybackUI();
                        attachUnlock();
                    });
            }
        }

        function attachUnlock() {
            if (unlockAttached) return;
            unlockAttached = true;
            UNLOCK_EVENTS.forEach((evt) => {
                window.addEventListener(evt, handleFirstInteraction, { capture: true, passive: true });
            });
            window.addEventListener('focus', attemptAutoplay, { passive: true });
        }

        // Attach unlock immediately AND attempt immediate autoplay on load + when buffer finishes decoding
        attachUnlock();
        attemptAutoplay();
        audio.addEventListener('canplaythrough', attemptAutoplay, { once: true });

        return () => {
            detachUnlock();
            if (fadeRafRef.current) cancelAnimationFrame(fadeRafRef.current);
            audio.removeEventListener('canplaythrough', attemptAutoplay);
            audio.removeEventListener('play', syncPlaybackUI);
            audio.removeEventListener('pause', syncPlaybackUI);
            audio.removeEventListener('volumechange', syncPlaybackUI);
            audio.pause();
            audio.src = '';
            audioRef.current = null;
        };
    }, []);

    const toggleMute = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) {
            const next = !userMutedRef.current;
            userMutedRef.current = next;
            setUserMuted(next);
            return next;
        }

        // If browser blocked initial autoplay (paused or muted), first click starts playback instead of muting
        if (audio.paused || audio.muted) {
            userMutedRef.current = false;
            setUserMuted(false);
            audio.muted = false;
            audio.volume = duckRef.current ? DUCKED_VOLUME : BASE_VOLUME;
            audio
                .play()
                .then(() => setIsPlaying(true))
                .catch(() => {});
            return false;
        }

        // Otherwise toggle cleanly to muted/paused
        userMutedRef.current = true;
        setUserMuted(true);
        audio.muted = true;
        audio.pause();
        setIsPlaying(false);
        return true;
    }, []);

    const setDuck = useCallback(
        (ducked) => {
            const nextDuck = Boolean(ducked);
            if (duckRef.current === nextDuck) return;
            duckRef.current = nextDuck;
            if (!audioRef.current || userMutedRef.current || audioRef.current.paused) return;
            rampVolumeTo(nextDuck ? DUCKED_VOLUME : BASE_VOLUME);
        },
        [rampVolumeTo]
    );

    // Keep speaker indicator visibly ON initially (only showing muted when visitor clicks mute)
    return (
        <GlobalAudioContext.Provider value={{ isMuted: userMuted, isPlaying, toggleMute, setDuck }}>
            {children}
        </GlobalAudioContext.Provider>
    );
};
