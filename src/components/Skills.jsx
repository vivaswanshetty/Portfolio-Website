import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Cpu, Globe, Wrench, Code, Sparkles, Terminal, Smartphone, Zap, Github, Palette, Cloud, Database, Send, FileText } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{name}</span>
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: 600 }}
                >
                    {level}%
                </motion.span>
            </div>
            <div style={{
                height: '8px',
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '4px',
                overflow: 'hidden',
                position: 'relative'
            }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${width}%` }}
                    transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 + index * 0.15 }}
                    style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary), var(--accent-primary))',
                        backgroundSize: '200% 100%',
                        borderRadius: '4px',
                        position: 'relative'
                    }}
                >
                    <motion.div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
                        }}
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            repeatDelay: 1.5
                        }}
                    />
                </motion.div>
            </div>
        </div>
    );
};

const getToolIcon = (toolName) => {
    const name = toolName.toLowerCase();
    if (name.includes('vs code') || name.includes('visual studio')) return <Terminal size={14} color="var(--accent-primary)" style={{ flexShrink: 0 }} />;
    if (name.includes('android')) return <Smartphone size={14} color="var(--accent-secondary)" style={{ flexShrink: 0 }} />;
    if (name.includes('expo') || name.includes('eas')) return <Zap size={14} color="#f59e0b" style={{ flexShrink: 0 }} />;
    if (name.includes('git')) return <Github size={14} color="#f33e2e" style={{ flexShrink: 0 }} />;
    if (name.includes('figma')) return <Palette size={14} color="#a855f7" style={{ flexShrink: 0 }} />;
    if (name.includes('vercel') || name.includes('railway')) return <Cloud size={14} color="#06b6d4" style={{ flexShrink: 0 }} />;
    if (name.includes('mongodb') || name.includes('atlas')) return <Database size={14} color="#10b981" style={{ flexShrink: 0 }} />;
    if (name.includes('postman')) return <Send size={14} color="#ff6c37" style={{ flexShrink: 0 }} />;
    if (name.includes('notion')) return <FileText size={14} color="#ffffff" style={{ flexShrink: 0 }} />;
    return <Wrench size={14} color="var(--accent-primary)" style={{ flexShrink: 0 }} />;
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
    const bgY = useTransform(scrollYProgress, [0, 1], [0, -100]);

    const technicalSkills = technical.map(skill => ({
        name: skill.name || skill,
        level: skill.level || 80
    }));

    return (
        <div className="page-container" ref={ref}>
            <motion.div
                style={{
                    textAlign: 'center',
                    marginBottom: '5rem',
                    position: 'relative'
                }}
            >
                <motion.div style={{ y: headerY }}>
                    <span style={{
                        display: 'inline-block',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.25em',
                        color: 'var(--accent-primary)',
                        marginBottom: '1rem',
                        fontWeight: 600
                    }}>
                        Expertise
                    </span>
                    <h1 style={{ marginBottom: '1rem' }}>Skills</h1>
                    <p style={{ maxWidth: '500px', margin: '0 auto' }}>
                        Technologies and tools I use to bring ideas to life.
                    </p>
                </motion.div>

                <motion.div
                    style={{
                        position: 'absolute',
                        top: '-80px',
                        left: '60%',
                        width: '300px',
                        height: '300px',
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%)',
                        filter: 'blur(60px)',
                        y: bgY
                    }}
                />
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', maxWidth: '1000px', margin: '0 auto' }}>
                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="card"
                    style={{ padding: '2.8rem' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                        <div style={{
                            width: '52px', height: '52px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            borderRadius: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Cpu size={26} color="var(--accent-primary)" />
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Technical</h2>
                    </div>

                    {technicalSkills.map((skill, idx) => (
                        <AnimatedProgressBar key={idx} name={skill.name} level={skill.level} index={idx} />
                    ))}
                </motion.div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="card"
                        style={{ padding: '2.2rem' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{
                                width: '48px', height: '48px',
                                background: 'rgba(139, 92, 246, 0.1)',
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Globe size={24} color="var(--accent-secondary)" />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Domain Expertise</h3>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                            {domain.map((item, idx) => (
                                <motion.span
                                    key={idx}
                                    style={{
                                        padding: '0.6rem 1.2rem',
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '9999px',
                                        fontSize: '0.9rem'
                                    }}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={isInView ? { 
                                        opacity: 1, 
                                        scale: 1,
                                        transition: { duration: 0.4, delay: 0.5 + idx * 0.06 }
                                    } : { opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.12, ease: 'easeOut' }}
                                    whileHover={{
                                        scale: 1.05,
                                        background: 'rgba(139, 92, 246, 0.12)',
                                        borderColor: 'var(--accent-secondary)',
                                        transition: { duration: 0.12, ease: 'easeOut', delay: 0 }
                                    }}
                                >
                                    {item}
                                </motion.span>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="card"
                        style={{ padding: '2.2rem' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{
                                width: '48px', height: '48px',
                                background: 'rgba(96, 165, 250, 0.1)',
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Wrench size={24} color="var(--accent-primary)" />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Tools</h3>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                            {tools.map((item, idx) => (
                                <motion.span
                                    key={idx}
                                    style={{
                                        padding: '0.6rem 1.2rem',
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '9999px',
                                        fontSize: '0.9rem',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.6rem'
                                    }}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={isInView ? { 
                                        opacity: 1, 
                                        scale: 1,
                                        transition: { duration: 0.4, delay: 0.6 + idx * 0.06 }
                                    } : { opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.12, ease: 'easeOut' }}
                                    whileHover={{
                                        scale: 1.05,
                                        background: 'rgba(59, 130, 246, 0.12)',
                                        borderColor: 'var(--accent-primary)',
                                        transition: { duration: 0.12, ease: 'easeOut', delay: 0 }
                                    }}
                                >
                                    {getToolIcon(item)}
                                    {item}
                                </motion.span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Skills;