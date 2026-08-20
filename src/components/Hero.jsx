import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowDown, Code, Cpu, Zap, Globe, User, Briefcase, Mail } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import vivaswanBgImg from '../assets/vivaswan_hero_cinematic_bg.png';
import vivaswanCutoutWideImg from '../assets/vivaswan_cutout_wide.png';

const Hero = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end start']
    });

    const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
    const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

    return (
        <section
            ref={containerRef}
            className="editorial-hero-section"
        >
            {/* Top Sub-Bar / Ticker */}
            <motion.div 
                className="editorial-top-ticker"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <span>Full-Stack & Mobile Systems</span>
                <span>Bengaluru, IN • IST</span>
                <span>Available for 2026</span>
            </motion.div>

            {/* Top-Left Eyebrow Micro-Label + Underline Motif */}
            <motion.div 
                className="editorial-eyebrow-container"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
            >
                <span className="editorial-eyebrow-text">
                    Future Engineering Leader.<br />
                    Building High-Impact Systems.
                </span>
                <div className="editorial-eyebrow-rule" />
            </motion.div>

            {/* Center Stage: Multi-Layer Cinematic Depth Sandwich */}
            <motion.div 
                className="editorial-stage"
                style={{ y, opacity }}
            >
                {/* Layer 1: Full High-Res Background Image (Ocean Waves, Horizon, Beach) */}
                <div className="editorial-stage-bg-layer">
                    <img 
                        src={vivaswanBgImg} 
                        alt="Vivaswan Shetty Background" 
                        className="editorial-stage-bg-img"
                    />
                </div>

                {/* Layer 2: Massive Ultra-Bold Display Wordmark Morphed Between Background & Subject */}
                <div className="editorial-display-wordmark">
                    VIVASWAN
                </div>

                {/* Layer 3: Foreground Isolated Cutout Subject Overlapping the Typography */}
                <div className="editorial-stage-cutout-layer">
                    <img 
                        src={vivaswanCutoutWideImg} 
                        alt="Vivaswan Shetty" 
                        className="editorial-stage-cutout-img"
                    />
                </div>
            </motion.div>

            {/* Bottom Row: Solid Rectangular CTAs & Status Tag */}
            <motion.div 
                className="editorial-bottom-row"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
            >
                {/* Bottom Left: Solid Rectangular Button + Text Link */}
                <div className="editorial-cta-group">
                    <Link to="/projects" className="editorial-btn-primary">
                        VIEW PROJECTS
                    </Link>
                    <Link to="/contact" className="editorial-btn-secondary">
                        GET IN TOUCH <ArrowRight size={14} />
                    </Link>
                </div>

                {/* Bottom Right: Editorial Status Tag */}
                <div className="editorial-status-tag">
                    <span className="editorial-status-line">AVAILABLE FOR</span>
                    <span className="editorial-status-line highlight">HIGH-IMPACT ROLES</span>
                    <span className="editorial-status-line">2026</span>
                    <div className="editorial-status-rule" />
                </div>
            </motion.div>
        </section>
    );
};

const FeatureCard = ({ feature, idx, isInView }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { 
                opacity: 1, 
                y: 0,
                transition: { duration: 0.5, delay: idx * 0.08 }
            } : {}}
            style={{ height: '100%' }}
        >
            <div className="editorial-card">
                <div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '1.5rem',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        paddingBottom: '0.75rem'
                    }}>
                        <feature.icon size={22} color="var(--text-main)" />
                        <span style={{ 
                            fontFamily: 'var(--font-body)', 
                            fontSize: '0.72rem', 
                            color: 'var(--text-subtle)', 
                            letterSpacing: '0.15em' 
                        }}>
                            0{idx + 1}
                        </span>
                    </div>
                    <h3 style={{ 
                        fontSize: '1.15rem', 
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '-0.01em',
                        marginBottom: '0.85rem',
                        lineHeight: 1.3,
                        color: 'var(--text-main)'
                    }}>
                        {feature.title}
                    </h3>
                </div>
                <p style={{ 
                    fontSize: '0.88rem', 
                    color: 'var(--text-muted)',
                    lineHeight: 1.65,
                    margin: 0
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
            desc: 'Production-ready architecture with React Native, Expo & MERN ecosystem.'
        },
        {
            icon: Cpu,
            title: 'Visionary Architecture',
            desc: 'Designing resilient distributed backends and AI-first engineering workflows.'
        },
        {
            icon: Zap,
            title: 'High Performance & Precision',
            desc: 'Optimized 60 FPS interfaces, offline-first sync engines, and tight data pipelines.'
        },
        {
            icon: Globe,
            title: 'Leadership & Execution',
            desc: 'Driving end-to-end products from conception to high-scale execution.'
        },
    ];

    return (
        <section
            ref={ref}
            style={{
                padding: '6rem 2.5rem',
                maxWidth: '1300px',
                margin: '0 auto',
                position: 'relative',
                zIndex: 10
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
                className="editorial-section-header"
            >
                <span className="editorial-eyebrow-text">WHAT I DO.</span>
                <h2 className="editorial-section-title">ENGINEERING CAPABILITIES</h2>
                <div className="editorial-eyebrow-rule" />
            </motion.div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.25rem'
            }}>
                {features.map((feature, idx) => (
                    <FeatureCard key={idx} feature={feature} idx={idx} isInView={isInView} />
                ))}
            </div>
        </section>
    );
};

const QuickLinkCard = ({ link, idx, isInView }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { 
                opacity: 1, 
                y: 0, 
                transition: { duration: 0.4, delay: idx * 0.08 }
            } : {}}
            style={{ height: '100%' }}
        >
            <Link
                to={link.path}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '2rem 1.5rem',
                    background: 'rgba(9, 14, 26, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 0,
                    textDecoration: 'none',
                    color: 'white',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    width: '100%',
                    height: '100%',
                    minHeight: '160px',
                    boxSizing: 'border-box'
                }}
                className="editorial-card"
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    marginBottom: '1.5rem'
                }}>
                    <link.icon size={22} color="var(--text-main)" />
                    <ArrowRight size={16} color="var(--text-subtle)" />
                </div>
                <div>
                    <span style={{ 
                        fontWeight: 700, 
                        fontSize: '1rem', 
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        display: 'block',
                        marginBottom: '0.25rem'
                    }}>
                        {link.label}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                        {link.desc}
                    </span>
                </div>
            </Link>
        </motion.div>
    );
};

const QuickLinks = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    const links = [
        { icon: User, label: 'About', path: '/about', desc: 'Journey & philosophy' },
        { icon: Briefcase, label: 'Projects', path: '/projects', desc: 'Featured systems' },
        { icon: Code, label: 'Skills', path: '/skills', desc: 'Technical stack' },
        { icon: Mail, label: 'Contact', path: '/contact', desc: 'Initiate dialogue' },
    ];

    return (
        <section
            ref={ref}
            style={{
                padding: '0 2.5rem 8rem',
                maxWidth: '1300px',
                margin: '0 auto',
                position: 'relative',
                zIndex: 10
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
                className="editorial-section-header"
            >
                <span className="editorial-eyebrow-text">NAVIGATION.</span>
                <h2 className="editorial-section-title">EXPLORE THE ARCHIVE</h2>
                <div className="editorial-eyebrow-rule" />
            </motion.div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.25rem'
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