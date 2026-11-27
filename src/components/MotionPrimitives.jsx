import React, { useEffect, useMemo, useRef } from 'react';
import { motion as Motion, useInView, useScroll, useTransform } from 'framer-motion';

/**
 * Masked upward text reveal (Hollowmere line-reveal technique).
 */
export const LineReveal = ({ children, delay = 0, className = '', as = 'div' }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-12% 0px' });

    const inner = (
        <Motion.span
            className="kinetic-line-inner"
            initial={{ y: '105%' }}
            animate={isInView ? { y: '0%' } : { y: '105%' }}
            transition={{ duration: 0.9, delay, ease: [0.2, 0.8, 0.2, 1] }}
        >
            {children}
        </Motion.span>
    );

    const cls = `kinetic-line-mask ${className}`;
    if (as === 'h1') return <h1 ref={ref} className={cls}>{inner}</h1>;
    if (as === 'h2') return <h2 ref={ref} className={cls}>{inner}</h2>;
    return <div ref={ref} className={cls}>{inner}</div>;
};

/**
 * Animated horizontal dividing rule drawing from left to right when entering viewport.
 */
export const RuleDraw = ({ delay = 0.14, className = '', center = false }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-12% 0px' });

    return (
        <Motion.div
            ref={ref}
            className={`kinetic-rule-draw ${className}`}
            style={{ transformOrigin: center ? 'center' : 'left center' }}
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 1.0, delay, ease: [0.2, 0.8, 0.2, 1] }}
        />
    );
};

/**
 * Character-by-character scroll-scrubbed reveal paragraph (0.2 -> 1.0 opacity).
 */
const ScrollChar = ({ char, progress, range }) => {
    const opacity = useTransform(progress, range, [0.18, 1]);
    return (
        <span className="kinetic-char-wrap">
            <span className="kinetic-char-ghost" aria-hidden="true">
                {char}
            </span>
            <Motion.span style={{ opacity }} className="kinetic-char-live">
                {char}
            </Motion.span>
        </span>
    );
};

function buildWordEntries(text) {
    const splitWords = text.split(' ');
    const entries = [];
    let offset = 0;
    for (let i = 0; i < splitWords.length; i++) {
        const word = splitWords[i];
        entries.push({ word, startIdx: offset });
        offset += word.length + 1;
    }
    return entries;
}

export const CharScrollText = ({ text, className = '' }) => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start 0.85', 'end 0.35'],
    });

    const wordEntries = useMemo(() => buildWordEntries(text), [text]);
    const totalChars = text.length || 1;

    return (
        <p ref={containerRef} className={`kinetic-scroll-paragraph ${className}`}>
            {wordEntries.map(({ word, startIdx }, wIdx) => (
                <span key={`${wIdx}-${word}`} className="kinetic-scroll-word">
                    {word.split('').map((ch, cIdx) => {
                        const idx = startIdx + cIdx;
                        const start = idx / totalChars;
                        const end = Math.min(1, start + 1 / totalChars + 0.04);
                        return (
                            <ScrollChar
                                key={`${idx}-${ch}`}
                                char={ch}
                                progress={scrollYProgress}
                                range={[start, end]}
                            />
                        );
                    })}
                    {wIdx < wordEntries.length - 1 ? '\u00A0' : ''}
                </span>
            ))}
        </p>
    );
};

/**
 * Cursor-proximity magnetic attraction wrapper on fine pointers.
 */
export const MagnetContainer = ({ children, strength = 4, className = '' }) => {
    const ref = useRef(null);

    const handleMove = (e) => {
        const el = ref.current;
        if (!el || window.matchMedia?.('(pointer: coarse)')?.matches) return;
        const rect = el.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        el.style.transition = 'transform 0.25s ease-out';
        el.style.transform = `translate3d(${(dx / strength).toFixed(1)}px, ${(dy / strength).toFixed(1)}px, 0)`;
    };

    const handleLeave = () => {
        const el = ref.current;
        if (!el) return;
        el.style.transition = 'transform 0.55s cubic-bezier(0.2, 0.8, 0.2, 1)';
        el.style.transform = 'translate3d(0, 0, 0)';
    };

    return (
        <div
            ref={ref}
            className={`kinetic-magnet ${className}`}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
        >
            {children}
        </div>
    );
};

/**
 * Canvas light-stream cascade + floating spray motes (inspired by Hollowmere's continuous falls).
 * Only animates when visible in the viewport and pauses under prefers-reduced-motion.
 */
