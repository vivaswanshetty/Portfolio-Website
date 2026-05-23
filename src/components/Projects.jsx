import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { portfolioData } from '../data/portfolioData';
import { Github, ExternalLink } from 'lucide-react';

const ProjectCard = ({ project, index }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start 0.9', 'start 0.3']
    });

    const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

    return (
        <motion.div
            ref={ref}
            style={{ position: 'relative' }}
        >
            <motion.div
                className="card project-card"
                style={{
                    padding: 0,
                    overflow: 'hidden',
                    y
                }}
                initial={{ opacity: 0, y: 60 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
                transition={{
                    duration: 0.7,
                    delay: index * 0.15,
                    ease: [0.16, 1, 0.3, 1]
                }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
                {project.image && (
                    <div style={{
                        width: '100%',
                        height: '240px',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        <motion.img
                            src={project.image}
                            alt={project.title}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                            whileHover={{ scale: 1.08 }}
                            transition={{ duration: 0.5 }}
                        />
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to top, rgba(2, 6, 23, 0.9) 0%, transparent 60%)'
                        }} />

                        <motion.div
                            style={{
                                position: 'absolute',
                                bottom: '1rem',
                                left: '1rem',
                                display: 'flex',
                                gap: '0.5rem'
                            }}
                        >
                            {project.tech.slice(0, 3).map((t, i) => (
                                <span key={i} style={{
                                    fontSize: '0.7rem',
                                    padding: '0.3rem 0.6rem',
                                    background: 'rgba(0,0,0,0.6)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '4px',
                                    color: '#60a5fa',
                                    fontFamily: 'monospace'
                                }}>
                                    {t}
                                </span>
                            ))}
                        </motion.div>
                    </div>
                )}

                <div style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{project.title}</h3>
                        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                            {project.repo && (
                                <motion.a
                                    href={project.repo}
                                    target="_blank"
                                    rel="noreferrer"
                                    whileHover={{ scale: 1.12, color: 'var(--accent-primary)' }}
                                    style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none', transition: 'color 0.2s' }}
                                    title={project.mobileRepo ? "Web Repository" : "GitHub Repository"}
                                >
                                    <Github size={18} />
                                    {project.mobileRepo && <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Web</span>}
                                </motion.a>
                            )}
                            {project.mobileRepo && (
                                <motion.a
                                    href={project.mobileRepo}
                                    target="_blank"
                                    rel="noreferrer"
                                    whileHover={{ scale: 1.12, color: 'var(--accent-primary)' }}
                                    style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none', transition: 'color 0.2s' }}
                                    title="Mobile Repository"
                                >
                                    <Github size={18} />
                                    <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Mobile</span>
                                </motion.a>
                            )}
                            {project.link && (
                                <motion.a
                                    href={project.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    whileHover={{ scale: 1.12, color: 'var(--accent-primary)' }}
                                    style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none', transition: 'color 0.2s' }}
                                    title="Live Preview"
                                >
                                    <ExternalLink size={18} />
                                    {project.mobileRepo && <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Live</span>}
                                </motion.a>
                            )}
                        </div>
                    </div>

                    <p style={{ marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: 1.7 }}>{project.problem}</p>
                </div>
            </motion.div>
        </motion.div>
    );
};

const Projects = () => {
    const { projects } = portfolioData;
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start start', 'end start']
    });

    const headerY = useTransform(scrollYProgress, [0, 1], [0, 80]);
    const headerOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

    return (
        <div className="page-container" ref={ref}>
            <motion.div
                style={{
                    textAlign: 'center',
                    marginBottom: '5rem',
                    position: 'relative'
                }}
            >
                <motion.div
                    style={{ y: headerY, opacity: headerOpacity }}
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
                        My Work
                    </span>
                    <h1 style={{ marginBottom: '1rem' }}>Projects</h1>
                    <p style={{ maxWidth: '500px', margin: '0 auto' }}>
                        Exploring ideas through code, design, and relentless iteration.
                    </p>
                </motion.div>

                <motion.div
                    style={{
                        position: 'absolute',
                        top: '-80px',
                        left: '30%',
                        width: '300px',
                        height: '300px',
                        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%)',
                        filter: 'blur(60px)'
                    }}
                />
            </motion.div>

            <div 
                style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 420px), 1fr))',
                    gap: '2.5rem',
                    maxWidth: '960px',
                    margin: '0 auto'
                }}
            >
                {projects.map((project, index) => (
                    <ProjectCard key={index} project={project} index={index} />
                ))}
            </div>

            <motion.div
                style={{
                    marginTop: '5rem',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '1rem'
                }}
            >
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        style={{
                            width: '60px',
                            height: '2px',
                            background: 'rgba(59, 130, 246, 0.2)',
                            borderRadius: '1px',
                            overflow: 'hidden'
                        }}
                        initial={{ scaleX: 0 }}
                        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                    >
                        <motion.div
                            style={{
                                width: '100%',
                                height: '100%',
                                background: 'var(--accent-primary)'
                            }}
                            initial={{ x: '-100%' }}
                            animate={{ x: '200%' }}
                            transition={{ duration: 1.5, delay: 1 + i * 0.2, repeat: Infinity, repeatDelay: 2 }}
                        />
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default Projects;