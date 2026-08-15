import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { portfolioData } from '../data/portfolioData';
import { Github, ExternalLink, Search, Filter, X, Sparkles } from 'lucide-react';
import { useTiltEffect } from '../hooks/useScrollReveal';

const ProjectCard = ({ project, index }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });
    const tilt = useTiltEffect(6);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start 0.9', 'start 0.3']
    });

    const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

    return (
        <motion.div
            layout
            ref={ref}
            style={{ position: 'relative', y }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
                duration: 0.4,
                delay: index * 0.08,
                ease: [0.16, 1, 0.3, 1]
            }}
        >
            <div
                ref={tilt.ref}
                className="card project-card"
                style={{
                    padding: 0,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    ...tilt.style
                }}
                {...tilt.handlers}
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

                        <div
                            style={{
                                position: 'absolute',
                                bottom: '1rem',
                                left: '1rem',
                                display: 'flex',
                                gap: '0.4rem',
                                flexWrap: 'wrap',
                                maxWidth: '90%'
                            }}
                        >
                            {project.tech.slice(0, 3).map((t, i) => (
                                <span key={i} style={{
                                    fontSize: '0.7rem',
                                    padding: '0.25rem 0.55rem',
                                    background: 'rgba(0,0,0,0.65)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '4px',
                                    color: '#60a5fa',
                                    fontFamily: 'monospace'
                                }}>
                                    {t}
                                </span>
                            ))}
                            {project.tech.length > 3 && (
                                <span style={{
                                    fontSize: '0.7rem',
                                    padding: '0.25rem 0.45rem',
                                    background: 'rgba(59, 130, 246, 0.2)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    fontFamily: 'monospace'
                                }}>
                                    +{project.tech.length - 3}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.4rem', margin: 0 }}>{project.title}</h3>
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
                                    style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none', transition: 'color 0.2s' }}
                                    title="Live Preview"
                                >
                                    <ExternalLink size={18} />
                                    {project.mobileRepo && <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Live</span>}
                                </motion.a>
                            )}
                        </div>
                    </div>

                    <p style={{ marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: 1.7, flex: 1 }}>{project.problem}</p>

                    {project.impact && (
                        <div style={{
                            padding: '0.85rem 1rem',
                            borderRadius: '0.75rem',
                            background: 'rgba(59, 130, 246, 0.06)',
                            border: '1px solid rgba(59, 130, 246, 0.12)',
                            fontSize: '0.85rem',
                            color: 'var(--text-muted)',
                            lineHeight: 1.6
                        }}>
                            <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Impact: </span>
                            {project.impact}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const Projects = () => {
    const { projects } = portfolioData;
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start start', 'end start']
    });

    const headerY = useTransform(scrollYProgress, [0, 1], [0, 80]);
    const headerOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

    const categories = ['All', 'Mobile Apps', 'Full-Stack Web', 'Developer Tools'];

    const filteredProjects = projects.filter((project) => {
        // Category filter
        let matchesCategory = true;
        if (activeCategory === 'Mobile Apps') {
            matchesCategory = project.tech.some(t => t.toLowerCase().includes('native') || t.toLowerCase().includes('expo'));
        } else if (activeCategory === 'Full-Stack Web') {
            matchesCategory = project.tech.some(t => t.toLowerCase().includes('react') || t.toLowerCase().includes('express') || t.toLowerCase().includes('mongodb'));
        } else if (activeCategory === 'Developer Tools') {
            matchesCategory = project.title.toLowerCase().includes('portfolio') || project.tech.some(t => t.toLowerCase().includes('vite'));
        }

        // Search query filter
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch = !q || (
            project.title.toLowerCase().includes(q) ||
            project.problem.toLowerCase().includes(q) ||
            project.tech.some(t => t.toLowerCase().includes(q))
        );

        return matchesCategory && matchesSearch;
    });

    return (
        <div className="page-container" ref={ref}>
            <motion.div
                style={{
                    textAlign: 'center',
                    marginBottom: '3.5rem',
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
                        Engineering Portfolio
                    </span>
                    <h1 style={{ marginBottom: '1rem' }}>Projects & Work</h1>
                    <p style={{ maxWidth: '550px', margin: '0 auto', fontSize: '1.05rem' }}>
                        Production-grade mobile and full-stack systems built with modern architecture.
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

            {/* Filter & Live Search Bar */}
            <div style={{ maxWidth: '960px', margin: '0 auto 3rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    {/* Category Filter Pills */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {categories.map((cat) => {
                            const isActive = activeCategory === cat;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        border: isActive ? '1px solid var(--accent-primary)' : '1px solid rgba(255, 255, 255, 0.08)',
                                        background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'rgba(30, 41, 59, 0.3)',
                                        color: isActive ? '#fff' : 'var(--text-muted)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {cat}
                                </button>
                            );
                        })}
                    </div>

                    {/* Search Input */}
                    <div style={{
                        position: 'relative',
                        minWidth: '260px',
                        flex: '1',
                        maxWidth: '360px'
                    }}>
                        <Search size={16} color="var(--accent-primary)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter by tech or keyword..."
                            style={{
                                width: '100%',
                                padding: '0.55rem 2.2rem 0.55rem 2.5rem',
                                borderRadius: '9999px',
                                background: 'rgba(30, 41, 59, 0.3)',
                                border: '1px solid rgba(59, 130, 246, 0.2)',
                                color: '#fff',
                                fontSize: '0.88rem',
                                outline: 'none'
                            }}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                style={{
                                    position: 'absolute',
                                    right: '0.8rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Showing Count */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <span>Showing {filteredProjects.length} of {projects.length} projects</span>
                    {(searchQuery || activeCategory !== 'All') && (
                        <button
                            onClick={() => {
                                setActiveCategory('All');
                                setSearchQuery('');
                            }}
                            style={{ color: 'var(--accent-primary)', textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none', fontSize: '0.82rem' }}
                        >
                            Reset filters
                        </button>
                    )}
                </div>
            </div>

            {/* Projects 2-Column Grid */}
            <motion.div 
                layout
                style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 420px), 1fr))',
                    gap: '2.5rem',
                    maxWidth: '960px',
                    margin: '0 auto'
                }}
            >
                <AnimatePresence mode="popLayout">
                    {filteredProjects.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                gridColumn: '1 / -1',
                                textAlign: 'center',
                                padding: '4rem 1rem',
                                background: 'rgba(30, 41, 59, 0.2)',
                                borderRadius: '1.25rem',
                                border: '1px dashed rgba(59, 130, 246, 0.2)'
                            }}
                        >
                            <Sparkles size={32} color="var(--accent-primary)" style={{ margin: '0 auto 1rem', opacity: 0.6 }} />
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No matching projects found</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                Try searching for another keyword like "Expo", "Firebase", or "TypeScript".
                            </p>
                            <button
                                onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
                                className="btn btn-outline"
                                style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}
                            >
                                Clear Search
                            </button>
                        </motion.div>
                    ) : (
                        filteredProjects.map((project, index) => (
                            <ProjectCard key={project.title} project={project} index={index} />
                        ))
                    )}
                </AnimatePresence>
            </motion.div>

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