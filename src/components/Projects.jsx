import React, { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { portfolioData } from '../data/portfolioData';
import { Github, ExternalLink, Search, X, ArrowRight, Layers } from 'lucide-react';
import { useTiltEffect } from '../hooks/useScrollReveal';

const ProjectCard = ({ project, index }) => {
    const navigate = useNavigate();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });
    const tilt = useTiltEffect(5);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start 0.9', 'start 0.3']
    });

    const y = useTransform(scrollYProgress, [0, 1], [30, -30]);

    const handleCardClick = (e) => {
        // Prevent navigation if user clicked a link or button directly
        if (e.target.closest('a') || e.target.closest('button')) {
            return;
        }
        if (project.slug) {
            navigate(`/projects/${project.slug}`);
        }
    };

    return (
        <motion.div
            layout
            ref={ref}
            style={{ position: 'relative', y }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{
                duration: 0.4,
                delay: index * 0.08,
                ease: [0.16, 1, 0.3, 1]
            }}
        >
            <div
                ref={tilt.ref}
                className="editorial-card"
                onClick={handleCardClick}
                style={{
                    padding: 0,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    ...tilt.style
                }}
                {...tilt.handlers}
            >
                {project.image && (
                    <div style={{
                        width: '100%',
                        height: '240px',
                        overflow: 'hidden',
                        position: 'relative',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
                    }}>
                        <motion.img
                            src={project.image}
                            alt={project.title}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.4 }}
                        />
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to top, rgba(3, 7, 18, 0.7) 0%, transparent 60%)'
                        }} />

                        {/* Top Category Badge */}
                        <div style={{
                            position: 'absolute',
                            top: '1rem',
                            left: '1rem',
                            display: 'flex',
                            gap: '0.5rem'
                        }}>
                            <span style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.14em',
                                padding: '0.35rem 0.8rem',
                                borderRadius: 0,
                                background: '#030712',
                                border: '1px solid rgba(255, 255, 255, 0.25)',
                                color: '#f8fafc',
                                backdropFilter: 'blur(8px)'
                            }}>
                                {project.category}
                            </span>
                        </div>
                    </div>
                )}

                <div style={{ padding: '2rem 1.8rem', display: 'flex', flexDirection: 'column', flex: 1, boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem', gap: '0.75rem', minHeight: '48px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                            {project.logo && (
                                <div style={{
                                    width: '38px',
                                    height: '38px',
                                    borderRadius: 0,
                                    overflow: 'hidden',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '4px'
                                }}>
                                    <img src={project.logo} alt={`${project.title} logo`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                </div>
                            )}
                            <div>
                                <h3 style={{ 
                                    fontSize: '1.25rem', 
                                    margin: 0, 
                                    fontFamily: 'var(--font-heading)',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    letterSpacing: '-0.01em',
                                    color: '#ffffff', 
                                    lineHeight: 1.2 
                                }}>
                                    {project.title}
                                </h3>
                                {project.tagline && (
                                    <span style={{ 
                                        fontSize: '0.75rem', 
                                        color: 'var(--text-muted)', 
                                        display: 'block', 
                                        marginTop: '0.25rem',
                                        letterSpacing: '0.04em'
                                    }}>
                                        {project.tagline}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Top Action Icons */}
                        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexShrink: 0 }}>
                            {project.repo && (
                                <motion.a
                                    href={project.repo}
                                    target="_blank"
                                    rel="noreferrer"
                                    whileHover={{ scale: 1.15, color: '#ffffff' }}
                                    style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '0.3rem', transition: 'color 0.2s' }}
                                    title="GitHub Repository"
                                >
                                    <Github size={18} />
                                </motion.a>
                            )}
                            {project.link && (
                                <motion.a
                                    href={project.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    whileHover={{ scale: 1.15, color: '#ffffff' }}
                                    style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '0.3rem', transition: 'color 0.2s' }}
                                    title="Live Preview"
                                >
                                    <ExternalLink size={18} />
                                </motion.a>
                            )}
                        </div>
                    </div>

                    <p style={{ 
                        marginBottom: '1.25rem', 
                        fontSize: '0.88rem', 
                        lineHeight: 1.7, 
                        color: 'var(--text-muted)', 
                        flex: 1,
                        minHeight: '4.5rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {project.problem}
                    </p>

                    {/* Tech Stack Chips in Card Body */}
                    <div style={{
                        display: 'flex',
                        gap: '0.45rem',
                        flexWrap: 'wrap',
                        marginBottom: '1.5rem'
                    }}>
                        {project.tech.slice(0, 3).map((t, i) => (
                            <span key={i} style={{
                                fontSize: '0.72rem',
                                padding: '0.3rem 0.65rem',
                                background: 'rgba(255, 255, 255, 0.04)',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                borderRadius: 0,
                                color: '#f8fafc',
                                fontFamily: 'monospace',
                                fontWeight: 600,
                                letterSpacing: '0.04em'
                            }}>
                                {t}
                            </span>
                        ))}
                        {project.tech.length > 3 && (
                            <span style={{
                                fontSize: '0.72rem',
                                padding: '0.3rem 0.6rem',
                                background: 'rgba(255, 255, 255, 0.04)',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                borderRadius: 0,
                                color: 'var(--text-muted)',
                                fontFamily: 'monospace',
                                fontWeight: 600
                            }}>
                                +{project.tech.length - 3}
                            </span>
                        )}
                    </div>

                    {/* Footer CTA */}
                    <div style={{
                        marginTop: 'auto',
                        paddingTop: '1.2rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <span style={{ 
                            fontSize: '0.76rem', 
                            color: 'var(--text-muted)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.4rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            fontWeight: 600
                        }}>
                            <Layers size={14} color="#f8fafc" />
                            <span>{project.metrics ? project.metrics[0].val : 'Deep Dive'}</span>
                        </span>

                        <Link
                            to={`/projects/${project.slug}`}
                            className="editorial-btn-secondary"
                            style={{ fontSize: '0.78rem' }}
                        >
                            <span>EXPLORE CASE STUDY</span>
                            <ArrowRight size={13} />
                        </Link>
                    </div>
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

    const headerY = useTransform(scrollYProgress, [0, 1], [0, 60]);
    const headerOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

    const categories = ['All', 'Mobile Apps', 'Full-Stack Web'];

    const filteredProjects = projects.filter((project) => {
        // Category filter
        let matchesCategory = true;
        if (activeCategory === 'Mobile Apps') {
            matchesCategory = project.category === 'Mobile Apps';
        } else if (activeCategory === 'Full-Stack Web') {
            matchesCategory = project.category === 'Full-Stack Web';
        }

        // Search query filter
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch = !q || (
            project.title.toLowerCase().includes(q) ||
            project.problem.toLowerCase().includes(q) ||
            (project.tagline && project.tagline.toLowerCase().includes(q)) ||
            project.tech.some(t => t.toLowerCase().includes(q))
        );

        return matchesCategory && matchesSearch;
    });

    return (
        <div className="editorial-page-container" ref={ref}>
            {/* Opening Editorial Header */}
            <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="editorial-page-header"
            >
                <motion.div style={{ y: headerY, opacity: headerOpacity }}>
                    <div className="editorial-eyebrow-container" style={{ marginBottom: '0.8rem' }}>
                        <span className="editorial-eyebrow-text">
                            SELECTED WORKS & ARCHIVE.
                        </span>
                        <div className="editorial-eyebrow-rule" />
                    </div>
                    <h1 className="editorial-page-title">
                        FEATURED PRODUCTION <span style={{ color: '#ef4444' }}>SYSTEMS</span>.
                    </h1>
                    <p style={{ maxWidth: '640px', color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>
                        Production-grade mobile and full-stack applications with architecture breakdowns, performance metrics, and interactive design galleries.
                    </p>
                </motion.div>
            </motion.div>

            {/* Filter & Live Search Bar */}
            <div style={{ maxWidth: '1000px', margin: '0 auto 3.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1.25rem'
                }}>
                    {/* Category Filter Rectangular Buttons */}
                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                        {categories.map((cat) => {
                            const isActive = activeCategory === cat;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    style={{
                                        padding: '0.6rem 1.3rem',
                                        borderRadius: 0,
                                        fontSize: '0.78rem',
                                        fontFamily: 'var(--font-body)',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.14em',
                                        border: isActive ? '1px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.12)',
                                        background: isActive ? '#f8fafc' : 'rgba(255, 255, 255, 0.03)',
                                        color: isActive ? '#020617' : 'var(--text-muted)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                                    }}
                                >
                                    {cat}
                                </button>
                            );
                        })}
                    </div>

                    {/* Search Input with Sharp Editorial Frame */}
                    <div style={{
                        position: 'relative',
                        minWidth: '260px',
                        flex: '1',
                        maxWidth: '360px'
                    }}>
                        <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="FILTER BY TECH OR KEYWORD..."
                            style={{
                                width: '100%',
                                padding: '0.65rem 2.2rem 0.65rem 2.4rem',
                                borderRadius: 0,
                                background: 'rgba(9, 14, 26, 0.6)',
                                border: '1px solid rgba(255, 255, 255, 0.14)',
                                color: '#ffffff',
                                fontSize: '0.78rem',
                                fontFamily: 'var(--font-body)',
                                letterSpacing: '0.1em',
                                outline: 'none',
                                boxSizing: 'border-box'
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                    <span>Showing {filteredProjects.length} of {projects.length} case studies</span>
                    {(searchQuery || activeCategory !== 'All') && (
                        <button
                            onClick={() => {
                                setActiveCategory('All');
                                setSearchQuery('');
                            }}
                            style={{ color: '#f8fafc', textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}
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
                    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 460px), 1fr))',
                    gap: '2.5rem',
                    maxWidth: '1000px',
                    margin: '0 auto'
                }}
            >
                <AnimatePresence mode="popLayout">
                    {filteredProjects.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="editorial-card"
                            style={{
                                gridColumn: '1 / -1',
                                textAlign: 'center',
                                padding: '4rem 1.5rem'
                            }}
                        >
                            <Search size={32} color="#94a3b8" style={{ margin: '0 auto 1rem', opacity: 0.6 }} />
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>No matching case studies found</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                Try searching for another keyword like "Expo", "Firebase", or "Socket.io".
                            </p>
                            <button
                                onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
                                className="editorial-btn-primary"
                                style={{ margin: '0 auto' }}
                            >
                                Clear Search
                            </button>
                        </motion.div>
                    ) : (
                        filteredProjects.map((project, index) => (
                            <ProjectCard key={project.slug || project.title} project={project} index={index} />
                        ))
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default Projects;