export const EmberFallCanvas = ({ tone = 'crimson', widthPx = 110, heightPx = 220, speed = 1 }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || typeof window === 'undefined') return undefined;

        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.round(widthPx * dpr);
        canvas.height = Math.round(heightPx * dpr);

        const ctx = canvas.getContext('2d');
        if (!ctx) return undefined;

        // Pre-render 2 streak sprites cleanly offscreen
        const makeStreak = (primary, secondary) => {
            const off = document.createElement('canvas');
            off.width = 8;
            off.height = 140;
            const octx = off.getContext('2d');
            if (!octx) return off;
            const grad = octx.createLinearGradient(0, 0, 0, 140);
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(0.38, primary);
            grad.addColorStop(0.75, secondary);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            octx.fillStyle = grad;
            octx.fillRect(0, 0, 8, 140);
            return off;
        };

        const spriteA =
            tone === 'cyan'
                ? makeStreak('rgba(165, 243, 252, 0.92)', 'rgba(56, 189, 248, 0.35)')
                : makeStreak('rgba(254, 226, 226, 0.95)', 'rgba(239, 68, 68, 0.45)');
        const spriteB =
            tone === 'cyan'
                ? makeStreak('rgba(56, 189, 248, 0.72)', 'rgba(34, 211, 238, 0.2)')
                : makeStreak('rgba(239, 68, 68, 0.78)', 'rgba(159, 18, 57, 0.25)');

        const streakCount = Math.max(24, Math.round(widthPx / 2.2));
        const streaks = Array.from({ length: streakCount }, (_, i) => ({
            x: (0.14 + (((i * 73) % 100) / 100) * 0.72) * canvas.width,
            w: (1 + ((i * 19) % 24) / 10) * dpr,
            len: (45 + ((i * 37) % 145)) * dpr,
            v: (240 + ((i * 41) % 260)) * dpr * speed,
            phase: ((i * 59) % 300) * dpr,
            alpha: 0.22 + ((i * 29) % 50) / 100,
            sprite: i % 2 === 0 ? spriteA : spriteB,
        }));

        let visible = true;
        const observer = new IntersectionObserver(
            ([entry]) => {
                visible = entry.isIntersecting;
            },
            { rootMargin: '80px' }
        );
        observer.observe(canvas);

        let rafId = null;
        const start = performance.now();

        const draw = (now) => {
            const t = reduced ? 0 : (now - start) / 1000;
            if (visible && !document.hidden) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Base glowing core column gradient
                const bg = ctx.createLinearGradient(0, 0, canvas.width, 0);
                bg.addColorStop(0, 'rgba(0,0,0,0)');
                bg.addColorStop(
                    0.5,
                    tone === 'cyan' ? 'rgba(56, 189, 248, 0.14)' : 'rgba(239, 68, 68, 0.16)'
                );
                bg.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.globalCompositeOperation = 'source-over';
                ctx.fillStyle = bg;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.globalCompositeOperation = 'lighter';
                const h = canvas.height;
                for (let i = 0; i < streaks.length; i++) {
                    const s = streaks[i];
                    const span = h + s.len;
                    const y = ((t * s.v + s.phase) % span) - s.len;
                    ctx.globalAlpha = s.alpha;
                    ctx.drawImage(s.sprite, s.x, y, s.w, s.len);
                    ctx.drawImage(s.sprite, s.x, y - span, s.w, s.len);
                }
                ctx.globalAlpha = 1;
            }
            if (!reduced) {
                rafId = requestAnimationFrame(draw);
            }
        };

        draw(start);
        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            observer.disconnect();
        };
    }, [tone, widthPx, heightPx, speed]);

    return (
        <canvas
            ref={canvasRef}
            className="kinetic-ember-fall"
            style={{ width: `${widthPx}px`, height: `${heightPx}px` }}
            aria-hidden="true"
        />
    );
};

/**
 * Angular shard-cut geological seam bridging two home/subpage sections cleanly,
 * with a central continuous light-stream cascade pouring through the notch.
 */
export const KineticSeamDivider = ({ tone = 'crimson', label = '' }) => {
    return (
        <div className="kinetic-seam-wrap" aria-hidden="true">
            <svg
                className="kinetic-seam-shards"
                viewBox="0 0 1440 140"
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient id={`seamEdge-${tone}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="rgba(239, 68, 68, 0)" />
                        <stop offset="32%" stopColor={tone === 'cyan' ? 'rgba(56,189,248,0.45)' : 'rgba(239,68,68,0.5)'} />
                        <stop offset="50%" stopColor="rgba(248, 250, 252, 0.85)" />
                        <stop offset="68%" stopColor={tone === 'cyan' ? 'rgba(56,189,248,0.45)' : 'rgba(239,68,68,0.5)'} />
                        <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
                    </linearGradient>
                </defs>
                <path
                    d="M0,26 L210,58 L385,34 L540,72 L676,42 L720,84 L764,42 L910,70 L1085,36 L1260,64 L1440,28 L1440,140 L0,140 Z"
                    fill="#060709"
                />
                <path
                    d="M0,26 L210,58 L385,34 L540,72 L676,42 L720,84 L764,42 L910,70 L1085,36 L1260,64 L1440,28"
                    fill="none"
                    stroke={`url(#seamEdge-${tone})`}
                    strokeWidth="1.5"
                />
            </svg>
            <div className="kinetic-seam-cascade">
                <EmberFallCanvas tone={tone} widthPx={84} heightPx={160} speed={1.05} />
            </div>
            {label && <span className="kinetic-seam-tag">{label}</span>}
        </div>
    );
};
