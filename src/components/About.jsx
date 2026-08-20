import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { portfolioData } from '../data/portfolioData';
import portraitImg from '../assets/vivaswan_portrait.jpg';

const AnimatedCounter = ({ value, duration = 2000 }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    useEffect(() => {
        if (!isInView) return;

        const numericValue = parseInt(value.replace(/\D/g, '')) || 0;
        const startTime = Date.now();

        const updateCount = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(eased * numericValue));

            if (progress < 1) {
                requestAnimationFrame(updateCount);
            }
        };

        requestAnimationFrame(updateCount);
    }, [isInView, value, duration]);

    const suffix = value.replace(/[\d]/g, '');

    return <span ref={ref}>{count}{suffix}</span>;
};

const StatCard = ({ stat, index }) => {
    return (
        <div className="editorial-stat-card">
            <h4 className="editorial-stat-number">
                <AnimatedCounter value={stat.value} />
            </h4>
            <span className="editorial-stat-label">
                0{index + 1} / {stat.label}
            </span>
        </div>
    );
};

const About = () => {
    const { title, description, highlights, stats } = portfolioData.about;
    const ref = useRef(null);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.12 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
        }
    };

    return (
        <div className="editorial-page-container" ref={ref}>
            {/* Opening Editorial Header */}
            <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="editorial-page-header"
            >
                <div className="editorial-eyebrow-container" style={{ marginBottom: '0.8rem' }}>
                    <span className="editorial-eyebrow-text">
                        ABOUT & PHILOSOPHY.
                    </span>
                </div>
                <h1 className="editorial-page-title">
                    ABOUT <span style={{ color: '#ef4444' }}>ME</span>.
                </h1>
            </motion.div>

            {/* Main Editorial 3-Column Split: Portrait | Bio | Key Metrics */}
            <motion.div
                className="editorial-split-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Column 1: Sharp Editorial Portrait Frame */}
                <motion.div variants={itemVariants}>
                    <div className="editorial-portrait-frame">
                        <img
                            src={portraitImg}
                            alt="Vivaswan Shetty"
                            className="editorial-portrait-img"
                        />
                    </div>
                </motion.div>

                {/* Column 2: Typographic Bio & Editorial Highlight Badges */}
                <motion.div variants={itemVariants}>
                    <div style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                        paddingBottom: '1.25rem',
                        marginBottom: '1.75rem'
                    }}>
                        <span className="editorial-eyebrow-text" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            WHO I AM
                        </span>
                    </div>

                    <p style={{
                        fontSize: '1.05rem',
                        lineHeight: 1.85,
                        color: 'var(--text-main)',
                        marginBottom: '2.5rem',
                        fontFamily: 'var(--font-body)'
                    }}>
                        {description}
                    </p>

                    <div style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                        paddingBottom: '0.75rem',
                        marginBottom: '1.25rem'
                    }}>
                        <span className="editorial-eyebrow-text" style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                            CORE COMPETENCIES
                        </span>
                    </div>

                    <div className="editorial-badge-group">
                        {highlights.map((item, idx) => (
                            <span key={idx} className="editorial-badge">
                                {item}
                            </span>
                        ))}
                    </div>
                </motion.div>

                {/* Column 3: High-Contrast Editorial Stats Grid */}
                <motion.div variants={itemVariants}>
                    <div style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                        paddingBottom: '1.25rem',
                        marginBottom: '1.75rem'
                    }}>
                        <span className="editorial-eyebrow-text" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            METRICS & IMPACT
                        </span>
                    </div>

                    <div className="editorial-stat-grid">
                        {stats && stats.map((stat, idx) => (
                            <StatCard key={idx} stat={stat} index={idx} />
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default About;