import React, { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

const ScrollProgress = () => {
    const { scrollYProgress } = useScroll();
    const [isVisible, setIsVisible] = useState(false);
    const [percent, setPercent] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > 100);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useMotionValueEvent(scrollYProgress, 'change', (v) => {
        setPercent(Math.round(v * 100));
    });

    return (
        <motion.div
            className="scroll-progress-indicator"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 20 }}
            transition={{ duration: 0.3 }}
            style={{
                position: 'fixed',
                top: '50%',
                right: '0.8rem',
                transform: 'translateY(-50%)',
                zIndex: 999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
            }}
        >
            <motion.div
                style={{
                    width: '2px',
                    height: '120px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '1px',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <motion.div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(180deg, var(--accent-primary), var(--accent-secondary))',
                        scaleY: scrollYProgress,
                        transformOrigin: 'top'
                    }}
                />
            </motion.div>

            <motion.span
                style={{
                    fontSize: '0.6rem',
                    color: 'var(--text-muted)',
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                    letterSpacing: '0.05em'
                }}
            >
                {percent}%
            </motion.span>
        </motion.div>
    );
};

export default ScrollProgress;