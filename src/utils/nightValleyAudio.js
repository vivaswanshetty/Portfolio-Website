// Generative Web Audio night wind + harmonic ambient store with low-pass muffle hover transition.

export function createValleyAudioStore() {
    let ctx = null;
    let masterGain = null;
    let lowPass = null;
    let nodes = [];
    let isInitialized = false;
    let isMuted = true;
    let isMuffled = false;

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

            // Warm nocturnal harmonic drone (A2, E3, B3, F#4 soft detuned voices)
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
            // Keeps startup lazy-safe until user gesture toggles audio on
            isInitialized = true;
        },
        toggleMute() {
            if (!ctx) {
                ensureAudioGraph();
            }
            if (!ctx || !masterGain) return isMuted;
            if (ctx.state === 'suspended') {
                ctx.resume().catch(() => {});
            }
            isMuted = !isMuted;
            const target = isMuted ? 0.0001 : 0.15;
            masterGain.gain.cancelScheduledValues(ctx.currentTime);
            masterGain.gain.setTargetAtTime(target, ctx.currentTime, 0.24);
            return isMuted;
        },
        setHoverMuffle(active) {
            isMuffled = Boolean(active);
            if (!ctx || !lowPass) return;
            const targetFreq = isMuffled ? 240 : 2200;
            lowPass.frequency.cancelScheduledValues(ctx.currentTime);
            lowPass.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.22);
        },
        dispose() {
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
