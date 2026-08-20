import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { portfolioData } from '../data/portfolioData';
import { Mail, Linkedin, Github, Send, Instagram } from 'lucide-react';

const XIcon = ({ size = 15, color = 'currentColor' }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={color} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
);

const Contact = () => {
    const { email, linkedin, github, instagram, x } = portfolioData.contact;
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start start', 'end start']
    });

    const y1 = useTransform(scrollYProgress, [0, 1], [0, -60]);

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
                <motion.div style={{ y: y1 }}>
                    <div className="editorial-eyebrow-container" style={{ marginBottom: '0.8rem' }}>
                        <span className="editorial-eyebrow-text">
                            COMMUNICATIONS & INQUIRIES.
                        </span>
                        <div className="editorial-eyebrow-rule" />
                    </div>
                    <h1 className="editorial-page-title">
                        INITIATE DIALOGUE & <span style={{ color: '#ef4444' }}>COLLABORATE</span>.
                    </h1>
                    <p style={{ maxWidth: '600px', color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>
                        Open for technical leadership, production engineering collaborations, and high-impact systems development.
                    </p>
                </motion.div>
            </motion.div>

            {/* 2-Column Editorial Grid */}
            <motion.div
                style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', 
                    alignItems: 'stretch', 
                    gap: '3rem', 
                    maxWidth: '1100px', 
                    margin: '0 auto' 
                }}
                variants={containerVariants}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
            >
                {/* Column 1: Editorial Details & Social Links */}
                <motion.div 
                    variants={itemVariants}
                    className="editorial-card"
                    style={{ padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                >
                    <div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <span className="editorial-eyebrow-text" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                DIRECT CHANNELS
                            </span>
                        </div>

                        <h2 style={{ 
                            marginBottom: '1.25rem', 
                            fontSize: '1.75rem', 
                            fontFamily: 'var(--font-heading)',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '-0.02em',
                            color: '#ffffff',
                            lineHeight: 1.2 
                        }}>
                            LET'S ARCHITECT SOMETHING <span style={{ color: '#ef4444' }}>ICONIC</span>.
                        </h2>
                        <p style={{ marginBottom: '2.5rem', lineHeight: 1.8, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                            Whether you have an ambitious platform to build, an engineering hurdle to solve, or wish to explore executive technical leadership, my inbox is open.
                        </p>
                    </div>

                    <div>
                        <span className="editorial-eyebrow-text" style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '1rem' }}>
                            OFFICIAL PLATFORMS
                        </span>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <motion.a
                                href={linkedin}
                                target="_blank"
                                rel="noreferrer"
                                className="editorial-platform-badge"
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Linkedin size={15} /> <span>LINKEDIN</span>
                            </motion.a>
                            <motion.a
                                href={github}
                                target="_blank"
                                rel="noreferrer"
                                className="editorial-platform-badge"
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Github size={15} /> <span>GITHUB</span>
                            </motion.a>
                            {instagram && (
                                <motion.a
                                    href={instagram}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="editorial-platform-badge"
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Instagram size={15} /> <span>INSTAGRAM</span>
                                </motion.a>
                            )}
                            {x && (
                                <motion.a
                                    href={x}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="editorial-platform-badge"
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <XIcon size={14} /> <span>X / TWITTER</span>
                                </motion.a>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Column 2: Direct Email Action Card */}
                <motion.div
                    variants={itemVariants}
                    className="editorial-card"
                    style={{
                        textAlign: 'center',
                        padding: '3.5rem 2.5rem',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                    whileHover={{ y: -6, transition: { duration: 0.15, ease: 'easeOut' } }}
                >
                    <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                        <motion.div
                            style={{
                                width: '80px', 
                                height: '80px',
                                background: '#f8fafc',
                                borderRadius: '1.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 2rem'
                            }}
                            whileHover={{ scale: 1.08, rotate: 3 }}
                        >
                            <Mail size={36} color="#020617" />
                        </motion.div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <span className="editorial-eyebrow-text" style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                ELECTRONIC CORRESPONDENCE
                            </span>
                        </div>

                        <h3 style={{ 
                            marginBottom: '0.6rem', 
                            fontSize: '1.4rem',
                            fontFamily: 'var(--font-heading)',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            color: '#ffffff'
                        }}>
                            EMAIL <span style={{ color: '#ef4444' }}>VIVASWAN</span>
                        </h3>
                        <p style={{ marginBottom: '2.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Direct transmission • Guaranteed response within 24 hours
                        </p>

                        <motion.a
                            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`}
                            target="_blank"
                            rel="noreferrer"
                            className="editorial-btn-primary"
                            whileHover="hover"
                            whileTap={{ scale: 0.98 }}
                            style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '0.75rem',
                                width: '100%',
                                maxWidth: '380px',
                                justifyContent: 'center',
                                padding: '1rem 1.5rem',
                                fontSize: '0.85rem'
                            }}
                        >
                            <motion.div
                                variants={{
                                    hover: { 
                                        rotate: [0, -10, 15, 0],
                                        x: [0, 4, -2, 0],
                                        transition: { duration: 0.4 } 
                                    }
                                }}
                                style={{ display: 'flex', alignItems: 'center' }}
                            >
                                <Send size={16} />
                            </motion.div>
                            {email}
                        </motion.a>
                    </div>
                </motion.div>
            </motion.div>

            {/* Subtle Animated Letter Marquee */}
            <motion.div
                style={{
                    marginTop: '6rem',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '2.5rem'
                }}
            >
                {['C', 'O', 'N', 'N', 'E', 'C', 'T'].map((letter, i) => (
                    <motion.span
                        key={i}
                        style={{
                            fontSize: '0.9rem',
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '0.2em',
                            color: '#ffffff',
                            opacity: 0.25
                        }}
                        animate={{
                            y: [0, -5, 0],
                            opacity: [0.2, 0.5, 0.2]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3
                        }}
                    >
                        {letter}
                    </motion.span>
                ))}
            </motion.div>
        </div>
    );
};

export default Contact;