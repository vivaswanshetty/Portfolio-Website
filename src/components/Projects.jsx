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
                            whileHover={{ scale: 1.06 }}
                            transition={{ duration: 0.4 }}
                        />
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to top, rgba(3, 7, 18, 0.6) 0%, transparent 60%)'
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
                                padding: '0.3rem 0.75rem',
                                borderRadius: '9999px',
                                background: project.category === 'Mobile Apps' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(56, 189, 248, 0.25)',
                                border: project.category === 'Mobile Apps' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(56, 189, 248, 0.4)',
                                color: project.category === 'Mobile Apps' ? '#34d399' : '#38bdf8',
                                backdropFilter: 'blur(10px)'
                            }}>
                                {project.category}
                            </span>
                        </div>
                    </div>
                )}

                <div style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', flex: 1, boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem', gap: '0.75rem', minHeight: '48px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                            {project.logo && (
                                <div style={{
                                    width: '38px',
                                    height: '38px',
                                    borderRadius: '10px',
                                    overflow: 'hidden',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '3px'
                                }}>
                                    <img src={project.logo} alt={`${project.title} logo`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                </div>
                            )}
                            <div>
                                <h3 style={{ fontSize: '1.3rem', margin: 0, color: '#fff', lineHeight: 1.2 }}>{project.title}</h3>
                                {project.tagline && (
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>
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
                                    whileHover={{ scale: 1.15, color: 'var(--accent-azure)' }}
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
                                    whileHover={{ scale: 1.15, color: 'var(--accent-cyan)' }}
                                    style={{ color: 'var(--accent-azure)', display: 'flex', alignItems: 'center', padding: '0.3rem', transition: 'color 0.2s' }}
                                    title="Live Preview"
                                >
                                    <ExternalLink size={18} />
                                </motion.a>
                            )}
                        </div>
                    </div>

                    <p style={{ 
                        marginBottom: '1rem', 
                        fontSize: '0.9rem', 
                        lineHeight: 1.65, 
                        color: 'var(--text-secondary)', 
                        flex: 1,
                        minHeight: '4.8rem',
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
                        marginBottom: '1.25rem'
                    }}>
                        {project.tech.slice(0, 3).map((t, i) => (
                            <span key={i} style={{
                                fontSize: '0.72rem',
                                padding: '0.25rem 0.6rem',
                                background: 'rgba(56, 189, 248, 0.08)',
                                border: '1px solid rgba(56, 189, 248, 0.2)',
                                borderRadius: '6px',
                                color: 'var(--accent-azure)',
                                fontFamily: 'monospace',
                                fontWeight: 500
                            }}>
                                {t}
                            </span>
                        ))}
                        {project.tech.length > 3 && (
                            <span style={{
                                fontSize: '0.72rem',
                                padding: '0.25rem 0.55rem',
                                background: 'rgba(192, 132, 252, 0.1)',
                                border: '1px solid rgba(192, 132, 252, 0.25)',
                                borderRadius: '6px',
                                color: '#c084fc',
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
                        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Layers size={14} color="var(--accent-azure)" />
                            <span>{project.metrics ? project.metrics[0].val : 'Deep Dive'}</span>
                        </span>

                        <Link
                            to={`/projects/${project.slug}`}
                            className="case-study-cta-btn"
                        >
                            <span>Explore</span>
                            <ArrowRight size={14} />
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

    const headerY = useTransform(scrollYProgress, [0, 1], [0, 80]);
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
                        color: 'var(--accent-azure)',
                        marginBottom: '1rem',
                        fontWeight: 600
                    }}>
                        Engineering Portfolio
                    </span>
                    <h1 style={{ marginBottom: '1rem' }}>Featured Projects</h1>
                    <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
                        Production-grade mobile and full-stack systems with detailed technical breakdowns and interactive UI galleries.
                    </p>
                </motion.div>

                <motion.div
                    style={{
                        position: 'absolute',
                        top: '-80px',
                        left: '30%',
                        width: '320px',
                        height: '320px',
                        background: 'radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, transparent 70%)',
                        filter: 'blur(60px)'
                    }}
                />
            </motion.div>

            {/* Filter & Live Search Bar */}
            <div style={{ maxWidth: '980px', margin: '0 auto 3rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
                                        padding: '0.5rem 1.1rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        border: isActive ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                                        background: isActive ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
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
                        <Search size={16} color="var(--accent-azure)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter by tech or keyword..."
                            style={{
                                width: '100%',
                                padding: '0.55rem 2.2rem 0.55rem 2.5rem',
                                borderRadius: '9999px',
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
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
                    <span>Showing {filteredProjects.length} of {projects.length} case studies</span>
                    {(searchQuery || activeCategory !== 'All') && (
                        <button
                            onClick={() => {
                                setActiveCategory('All');
                                setSearchQuery('');
                            }}
                            style={{ color: 'var(--accent-azure)', textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none', fontSize: '0.82rem' }}
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
                    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 450px), 1fr))',
                    gap: '2.5rem',
                    maxWidth: '980px',
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
                                background: 'rgba(255, 255, 255, 0.02)',
                                borderRadius: '1.25rem',
                                border: '1px dashed rgba(56, 189, 248, 0.2)'
                            }}
                        >
                            <Search size={32} color="var(--accent-azure)" style={{ margin: '0 auto 1rem', opacity: 0.6 }} />
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No matching case studies found</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                Try searching for another keyword like "Expo", "Firebase", or "Socket.io".
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
                            <ProjectCard key={project.slug || project.title} project={project} index={index} />
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
                            background: 'rgba(56, 189, 248, 0.2)',
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
                                background: 'var(--accent-cyan)'
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