// Generative Web Audio night wind + harmonic ambient store (default unmuted with auto-unlock fallback + warp sweep).

export function createValleyAudioStore() {
    let ctx = null;
    let masterGain = null;
    let lowPass = null;
    let nodes = [];
    let isInitialized = false;
    let isMuted = false;
    let explicitlyMuted = false;
    let isMuffled = false;
    let unlockBound = false;

    const createNoiseBuffer = (audioCtx) => {
        const length = audioCtx.sampleRate * 4;
        const buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0;
        let b1 = 0;
        let b2 = 0;
        for (let i = 0; i < length; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99765 * b0 + white * 0.099046;
            b1 = 0.963 * b1 + white * 0.2965164;
            b2 = 0.57 * b2 + white * 1.0526913;
            data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.08;
        }
        return buffer;
    };

    const syncGainState = () => {
        if (!ctx || !masterGain) return;
        const active = !explicitlyMuted && ctx.state === 'running';
        isMuted = explicitlyMuted;
        const target = active ? 0.15 : 0.0001;
        masterGain.gain.cancelScheduledValues(ctx.currentTime);
        masterGain.gain.setTargetAtTime(target, ctx.currentTime, 0.25);
    };

    const handleFirstUnlockGesture = () => {
        if (explicitlyMuted || !ctx) return;
        if (ctx.state === 'suspended') {
            ctx.resume().then(syncGainState).catch(() => {});
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
            lowPass.frequency.setValueAtTime(isMuffled ? 260 : 2200, ctx.currentTime);
            lowPass.Q.setValueAtTime(0.85, ctx.currentTime);

            masterGain = ctx.createGain();
            masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);

            lowPass.connect(masterGain);
            masterGain.connect(ctx.destination);

            // Night canyon wind bed (warm filtered noise loop)
            const noiseSrc = ctx.createBufferSource();
            noiseSrc.buffer = createNoiseBuffer(ctx);
            noiseSrc.loop = true;
            const noiseBand = ctx.createBiquadFilter();
            noiseBand.type = 'bandpass';
            noiseBand.frequency.setValueAtTime(340, ctx.currentTime);
            noiseBand.Q.setValueAtTime(0.9, ctx.currentTime);
            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.28, ctx.currentTime);
            noiseSrc.connect(noiseBand);
            noiseBand.connect(noiseGain);
            noiseGain.connect(lowPass);
            noiseSrc.start();
            nodes.push(noiseSrc);

            // Warm nocturnal harmonic drone (A2, E3, B3, F#4)
            const freqs = [110, 164.81, 246.94, 369.99];
            freqs.forEach((f, idx) => {
                const osc = ctx.createOscillator();
                osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
                osc.frequency.setValueAtTime(f, ctx.currentTime);
                osc.detune.setValueAtTime((idx - 1.5) * 4.5, ctx.currentTime);

                const voiceGain = ctx.createGain();
                voiceGain.gain.setValueAtTime(idx === 0 ? 0.16 : 0.075, ctx.currentTime);

                const lfo = ctx.createOscillator();
                lfo.frequency.setValueAtTime(0.08 + idx * 0.035, ctx.currentTime);
                const lfoGain = ctx.createGain();
                lfoGain.gain.setValueAtTime(0.025, ctx.currentTime);
                lfo.connect(lfoGain);
                lfoGain.connect(voiceGain.gain);

                osc.connect(voiceGain);
                voiceGain.connect(lowPass);
                osc.start();
                lfo.start();
                nodes.push(osc, lfo);
            });

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
                ctx.resume().then(syncGainState).catch(() => {});
            } else {
                syncGainState();
            }
            return isMuted;
        },
        setHoverMuffle(active) {
            isMuffled = Boolean(active);
            if (!ctx || !lowPass) return;
            const targetFreq = isMuffled ? 240 : 2200;
            lowPass.frequency.cancelScheduledValues(ctx.currentTime);
            lowPass.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.22);
        },
        playWarpSweep() {
            if (explicitlyMuted) return;
            if (!ctx) ensureAudioGraph();
            if (!ctx || !lowPass || !masterGain) return;
            if (ctx.state === 'suspended') {
                ctx.resume().catch(() => {});
            }
            const now = ctx.currentTime;
            // Sub-bass gravitational dive sweep + lowpass vortex pull
            lowPass.frequency.cancelScheduledValues(now);
            lowPass.frequency.setTargetAtTime(4200, now, 0.2);
            lowPass.frequency.setTargetAtTime(220, now + 0.85, 0.3);
            lowPass.frequency.setTargetAtTime(2200, now + 1.5, 0.35);

            try {
                const sub = ctx.createOscillator();
                const subGain = ctx.createGain();
                sub.type = 'sine';
                sub.frequency.setValueAtTime(125, now);
                sub.frequency.exponentialRampToValueAtTime(34, now + 1.15);
                subGain.gain.setValueAtTime(0.001, now);
                subGain.gain.linearRampToValueAtTime(0.22, now + 0.25);
                subGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.35);
                sub.connect(subGain);
                subGain.connect(masterGain);
                sub.start(now);
                sub.stop(now + 1.4);
            } catch {
                // Ignore if context cannot schedule transient sub
            }
        },
        dispose() {
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
            isInitialized = false;
        },
    };
}
