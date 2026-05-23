import { useState, useEffect, useRef } from 'react';

export const useParallax = (speed = 0.3) => {
    const [offset, setOffset] = useState(0);
    const [isScrolling, setIsScrolling] = useState(false);
    const lastScrollY = useRef(0);
    const rafId = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (rafId.current) return;

            rafId.current = requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                setOffset(scrollY * speed);

                if (Math.abs(scrollY - lastScrollY.current) > 1) {
                    setIsScrolling(true);
                    clearTimeout(window.scrollTimeout);
                    window.scrollTimeout = setTimeout(() => setIsScrolling(false), 150);
                }

                lastScrollY.current = scrollY;
                rafId.current = null;
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, [speed]);

    return { offset, isScrolling };
};

export const useScrollProgress = () => {
    const [progress, setProgress] = useState(0);
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const currentProgress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
            setProgress(Math.min(100, Math.max(0, currentProgress)));
            setScrollY(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return { progress, scrollY };
};

export const useMousePosition = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isMoving, setIsMoving] = useState(false);

    useEffect(() => {
        let timeoutId;

        const handleMouseMove = (e) => {
            setPosition({ x: e.clientX, y: e.clientY });
            setIsMoving(true);

            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => setIsMoving(false), 100);
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(timeoutId);
        };
    }, []);

    return { ...position, isMoving };
};

export const useTiltEffect = (maxTilt = 5) => {
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const elementRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!elementRef.current) return;

        const rect = elementRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const rotateX = (e.clientY - centerY) / (rect.height / 2) * -maxTilt;
        const rotateY = (e.clientX - centerX) / (rect.width / 2) * maxTilt;

        setTilt({ x: rotateX, y: rotateY });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => {
        setIsHovering(false);
        setTilt({ x: 0, y: 0 });
    };

    return {
        ref: elementRef,
        tilt,
        isHovering,
        handlers: {
            onMouseMove: handleMouseMove,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave
        },
        style: {
            transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovering ? 1.02 : 1})`,
            transition: isHovering ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out'
        }
    };
};