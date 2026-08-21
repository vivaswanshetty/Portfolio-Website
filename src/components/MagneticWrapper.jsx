import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

const MagneticWrapper = ({ 
    children, 
    distance = 0.28, 
    maxDisplacement = 12, 
    className = '',
    style = {} 
}) => {
    const ref = useRef(null);
    const shouldReduceMotion = useReducedMotion();

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 16, stiffness: 220, mass: 0.1 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    if (shouldReduceMotion) {
        return (
            <div className={className} style={{ display: 'inline-block', ...style }}>
                {children}
            </div>
        );
    }

    const handleMouseMove = (e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) * distance;
        const deltaY = (e.clientY - centerY) * distance;

        const clampedX = Math.max(Math.min(deltaX, maxDisplacement), -maxDisplacement);
        const clampedY = Math.max(Math.min(deltaY, maxDisplacement), -maxDisplacement);

        mouseX.set(clampedX);
        mouseY.set(clampedY);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                x: springX,
                y: springY,
                display: 'inline-block',
                ...style
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default MagneticWrapper;
