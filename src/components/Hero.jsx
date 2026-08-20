import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowDown, Code, Palette, Database, Layers, Terminal, Globe, Zap, Star, Briefcase, User, Mail, ArrowRight, Cpu, Rocket } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import { useTiltEffect } from '../hooks/useScrollReveal';

import vivaswanHeroImg from '../assets/vivaswan_hero.png';

const Hero = () => {
    const containerRef = useRef(null);
    const portraitTilt = useTiltEffect(8);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end start']
    });

    const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.12, delayChildren: 0.25 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 35 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
        }
    };

    return (
        <section
            ref={containerRef}
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: 'calc(var(--nav-height) + var(--nav-top-offset) + 2rem)',
                paddingLeft: '1.5rem',
                paddingRight: '1.5rem',
                paddingBottom: '5rem',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Ambient Background Energy Blooms */}
            <motion.div
                style={{
                    position: 'absolute',
                    top: '12%',
                    left: '50%',
                    width: '85%',
                    height: '65%',
                    background: 'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.08) 0%, rgba(168, 85, 247, 0.04) 50%, transparent 70%)',
                    filter: 'blur(70px)',
                    transform: 'translate(-50%, 0%)',
                    y
                }}
            />

            <motion.div
                className="hero-split-container"
                style={{ y, opacity, scale }}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Left Column: Vision, Identity & Actions */}
                <div className="hero-text-column">
                    <motion.div
                        variants={itemVariants}
                        className="hero-status-pill"
                    >
                        <span className="live-pulse-dot" />
                        <span>Available for High-Impact Roles</span>
                    </motion.div>

                    <motion.h1
                        variants={itemVariants}
                        className="hero-main-title"
                    >
                        {portfolioData.hero.name}
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="hero-role-subheading"
                    >
                        {portfolioData.hero.role}
                    </motion.p>

                    <motion.p
                        variants={itemVariants}
                        className="hero-bio-desc"
                    >
                        {portfolioData.hero.tagline}
                    </motion.p>

                    <motion.div
                        variants={itemVariants}
                        className="hero-cta-group"
                    >
                        <Link to="/projects" className="btn btn-primary" style={{ padding: '0.9rem 1.9rem', boxShadow: '0 0 25px rgba(56, 189, 248, 0.35)' }}>
                            Explore Projects <ArrowRight size={16} />
                        </Link>
                        <Link to="/contact" className="btn btn-outline" style={{ padding: '0.9rem 1.8rem' }}>
                            Contact Me
                        </Link>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="hero-highlights-strip"
                    >
                        <span>React Native (Expo)</span>
                        <span className="dot">•</span>
                        <span>Full-Stack MERN</span>
                        <span className="dot">•</span>
                        <span>Gemini AI</span>
                        <span className="dot">•</span>
                        <span>Distributed Systems</span>
                    </motion.div>
                </div>

                {/* Right Column: Cinematic Holographic Portrait Card */}
                <motion.div 
                    variants={itemVariants}
                    className="hero-portrait-column"
                >
                    <div className="hero-portrait-aura" />
                    
                    <div
                        ref={portraitTilt.ref}
                        className="hero-portrait-card"
                        style={{ ...portraitTilt.style }}
                        {...portraitTilt.handlers}
                    >
                        <div className="hero-portrait-image-wrapper">
                            <img
                                src={vivaswanHeroImg}
                                alt="Vivaswan Shetty"
                                className="hero-portrait-image"
                            />
                            
                            {/* Top Floating Glass Badge */}
                            <div className="hero-portrait-floating-badge-top">
                                <span>⚡</span>
                                <span>Future Engineering Leader</span>
                            </div>

                            {/* Bottom Floating Glass Badge */}
                            <div className="hero-portrait-floating-badge-bottom">
                                <span className="live-pulse-dot" />
                                <span>Bengaluru, India (IST)</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Floating Down Indicator */}
            <motion.div
                style={{
                    position: 'absolute',
                    bottom: '2rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    zIndex: 2
                }}
            >
                <motion.div
                    animate={{ y: [0, 12, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                >
                    <ArrowDown size={22} color="var(--text-muted)" style={{ opacity: 0.6 }} />
                </motion.div>
            </motion.div>
        </section>
    );
};

const FeatureCard = ({ feature, idx, isInView }) => {
    const tilt = useTiltEffect(8);

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { 
                opacity: 1, 
                y: 0,
                transition: { duration: 0.5, delay: idx * 0.1 }
            } : {}}
            style={{ height: '100%' }}
        >
            <div
                ref={tilt.ref}
                style={{
                    padding: '2rem 1.6rem',
                    background: 'rgba(30, 41, 59, 0.3)',
                    border: '1px solid rgba(59, 130, 246, 0.15)',
                    borderRadius: '1rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    boxSizing: 'border-box',
                    minHeight: '270px',
                    ...tilt.style
                }}
                {...tilt.handlers}
            >
                <div style={{
                    width: '60px', height: '60px',
                    background: `${feature.color}15`,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    flexShrink: 0
                }}>
                    <feature.icon size={28} color={feature.color} />
                </div>
                <h3 style={{ 
                    fontSize: '1.15rem', 
                    marginBottom: '0.75rem',
                    minHeight: '3.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1.35,
                    width: '100%'
                }}>
                    {feature.title}
                </h3>
                <p style={{ 
                    fontSize: '0.88rem', 
                    color: 'var(--text-muted)',
                    lineHeight: 1.6,
                    margin: 0,
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%'
                }}>
                    {feature.desc}
                </p>
            </div>
        </motion.div>
    );
};

