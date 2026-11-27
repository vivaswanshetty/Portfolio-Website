import React, { useEffect, useRef } from 'react';

/**
 * Zero-re-render smoothed cursor aura (crimson-ember atmospheric lamp on fine pointers).
 */
export const SpotlightCursor = () => {
    const lampRef = useRef(null);

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;
        if (window.matchMedia?.('(pointer: coarse)')?.matches) return undefined;
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return undefined;

        let targetX = -800;
        let targetY = -800;
        let curX = -800;
        let curY = -800;
        let visible = false;
        let lastTime = performance.now();
        let rafId = null;

        const onPointerMove = (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
            if (!visible) {
                curX = targetX;
                curY = targetY;
                visible = true;
                if (lampRef.current) lampRef.current.style.opacity = '1';
            }
        };

        const onMouseLeave = () => {
            visible = false;
            if (lampRef.current) lampRef.current.style.opacity = '0';
        };

        const tick = (now) => {
            const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
            lastTime = now;

            if (visible && lampRef.current) {
                const k = 1 - Math.exp(-10 * dt);
                curX += (targetX - curX) * k;
                curY += (targetY - curY) * k;
                lampRef.current.style.transform = `translate3d(${(curX - 270).toFixed(1)}px, ${(curY - 270).toFixed(1)}px, 0)`;
            }

            rafId = requestAnimationFrame(tick);
        };

        window.addEventListener('pointermove', onPointerMove, { passive: true });
        document.addEventListener('mouseleave', onMouseLeave, { passive: true });
        rafId = requestAnimationFrame(tick);

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            window.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('mouseleave', onMouseLeave);
        };
    }, []);

    return <div ref={lampRef} className="kinetic-cursor-lamp" aria-hidden="true" />;
};

export default SpotlightCursor;
