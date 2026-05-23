import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowDown, Code, Palette, Database, Layers, Terminal, Globe, Zap, Star, Briefcase, User, Mail, ArrowRight, Sparkles, Rocket } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

const Hero = () => {
    const containerRef = useRef(null);
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
            transition: { staggerChildren: 0.12, delayChildren: 0.3 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 40 },
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
                paddingTop: 'calc(var(--nav-height) + var(--nav-top-offset) + 1rem)',
                paddingLeft: '2rem',
                paddingRight: '2rem',
                paddingBottom: '6rem',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <motion.div
                style={{
                    position: 'absolute',
                    top: '15%',
                    left: '50%',
                    width: '80%',
                    height: '60%',
                    background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                    transform: 'translate(-50%, 0%)',
                    y
                }}
            />

            <motion.div
                style={{ maxWidth: '900px', textAlign: 'center', position: 'relative', zIndex: 2, y, opacity, scale }}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div
                    variants={itemVariants}
                    style={{
                        marginBottom: '2rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.6rem 1.5rem',
                        borderRadius: '9999px',
                        background: 'rgba(59, 130, 246, 0.08)',
                        border: '1px solid rgba(59, 130, 246, 0.15)'
                    }}
                >
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                            width: '8px', height: '8px',
                            borderRadius: '50%',
                            background: '#22c55e'
                        }}
                    />
                    <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 500 }}>
                        Available for freelance work
                    </span>
                </motion.div>

                <motion.h1
                    variants={itemVariants}
                    style={{
                        fontSize: 'clamp(2rem, 6vw, 4rem)',
                        fontFamily: 'var(--font-brand)',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                        marginBottom: '1.5rem',
                        lineHeight: 1.1,
                        letterSpacing: '-0.035em',
                        background: 'linear-gradient(135deg, #fff 0%, #94a3b8 40%, #fff 60%, #cbd5e1 100%)',
                        backgroundSize: '200% auto',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        animation: 'gradient-shift 4s ease infinite'
                    }}
                >
                    {portfolioData.hero.name}
                </motion.h1>

                <motion.p
                    variants={itemVariants}
                    style={{
                        fontSize: 'clamp(1.3rem, 3vw, 2rem)',
                        color: 'var(--accent-primary)',
                        marginBottom: '1.5rem',
                        fontWeight: 600,
                        letterSpacing: '-0.01em'
                    }}
                >
                    {portfolioData.hero.role}
                </motion.p>

                <motion.p
                    variants={itemVariants}
                    style={{
                        fontSize: '1.15rem',
                        color: 'var(--text-muted)',
                        maxWidth: '550px',
                        margin: '0 auto 2.5rem',
                        lineHeight: 1.8
                    }}
                >
                    {portfolioData.hero.tagline}
                </motion.p>

                <motion.div
                    variants={itemVariants}
                    style={{
                        display: 'flex',
                        gap: '1rem',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        marginBottom: '4rem'
                    }}
                >
                    <Link to="/projects" className="btn btn-primary">View Projects</Link>
                    <Link to="/contact" className="btn btn-outline">Contact Me</Link>
                </motion.div>
            </motion.div>

            <motion.div
                style={{
                    position: 'absolute',
                    bottom: '3rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}
            >
                <motion.div
                    animate={{ y: [0, 14, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                >
                    <ArrowDown size={24} color="var(--text-muted)" />
                </motion.div>
            </motion.div>

            <motion.div
                style={{
                    position: 'absolute',
                    top: '25%',
                    right: '8%',
                    width: '250px',
                    height: '250px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12), transparent 70%)',
                    filter: 'blur(50px)',
                    y: useTransform(scrollYProgress, [0, 1], [0, -80])
                }}
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
            />

            <motion.div
                style={{
                    position: 'absolute',
                    bottom: '25%',
                    left: '5%',
                    width: '180px',
                    height: '180px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1), transparent 70%)',
                    filter: 'blur(40px)',
                    y: useTransform(scrollYProgress, [0, 1], [0, 60])
                }}
                animate={{ scale: [1, 0.9, 1] }}
                transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut', delay: 2 }}
            />

            <motion.div
                style={{
                    position: 'absolute',
                    top: '60%',
                    left: '15%',
                    width: '100px',
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent)',
                    y: useTransform(scrollYProgress, [0, 1], [0, 40])
                }}
            />
        </section>
    );
};

const FeaturedSection = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    const features = [
        {
            icon: Code,
            title: 'Full Stack Development',
            desc: 'Building robust applications with modern technologies',
            color: '#3b82f6'
        },
        {
            icon: Sparkles,
            title: 'Creative Solutions',
            desc: 'Transforming complex problems into elegant interfaces',
            color: '#8b5cf6'
        },
        {
            icon: Zap,
            title: 'Performance Focused',
            desc: 'Optimized for speed and seamless user experience',
            color: '#06b6d4'
        },
        {
            icon: Globe,
            title: 'Global Perspective',
            desc: 'Building products for diverse audiences',
            color: '#10b981'
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
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 40 }}
                        animate={isInView ? { 
                            opacity: 1, 
                            y: 0,
                            transition: { duration: 0.5, delay: idx * 0.1 }
                        } : {}}
                        transition={{ duration: 0.12, ease: 'easeOut' }}
                        style={{
                            padding: '2rem',
                            background: 'rgba(30, 41, 59, 0.3)',
                            border: '1px solid rgba(59, 130, 246, 0.15)',
                            borderRadius: '1rem',
                            textAlign: 'center'
                        }}
                        whileHover={{ 
                            y: -8, 
                            borderColor: feature.color,
                            transition: { duration: 0.12, ease: 'easeOut', delay: 0 }
                        }}
                    >
                        <div style={{
                            width: '60px', height: '60px',
                            background: `${feature.color}15`,
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem'
                        }}>
                            <feature.icon size={28} color={feature.color} />
                        </div>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.8rem' }}>{feature.title}</h3>
                        <p style={{ fontSize: '0.9rem', marginBottom: 0 }}>{feature.desc}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

const QuickLinks = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    const links = [
        { icon: User, label: 'About', path: '/about', desc: 'My journey & experience' },
        { icon: Briefcase, label: 'Projects', path: '/projects', desc: 'Featured work' },
        { icon: Code, label: 'Skills', path: '/skills', desc: 'Technologies I use' },
        { icon: Mail, label: 'Contact', path: '/contact', desc: 'Get in touch' },
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
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={isInView ? { 
                            opacity: 1, 
                            scale: 1,
                            transition: { duration: 0.4, delay: idx * 0.08 }
                        } : {}}
                        transition={{ duration: 0.12, ease: 'easeOut' }}
                        whileHover={{ 
                            y: -6,
                            transition: { duration: 0.12, ease: 'easeOut', delay: 0 }
                        }}
                    >
                        <Link
                            to={link.path}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.8rem',
                                padding: '1.8rem 1rem',
                                background: 'rgba(30, 41, 59, 0.3)',
                                border: '1px solid rgba(59, 130, 246, 0.15)',
                                borderRadius: '1rem',
                                textDecoration: 'none',
                                color: 'white',
                                transition: 'all 0.3s'
                            }}
                        >
                            <link.icon size={28} color="var(--accent-primary)" />
                            <span style={{ fontWeight: 600, fontSize: '1rem' }}>{link.label}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{link.desc}</span>
                        </Link>
                    </motion.div>
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