const FeaturedSection = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    const features = [
        {
            icon: Code,
            title: 'Full Stack & Mobile Systems',
            desc: 'Production-ready apps with React Native, Expo & MERN stack',
            color: '#00f2fe'
        },
        {
            icon: Cpu,
            title: 'Visionary Architecture',
            desc: 'Designing scalable real-time systems and AI-first workflows',
            color: '#a855f7'
        },
        {
            icon: Zap,
            title: 'High Performance & Speed',
            desc: 'Optimized algorithms, offline-first sync, and smooth animations',
            color: '#10b981'
        },
        {
            icon: Globe,
            title: 'Leadership & Execution',
            desc: 'Driving projects from zero to scale with entrepreneurial focus',
            color: '#f59e0b'
        },
    ];

    return (
        <section
            ref={ref}
            style={{
                padding: '5rem 1.5rem',
                maxWidth: '1200px',
                margin: '0 auto',
                position: 'relative',
                zIndex: 10
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
                style={{ textAlign: 'center', marginBottom: '4rem' }}
            >
                <span style={{
                    display: 'inline-block',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.25em',
                    color: 'var(--accent-primary)',
                    marginBottom: '1rem',
                    fontWeight: 600
                }}>
                    What I Do
                </span>
                <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '1rem' }}>Crafting Digital Experiences</h2>
            </motion.div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem'
            }}>
                {features.map((feature, idx) => (
                    <FeatureCard key={idx} feature={feature} idx={idx} isInView={isInView} />
                ))}
            </div>
        </section>
    );
};

const QuickLinkCard = ({ link, idx, isInView }) => {
    const tilt = useTiltEffect(8);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { 
                opacity: 1, 
                scale: 1,
                transition: { duration: 0.4, delay: idx * 0.08 }
            } : {}}
            style={{ height: '100%' }}
        >
            <div
                ref={tilt.ref}
                style={{
                    height: '100%',
                    ...tilt.style
                }}
                {...tilt.handlers}
            >
                <Link
                    to={link.path}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.8rem',
                        padding: '1.8rem 1rem',
                        background: 'rgba(9, 14, 26, 0.65)',
                        border: `1px solid ${link.color}25`,
                        borderRadius: '1rem',
                        textDecoration: 'none',
                        color: 'white',
                        transition: 'all 0.3s',
                        width: '100%',
                        height: '100%',
                        minHeight: '160px',
                        boxSizing: 'border-box'
                    }}
                >
                    <div style={{
                        width: '48px', height: '48px',
                        borderRadius: '12px',
                        background: `${link.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <link.icon size={24} color={link.color} />
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '1rem' }}>{link.label}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{link.desc}</span>
                </Link>
            </div>
        </motion.div>
    );
};

const QuickLinks = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    const links = [
        { icon: User, label: 'About', path: '/about', desc: 'My journey & vision', color: '#38bdf8' },
        { icon: Briefcase, label: 'Projects', path: '/projects', desc: 'Featured applications', color: '#a855f7' },
        { icon: Code, label: 'Skills', path: '/skills', desc: 'Technical mastery', color: '#10b981' },
        { icon: Mail, label: 'Contact', path: '/contact', desc: 'Let\'s collaborate', color: '#f59e0b' },
    ];

    return (
        <section
            ref={ref}
            style={{
                padding: '0 1.5rem 8rem',
                maxWidth: '800px',
                margin: '0 auto',
                position: 'relative',
                zIndex: 10
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
                style={{ textAlign: 'center', marginBottom: '3rem' }}
            >
                <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>Explore More</h2>
            </motion.div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '1rem'
            }}>
                {links.map((link, idx) => (
                    <QuickLinkCard key={idx} link={link} idx={idx} isInView={isInView} />
                ))}
            </div>
        </section>
    );
};

const Home = () => {
    return (
        <>
            <Hero />
            <FeaturedSection />
            <QuickLinks />
        </>
    );
};

export default Home;