import React, { useRef, useState, useEffect } from 'react';
import { motion as Motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Cpu, Globe, Wrench, Terminal, Smartphone, Zap, Github, Palette, Cloud, Database, Send, FileText } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import { LineReveal, RuleDraw, MagnetContainer, CharScrollText } from './MotionPrimitives';

const AnimatedProgressBar = ({ level, name, index }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });
    const [width, setWidth] = useState(0);

    useEffect(() => {
        if (isInView) {
            const timeout = setTimeout(() => setWidth(level), index * 150);
            return () => clearTimeout(timeout);
        }
    }, [isInView, level, index]);

    return (
        <div ref={ref} style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ 
                    fontFamily: 'var(--font-body)', 
                    fontWeight: 600, 
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.14em',
                    color: 'var(--text-main)'
                }}>
                    {name}
                </span>
                <Motion.span
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    style={{ 
                        color: 'var(--text-muted)', 
                        fontSize: '0.82rem', 
                        fontWeight: 700,
                        fontFamily: 'var(--font-brand)',
                        letterSpacing: '0.05em'
                    }}
                >
                    {level}%
                </Motion.span>
            </div>
            <div style={{
                height: '6px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '9999px',
                overflow: 'hidden',
                position: 'relative'
            }}>
                <Motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${width}%` }}
                    transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 + index * 0.15 }}
                    style={{
                        height: '100%',
                        background: '#f8fafc',
                        borderRadius: '9999px',
                        position: 'relative'
                    }}
                >
                    {/* Continuous Shimmer Sweep Animation Preserved */}
                    <Motion.div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(90deg, transparent, rgba(2, 6, 23, 0.5), transparent)'
                        }}
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            repeatDelay: 1.5
                        }}
                    />
                </Motion.div>
            </div>
        </div>
    );
};

const getToolIcon = (toolName) => {
    const name = toolName.toLowerCase();
    if (name.includes('vs code') || name.includes('visual studio')) return <Terminal size={14} color="var(--text-main)" style={{ flexShrink: 0 }} />;
    if (name.includes('android')) return <Smartphone size={14} color="var(--text-main)" style={{ flexShrink: 0 }} />;
    if (name.includes('expo') || name.includes('eas')) return <Zap size={14} color="var(--text-main)" style={{ flexShrink: 0 }} />;
    if (name.includes('git')) return <Github size={14} color="var(--text-main)" style={{ flexShrink: 0 }} />;
    if (name.includes('figma')) return <Palette size={14} color="var(--text-main)" style={{ flexShrink: 0 }} />;
    if (name.includes('vercel') || name.includes('railway')) return <Cloud size={14} color="var(--text-main)" style={{ flexShrink: 0 }} />;
    if (name.includes('mongodb') || name.includes('atlas')) return <Database size={14} color="var(--text-main)" style={{ flexShrink: 0 }} />;
    if (name.includes('postman')) return <Send size={14} color="var(--text-main)" style={{ flexShrink: 0 }} />;
    if (name.includes('notion')) return <FileText size={14} color="var(--text-main)" style={{ flexShrink: 0 }} />;
    return <Wrench size={14} color="var(--text-main)" style={{ flexShrink: 0 }} />;
};

const Skills = () => {
    const { technical, domain, tools } = portfolioData.skills;
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start start', 'end start']
    });

    const headerY = useTransform(scrollYProgress, [0, 1], [0, 50]);

    const technicalSkills = technical.map(skill => ({
        name: skill.name || skill,
        level: skill.level || 80
    }));

    const tickerItems = [...technical.map((s) => s.name || s), ...tools];

    return (
        <div className="editorial-page-container" ref={ref}>
            {/* Opening Editorial Header */}
            <Motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="editorial-page-header"
            >
                <Motion.div style={{ y: headerY }}>
                    <div className="editorial-eyebrow-container" style={{ marginBottom: '0.8rem' }}>
                        <span className="editorial-eyebrow-text">
                            SKILLS & EXPERTISE.
                        </span>
                        <div className="editorial-eyebrow-rule" />
                    </div>
                    <LineReveal as="h1" className="editorial-page-title">
                        TECHNICAL <span style={{ color: '#ef4444' }}>PROFICIENCY</span> &amp; STACK.
                    </LineReveal>
                    <RuleDraw />
                    <CharScrollText
                        text="Production-proven frameworks, native mobile bridges, real-time sockets, and cloud deployment toolchains engineered for resilience."
                        className="kinetic-subpage-scroll-lead"
                    />
                </Motion.div>
            </Motion.div>

            {/* 2-Column Editorial Grid Layout */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', 
                gap: '2.5rem', 
                maxWidth: '1200px', 
                margin: '0 auto' 
            }}>
                {/* Column 1: Technical Progress Bars Card */}
                <Motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="editorial-card kinetic-glass-panel"
                    style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}
                >
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                        paddingBottom: '1.25rem',
                        marginBottom: '2.25rem' 
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                            <Cpu size={22} color="var(--text-main)" />
                            <h2 style={{ 
                                margin: 0, 
                                fontSize: '1.2rem', 
                                fontFamily: 'var(--font-heading)',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '-0.01em',
                                color: 'var(--text-main)'
                            }}>
                                CORE <span style={{ color: '#ef4444' }}>ENGINEERING</span>
                            </h2>
                        </div>
                        <span className="kinetic-index-numeral">01</span>
                    </div>

                    <div>
                        {technicalSkills.map((skill, idx) => (
                            <AnimatedProgressBar key={idx} name={skill.name} level={skill.level} index={idx} />
                        ))}
                    </div>
                </Motion.div>

                {/* Column 2: Domain Expertise & Toolchain */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Domain Expertise Editorial Card */}
                    <Motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="editorial-card kinetic-glass-panel"
                        style={{ padding: '2.25rem 2rem' }}
                    >
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                            paddingBottom: '1.25rem',
                            marginBottom: '1.75rem' 
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                <Globe size={20} color="var(--text-main)" />
                                <h3 style={{ 
                                    margin: 0, 
                                    fontSize: '1.15rem',
                                    fontFamily: 'var(--font-heading)',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    letterSpacing: '-0.01em',
                                    color: 'var(--text-main)'
                                }}>
                                    DOMAIN <span style={{ color: '#ef4444' }}>EXPERTISE</span>
                                </h3>
                            </div>
                            <span className="kinetic-index-numeral">02</span>
                        </div>

                        <div className="editorial-badge-group">
                            {domain.map((item, idx) => (
                                <MagnetContainer key={item} strength={6}>
                                    <Motion.span
                                        className="editorial-badge"
                                        initial={{ opacity: 0, scale: 0.85 }}
                                        animate={isInView ? { 
                                            opacity: 1, 
                                            scale: 1,
                                            transition: { duration: 0.4, delay: 0.4 + idx * 0.05 }
                                        } : { opacity: 0, scale: 0.85 }}
                                    >
                                        {item}
                                    </Motion.span>
                                </MagnetContainer>
                            ))}
                        </div>
                    </Motion.div>

                    {/* Tools & Workflow Editorial Card */}
                    <Motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="editorial-card kinetic-glass-panel"
                        style={{ padding: '2.25rem 2rem' }}
                    >
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                            paddingBottom: '1.25rem',
                            marginBottom: '1.75rem' 
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                <Wrench size={20} color="var(--text-main)" />
                                <h3 style={{ 
                                    margin: 0, 
                                    fontSize: '1.15rem',
                                    fontFamily: 'var(--font-heading)',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    letterSpacing: '-0.01em',
                                    color: 'var(--text-main)'
                                }}>
                                    DEVELOPMENT <span style={{ color: '#ef4444' }}>TOOLCHAIN</span>
                                </h3>
                            </div>
                            <span className="kinetic-index-numeral">03</span>
                        </div>

                        <div className="editorial-badge-group">
                            {tools.map((item, idx) => (
                                <MagnetContainer key={item} strength={6}>
                                    <Motion.span
                                        className="editorial-badge"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem' }}
                                        initial={{ opacity: 0, scale: 0.85 }}
                                        animate={isInView ? { 
                                            opacity: 1, 
                                            scale: 1,
                                            transition: { duration: 0.4, delay: 0.5 + idx * 0.05 }
                                        } : { opacity: 0, scale: 0.85 }}
                                    >
                                        {getToolIcon(item)}
                                        {item}
                                    </Motion.span>
                                </MagnetContainer>
                            ))}
                        </div>
                    </Motion.div>
                </div>
            </div>

            {/* Ambient Tech Ticker Marquee Strip */}
            <div className="kinetic-tech-ticker" aria-hidden="true">
                <div className="kinetic-tech-track">
                    {[...tickerItems, ...tickerItems].map((label, i) => (
                        <span key={`${label}-${i}`} className="kinetic-tech-item">
                            {label}
                            <b>·</b>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Skills;