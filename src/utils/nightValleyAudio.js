// Generative Web Audio peaceful nocturnal glass-pad + gentle chime soundscape (default unmuted with auto-unlock).

export function createValleyAudioStore() {
    let ctx = null;
    let masterGain = null;
    let lowPass = null;
    let delaySend = null;
    let nodes = [];
    let chimeTimer = null;
    let isInitialized = false;
    let isMuted = false;
    let explicitlyMuted = false;
    let isMuffled = false;
    let unlockBound = false;
    let chimeStep = 0;

    // Gentle Gmaj9 / pentatonic wind-chime sequence (pure midrange, zero low-end rumble)
    const CHIME_NOTES = [587.33, 659.25, 783.99, 880.0, 987.77, 1174.66]; // D5, E5, G5, A5, B5, D6

    const createSoftAirBuffer = (audioCtx) => {
        const length = audioCtx.sampleRate * 4;
        const buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        let prev = 0;
        for (let i = 0; i < length; i++) {
            const white = Math.random() * 2 - 1;
            prev = prev * 0.96 + white * 0.04;
            data[i] = prev * 0.14;
        }
        return buffer;
    };

    const playSoftChime = (freq, peakGain = 0.045, duration = 4.2) => {
        if (!ctx || !lowPass || ctx.state !== 'running' || explicitlyMuted) return;
        try {
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const env = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            env.gain.setValueAtTime(0.0001, now);
            env.gain.linearRampToValueAtTime(peakGain, now + 0.14);
            env.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc.connect(env);
            env.connect(lowPass);
            if (delaySend) env.connect(delaySend);

            osc.start(now);
            osc.stop(now + duration + 0.1);
        } catch {
            // Ignore transient chime error on suspend/close
        }
    };

    const scheduleNextChime = () => {
        clearTimeout(chimeTimer);
        if (!ctx) return;
        const waitMs = 3400 + Math.random() * 2600;
        chimeTimer = setTimeout(() => {
            if (!ctx) return;
            if (!explicitlyMuted && ctx.state === 'running') {
                const idx = (chimeStep + Math.floor(Math.random() * 2)) % CHIME_NOTES.length;
                chimeStep += 1;
                playSoftChime(CHIME_NOTES[idx], 0.042, 4.4);
            }
            scheduleNextChime();
        }, waitMs);
    };

    const syncGainState = () => {
        if (!ctx || !masterGain) return;
        const active = !explicitlyMuted && ctx.state === 'running';
        isMuted = explicitlyMuted;
        const target = active ? 0.115 : 0.0001;
        masterGain.gain.cancelScheduledValues(ctx.currentTime);
        masterGain.gain.setTargetAtTime(target, ctx.currentTime, 0.55);
    };

    const handleFirstUnlockGesture = () => {
        if (explicitlyMuted || !ctx) return;
        if (ctx.state === 'suspended') {
            ctx.resume()
                .then(() => {
                    syncGainState();
                    playSoftChime(783.99, 0.038, 4.0);
                })
                .catch(() => {});
        } else {
            syncGainState();
        }
    };

    const attachAutoUnlock = () => {
        if (unlockBound || typeof window === 'undefined') return;
        unlockBound = true;
        window.addEventListener('pointerdown', handleFirstUnlockGesture, { passive: true, once: true });
        window.addEventListener('keydown', handleFirstUnlockGesture, { passive: true, once: true });
        window.addEventListener('wheel', handleFirstUnlockGesture, { passive: true, once: true });
        window.addEventListener('touchstart', handleFirstUnlockGesture, { passive: true, once: true });
    };

    const detachAutoUnlock = () => {
        if (!unlockBound || typeof window === 'undefined') return;
        unlockBound = false;
        window.removeEventListener('pointerdown', handleFirstUnlockGesture);
        window.removeEventListener('keydown', handleFirstUnlockGesture);
        window.removeEventListener('wheel', handleFirstUnlockGesture);
        window.removeEventListener('touchstart', handleFirstUnlockGesture);
    };

    const ensureAudioGraph = () => {
        if (ctx || typeof window === 'undefined') return isInitialized;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return false;

        try {
            ctx = new AudioCtx();

            lowPass = ctx.createBiquadFilter();
            lowPass.type = 'lowpass';
            lowPass.frequency.setValueAtTime(isMuffled ? 420 : 1250, ctx.currentTime);
            lowPass.Q.setValueAtTime(0.35, ctx.currentTime);

            masterGain = ctx.createGain();
            masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);

            lowPass.connect(masterGain);
            masterGain.connect(ctx.destination);

            // Warm dual-tap ambient shimmer echo for smooth, spacious decay
            delaySend = ctx.createGain();
            delaySend.gain.setValueAtTime(0.55, ctx.currentTime);
            const delayA = ctx.createDelay(2.0);
            delayA.delayTime.setValueAtTime(0.41, ctx.currentTime);
            const delayB = ctx.createDelay(2.0);
            delayB.delayTime.setValueAtTime(0.67, ctx.currentTime);
            const echoDamp = ctx.createBiquadFilter();
            echoDamp.type = 'lowpass';
            echoDamp.frequency.setValueAtTime(780, ctx.currentTime);
            const fbGain = ctx.createGain();
            fbGain.gain.setValueAtTime(0.32, ctx.currentTime);

            delaySend.connect(delayA);
            delayA.connect(delayB);
            delayB.connect(echoDamp);
            echoDamp.connect(fbGain);
            fbGain.connect(delayA);
            echoDamp.connect(lowPass);

            // Feather-soft silk night breeze bed (high-mid filtered, zero rumble)
            const airSrc = ctx.createBufferSource();
            airSrc.buffer = createSoftAirBuffer(ctx);
            airSrc.loop = true;
            const airBand = ctx.createBiquadFilter();
            airBand.type = 'bandpass';
            airBand.frequency.setValueAtTime(860, ctx.currentTime);
            airBand.Q.setValueAtTime(0.6, ctx.currentTime);
            const airGain = ctx.createGain();
            airGain.gain.setValueAtTime(0.035, ctx.currentTime);
            airSrc.connect(airBand);
            airBand.connect(airGain);
            airGain.connect(lowPass);
            airSrc.start();
            nodes.push(airSrc);

            // Pure sine warm Gmaj9 halo pad (no triangle/saw waves, no fast beating or LFO vibration)
            const padVoices = [
                { freq: 196.0, gain: 0.065 },  // G3 warm root cushion
                { freq: 293.66, gain: 0.055 }, // D4 fifth
                { freq: 392.0, gain: 0.045 },  // G4 octave
                { freq: 440.0, gain: 0.032 },  // A4 peaceful 9th
                { freq: 493.88, gain: 0.028 }, // B4 major 3rd glow
            ];
            padVoices.forEach(({ freq, gain }) => {
                const osc = ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime);

                const voiceGain = ctx.createGain();
                voiceGain.gain.setValueAtTime(gain, ctx.currentTime);

                osc.connect(voiceGain);
                voiceGain.connect(lowPass);
                osc.start();
                nodes.push(osc);
            });

            scheduleNextChime();
            isInitialized = true;
            return true;
        } catch {
            return false;
        }
    };

    return {
        get isInitialized() {
            return true;
        },
        get isMuted() {
            return isMuted;
        },
        initAudio() {
            ensureAudioGraph();
            if (!ctx) return;
            if (ctx.state === 'running' && !explicitlyMuted) {
                syncGainState();
                playSoftChime(783.99, 0.04, 4.2);
            } else {
                attachAutoUnlock();
            }
            isInitialized = true;
        },
        toggleMute() {
            if (!ctx) {
                ensureAudioGraph();
            }
            explicitlyMuted = !explicitlyMuted;
            isMuted = explicitlyMuted;
            if (!ctx || !masterGain) return isMuted;
            if (!explicitlyMuted && ctx.state === 'suspended') {
                ctx.resume()
                    .then(() => {
                        syncGainState();
                        playSoftChime(880.0, 0.038, 3.8);
                    })
                    .catch(() => {});
            } else {
                syncGainState();
            }
            return isMuted;
        },
        setHoverMuffle(active) {
            isMuffled = Boolean(active);
            if (!ctx || !lowPass) return;
            const targetFreq = isMuffled ? 420 : 1250;
            lowPass.frequency.cancelScheduledValues(ctx.currentTime);
            lowPass.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.3);
        },
        playWarpSweep() {
            if (explicitlyMuted) return;
            if (!ctx) ensureAudioGraph();
            if (!ctx || !lowPass || !masterGain) return;
            if (ctx.state === 'suspended') {
                ctx.resume().catch(() => {});
            }
            const now = ctx.currentTime;
            // Gentle crystalline shimmer swell during the black-hole glide (zero bass thump)
            lowPass.frequency.cancelScheduledValues(now);
            lowPass.frequency.setTargetAtTime(1850, now, 0.28);
            lowPass.frequency.setTargetAtTime(480, now + 0.9, 0.35);
            lowPass.frequency.setTargetAtTime(1250, now + 1.5, 0.45);

            [587.33, 880.0, 1174.66].forEach((freq, i) => {
                setTimeout(() => {
                    playSoftChime(freq, 0.045, 3.2);
                }, i * 160);
            });
        },
        dispose() {
            clearTimeout(chimeTimer);
            chimeTimer = null;
            detachAutoUnlock();
            nodes.forEach((n) => {
                try {
                    n.stop?.();
                    n.disconnect?.();
                } catch {
                    // Ignore already stopped audio nodes
                }
            });
            nodes = [];
            if (ctx) {
                ctx.close().catch(() => {});
                ctx = null;
            }
            masterGain = null;
            lowPass = null;
            delaySend = null;
            isInitialized = false;
        },
    };
}
