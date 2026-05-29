import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { portfolioData } from '../data/portfolioData';
import portraitImg from '../assets/vivaswan_portrait.jpg';
import { useTiltEffect } from '../hooks/useScrollReveal';

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

const StatCard = ({ stat }) => {
    const tilt = useTiltEffect(10);
    return (
        <Link to={stat.link} style={{ textDecoration: 'none' }}>
            <div
                ref={tilt.ref}
                className="card"
                style={{ 
                    textAlign: 'center', 
                    padding: '2rem', 
                    cursor: 'pointer',
                    ...tilt.style 
                }}
                {...tilt.handlers}
            >
                <h4 style={{
                    fontSize: '2.5rem',
                    color: 'var(--accent-primary)',
                    marginBottom: '0.5rem',
                    fontWeight: 800,
                    letterSpacing: '-0.02em'
                }}>
                    <AnimatedCounter value={stat.value} />
                </h4>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{stat.label}</span>
            </div>
        </Link>
    );
};

const About = () => {
    const { title, description, highlights, stats } = portfolioData.about;
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });
    const portraitTilt = useTiltEffect(10);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start']
    });

    const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
    const y2 = useTransform(scrollYProgress, [0, 1], [50, -50]);
    const opacity = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0, 1, 1, 0]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
        }
    };

    return (
        <div className="page-container" ref={ref}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                style={{
                    textAlign: 'center',
                    marginBottom: '5rem',
                    position: 'relative'
                }}
            >
                <motion.span
                    style={{
                        display: 'inline-block',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.25em',
                        color: 'var(--accent-primary)',
                        marginBottom: '1rem',
                        fontWeight: 600
                    }}
                >
                    About Me
                </motion.span>
                <h1 style={{ marginBottom: 0 }}>{title}</h1>

                <motion.div
                    style={{
                        position: 'absolute',
                        top: '-100px',
                        left: '50%',
                        width: '400px',
                        height: '400px',
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%)',
                        filter: 'blur(60px)',
                        transform: 'translateX(-50%)',
                        y: y1
                    }}
                />
            </motion.div>

            <motion.div
                className="grid grid-3"
                style={{ alignItems: 'center', gap: '3rem' }}
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
            >
                <motion.div
                    variants={itemVariants}
                    style={{
                        position: 'relative',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%'
                    }}
                >
                    <motion.div
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
                            filter: 'blur(30px)',
                            zIndex: 1,
                            pointerEvents: 'none'
                        }}
                    />
                    <div
                        ref={portraitTilt.ref}
                        style={{
                            position: 'relative',
                            zIndex: 2,
                            width: '100%',
                            maxWidth: '300px',
                            borderRadius: '1.5rem',
                            padding: '0.4rem',
                            background: 'rgba(30, 41, 59, 0.25)',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                            overflow: 'hidden',
                            ...portraitTilt.style
                        }}
                        {...portraitTilt.handlers}
                    >
                        <img
                            src={portraitImg}
                            alt="Vivaswan Shetty"
                            style={{
                                width: '100%',
                                height: 'auto',
                                borderRadius: '1.1rem',
                                display: 'block',
                                objectFit: 'cover'
                            }}
                        />
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} style={{ position: 'relative' }}>
                    <motion.div
                        style={{
                            position: 'absolute',
                            top: '20%',
                            left: '-20%',
                            width: '200px',
                            height: '200px',
                            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
                            filter: 'blur(40px)',
                            y: y2
                        }}
                    />

                    <span style={{
                        display: 'inline-block',
                        fontSize: '0.85rem',
                        color: 'var(--accent-primary)',
                        marginBottom: '1rem',
                        fontWeight: 500
                    }}>
                        Who I Am
                    </span>
                    <p style={{ marginBottom: '2rem', lineHeight: 1.9, fontSize: '1.05rem' }}>{description}</p>

                    <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                        {highlights.map((item, idx) => (
                            <motion.span
                                key={idx}
                                style={{
                                    padding: '0.6rem 1.2rem',
                                    background: 'rgba(59, 130, 246, 0.08)',
                                    border: '1px solid rgba(59, 130, 246, 0.15)',
                                    borderRadius: '9999px',
                                    fontSize: '0.85rem',
                                    color: 'var(--accent-primary)'
                                }}
                                whileHover={{
                                    scale: 1.05,
                                    background: 'rgba(59, 130, 246, 0.15)',
                                    borderColor: 'var(--accent-primary)'
                                }}
                            >
                                {item}
                            </motion.span>
                        ))}
                    </div>

                    <motion.div
                        style={{
                            position: 'absolute',
                            bottom: '-50px',
                            right: '-30px',
                            width: '150px',
                            height: '1px',
                            background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.2), transparent)'
                        }}
                    />
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '1.2rem',
                        position: 'relative'
                    }}
                >
                    <motion.div
                        style={{
                            position: 'absolute',
                            top: '-30%',
                            right: '-10%',
                            width: '200px',
                            height: '200px',
                            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
                            filter: 'blur(50px)',
                            y: y1
                        }}
                    />

                    {stats && stats.map((stat, idx) => (
                        <StatCard key={idx} stat={stat} />
                    ))}
                </motion.div>
            </motion.div>

            <motion.div
                style={{
                    marginTop: '4rem',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '3rem',
                    opacity
                }}
            >
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        style={{
                            width: '4px',
                            height: `${20 + i * 10}px`,
                            background: 'linear-gradient(180deg, var(--accent-primary), transparent)',
                            borderRadius: '2px'
                        }}
                        animate={{
                            scaleY: [1, 1.3, 1],
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.2
                        }}
                    />
                ))}
            </motion.div>
        </div>
    );
};

export default About;