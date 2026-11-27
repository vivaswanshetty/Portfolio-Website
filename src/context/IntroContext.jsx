import React, { useState, useCallback, useEffect } from 'react';
import { IntroContext } from './useIntro';

function prefersReducedMotion() {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const IntroProvider = ({ children }) => {
    const isInitialHomeEntry =
        typeof window !== 'undefined' &&
        window.location.pathname === '/' &&
        !prefersReducedMotion();

    // 'pending' (loading assets on Home), 'playing' (7.4s clock running), 'done' (live 3D / subroutes)
    const [introState, setIntroState] = useState(isInitialHomeEntry ? 'pending' : 'done');
    const [navVisible, setNavVisible] = useState(!isInitialHomeEntry);
    const [replayCount, setReplayCount] = useState(0);

    const ensureDoneForSubroute = useCallback(() => {
        setIntroState('done');
        setNavVisible(true);
    }, []);

    const startPlaying = useCallback(() => {
        setIntroState((prev) => (prev === 'done' ? 'done' : 'playing'));
    }, []);

    const revealNav = useCallback(() => {
        setNavVisible(true);
    }, []);

    const completeIntro = useCallback(() => {
        setNavVisible(true);
        setIntroState('done');
    }, []);

    const skipIntro = useCallback(() => {
        setNavVisible(true);
        setIntroState('done');
    }, []);

    const replayIntro = useCallback(() => {
        if (prefersReducedMotion()) {
            setNavVisible(true);
            setIntroState('done');
            return;
        }
        window.scrollTo({ top: 0, behavior: 'instant' });
        setNavVisible(false);
        setIntroState('pending');
        setReplayCount((c) => c + 1);
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        const onChange = (e) => {
            if (e.matches) {
                setNavVisible(true);
                setIntroState('done');
            }
        };
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    return (
        <IntroContext.Provider
            value={{
                introState,
                navVisible,
                replayCount,
                isIntroActive: introState !== 'done',
                startPlaying,
                revealNav,
                completeIntro,
                skipIntro,
                replayIntro,
                ensureDoneForSubroute,
            }}
        >
            {children}
        </IntroContext.Provider>
    );
};
