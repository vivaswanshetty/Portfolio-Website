import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, ExternalLink, Github, Layers, Cpu, CheckCircle2, 
    Smartphone, Globe, ChevronLeft, ChevronRight, X, Maximize2, ShieldCheck, Zap
} from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import { projectScreenshots } from '../data/projectScreenshots';

const ProjectDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [selectedImage, setSelectedImage] = useState(null);
    const [activeCategory, setActiveCategory] = useState('All');

    // Scroll to top when project slug changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

    const projectIndex = portfolioData.projects.findIndex(p => p.slug === slug);
    const project = portfolioData.projects[projectIndex];

    // Fallback if slug not found
    if (!project) {
        return (
            <div className="editorial-page-container" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase' }}>Case Study Not Found</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>The requested case study could not be located in the archive.</p>
                <Link to="/projects" className="editorial-btn-primary">
                    <ArrowLeft size={16} style={{ marginRight: '8px' }} /> BACK TO PROJECTS
                </Link>
            </div>
        );
    }

    const screenshots = projectScreenshots[slug] || [];
    const isMobileApp = project.category === "Mobile Apps" || slug === "elevatex-mobile" || slug === "conquerone";

    // Categories in screenshots
    const screenshotCategories = ['All', ...new Set(screenshots.map(s => s.category))];
    const filteredScreenshots = activeCategory === 'All' 
        ? screenshots 
        : screenshots.filter(s => s.category === activeCategory);

    // Prev / Next projects for navigation
    const prevProject = portfolioData.projects[(projectIndex - 1 + portfolioData.projects.length) % portfolioData.projects.length];
    const nextProject = portfolioData.projects[(projectIndex + 1) % portfolioData.projects.length];

    // Lightbox navigation
    const handleNextImage = (e) => {
        e.stopPropagation();
        const currentIdx = screenshots.findIndex(s => s.src === selectedImage.src);
        const nextIdx = (currentIdx + 1) % screenshots.length;
        setSelectedImage(screenshots[nextIdx]);
    };

    const handlePrevImage = (e) => {
        e.stopPropagation();
        const currentIdx = screenshots.findIndex(s => s.src === selectedImage.src);
        const prevIdx = (currentIdx - 1 + screenshots.length) % screenshots.length;
        setSelectedImage(screenshots[prevIdx]);
    };

    // Keyboard navigation for lightbox
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!selectedImage) return;
            if (e.key === 'Escape') setSelectedImage(null);
            if (e.key === 'ArrowRight') handleNextImage(e);
            if (e.key === 'ArrowLeft') handlePrevImage(e);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedImage, screenshots]);

    return (
        <div className="editorial-page-container" style={{ position: 'relative' }}>
            {/* Top Waypoint Navigation */}
            <motion.div 
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                    paddingBottom: '1rem',
                    marginBottom: '3rem'
                }}
            >
                <Link to="/projects" className="editorial-btn-secondary" style={{ fontSize: '0.78rem' }}>
                    <ArrowLeft size={14} /> BACK TO ARCHIVE
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                    <Link to="/projects" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Projects</Link>
                    <span>/</span>
                    <span style={{ color: '#ffffff', fontWeight: 700 }}>{project.title}</span>
                </div>
            </motion.div>

            {/* Case Study Opening Header */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{ marginBottom: '3.5rem' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                    <span className="editorial-badge" style={{ padding: '0.35rem 0.8rem', fontSize: '0.72rem' }}>
                        {isMobileApp ? <Smartphone size={13} style={{ marginRight: '6px' }} /> : <Globe size={13} style={{ marginRight: '6px' }} />}
                        {project.category}
                    </span>
                    <span className="editorial-badge" style={{ padding: '0.35rem 0.8rem', fontSize: '0.72rem', borderColor: 'rgba(52, 211, 153, 0.3)', color: '#34d399' }}>
                        <span className="live-pulse-dot" style={{ marginRight: '6px' }} /> PRODUCTION READY
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', margin: '0.5rem 0 1rem', flexWrap: 'wrap' }}>
                    {project.logo && (
                        <div style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: 0,
                            overflow: 'hidden',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '6px'
                        }}>
                            <img src={project.logo} alt={`${project.title} Logo`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                    )}
                    <h1 className="editorial-page-title" style={{ margin: 0 }}>
                        {project.title}
                    </h1>
                </div>

                <p style={{ 
                    fontSize: '1.15rem', 
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#e2e8f0',
                    marginBottom: '1rem' 
                }}>
                    {project.tagline}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', lineHeight: 1.8, maxWidth: '850px', marginBottom: '2.5rem' }}>
                    {project.problem}
                </p>

                {/* Primary Action Buttons */}
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '3.5rem' }}>
                    {project.link && project.link !== "/" && (
                        <a
                            href={project.link}
                            target="_blank"
                            rel="noreferrer"
                            className="editorial-btn-primary"
                        >
                            <ExternalLink size={15} style={{ marginRight: '8px' }} />
                            {isMobileApp ? "VIEW PROJECT & RELEASES" : "LAUNCH LIVE WEB APP"}
                        </a>
                    )}
                    {project.repo && (
                        <a
                            href={project.repo}
                            target="_blank"
                            rel="noreferrer"
                            className="editorial-btn-secondary"
                        >
                            <Github size={15} style={{ marginRight: '8px' }} />
                            SOURCE CODE (GITHUB) →
                        </a>
                    )}
                </div>

                {/* Cinematic Hero Cover Showcase Banner */}
                {project.image && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.15 }}
                        className="editorial-card"
                        style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', marginBottom: '3.5rem' }}
                        onClick={() => setSelectedImage({
                            src: project.image,
                            title: `${project.title} Cover Artwork`,
                            category: "Official Cover & Brand",
                            description: `Official brand cover and visual identity artwork for ${project.title}. Click controls to browse screenshots.`
                        })}
                        title="Click to view full-screen in Lightbox"
                    >
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem 1.5rem',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                            background: 'rgba(3, 7, 18, 0.9)'
                        }}>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <div style={{ width: '8px', height: '8px', background: 'rgba(255, 255, 255, 0.3)' }} />
                                <div style={{ width: '8px', height: '8px', background: 'rgba(255, 255, 255, 0.3)' }} />
                                <div style={{ width: '8px', height: '8px', background: 'rgba(255, 255, 255, 0.3)' }} />
                            </div>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                                {project.slug}.app/official-cover
                            </span>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                <Maximize2 size={12} /> EXPAND
                            </div>
                        </div>
                        <div style={{ position: 'relative', width: '100%', maxHeight: '520px', overflow: 'hidden' }}>
                            <img 
                                src={project.image} 
                                alt={`${project.title} Official Cover`} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />
                        </div>
                    </motion.div>
                )}

                {/* Quantitative Impact Metrics */}
                {project.metrics && (
                    <div className="editorial-stat-grid" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(220px, 1fr))`, gap: '1.25rem' }}>
                        {project.metrics.map((m, idx) => (
                            <motion.div
                                key={idx}
                                className="editorial-stat-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.2 + idx * 0.08 }}
                            >
                                <span className="editorial-stat-number">{m.val}</span>
                                <span className="editorial-stat-label">0{idx + 1} / {m.label}</span>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Interactive Screenshot Showcase Gallery */}
            {screenshots.length > 0 && (
                <section style={{ marginTop: '5rem', marginBottom: '5rem' }}>
                    <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.12)', paddingBottom: '1.5rem' }}>
                        <div className="editorial-eyebrow-container" style={{ marginBottom: '0.6rem' }}>
                            <span className="editorial-eyebrow-text">
                                INTERFACE & UX SHOWCASE.
                            </span>
                            <div className="editorial-eyebrow-rule" />
                        </div>
                        <h2 className="editorial-section-title" style={{ margin: 0 }}>
                            HIGH-RESOLUTION SCREENSHOTS
                        </h2>
                    </div>

                    {/* Screenshot Category Filters */}
                    {screenshotCategories.length > 2 && (
                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                            {screenshotCategories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    style={{
                                        padding: '0.55rem 1.2rem',
                                        borderRadius: 0,
                                        fontSize: '0.76rem',
                                        fontFamily: 'var(--font-body)',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.14em',
                                        border: activeCategory === cat ? '1px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.12)',
                                        background: activeCategory === cat ? '#f8fafc' : 'rgba(255, 255, 255, 0.03)',
                                        color: activeCategory === cat ? '#020617' : 'var(--text-muted)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Screenshot Grid */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: isMobileApp ? 'repeat(auto-fill, minmax(260px, 1fr))' : 'repeat(auto-fill, minmax(360px, 1fr))', 
                        gap: '2rem' 
                    }}>
                        {filteredScreenshots.map((item, idx) => (
                            <motion.div
                                key={idx}
                                className="editorial-card"
                                style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.06 }}
                                onClick={() => setSelectedImage(item)}
                            >
                                <div style={{
                                    padding: '0.6rem 1rem',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    background: 'rgba(3, 7, 18, 0.8)'
                                }}>
                                    <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                        SCREEN 0{idx + 1}
                                    </span>
                                    <span className="editorial-badge" style={{ padding: '0.2rem 0.5rem', fontSize: '0.68rem' }}>
                                        {item.category}
                                    </span>
                                </div>

                                <div style={{ position: 'relative', overflow: 'hidden', width: '100%', aspectRatio: isMobileApp ? '9/16' : '16/10' }}>
                                    <img 
                                        src={item.src} 
                                        alt={item.title} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                        loading="lazy" 
                                    />
                                </div>

                                <div style={{ padding: '1.25rem' }}>
                                    <h4 style={{ margin: '0 0 0.4rem', fontSize: '0.95rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', color: '#ffffff' }}>
                                        {item.title}
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                        {item.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* Architecture & Engineering Deep-Dive */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2.5rem', marginBottom: '5rem' }}>
                {/* System Architecture */}
                <motion.div
                    className="editorial-card"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    style={{ padding: '2.5rem 2rem' }}
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
                            <Layers size={22} color="var(--text-main)" />
                            <h3 style={{ 
                                fontSize: '1.2rem', 
                                margin: 0,
                                fontFamily: 'var(--font-heading)',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                color: '#ffffff'
                            }}>
                                SYSTEM ARCHITECTURE
                            </h3>
                        </div>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--text-subtle)', letterSpacing: '0.15em' }}>
                            01 / STRUCT
                        </span>
                    </div>

                    <p style={{ fontSize: '0.92rem', lineHeight: 1.8, color: 'var(--text-muted)', marginBottom: '2rem' }}>
                        {project.architecture}
                    </p>

                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1.5rem' }}>
                        <span className="editorial-eyebrow-text" style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.75rem', display: 'block' }}>
                            TECHNOLOGY STACK
                        </span>
                        <div className="editorial-badge-group">
                            {project.tech.map((t, idx) => (
                                <span key={idx} className="editorial-badge" style={{ padding: '0.4rem 0.8rem', fontSize: '0.72rem' }}>
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Engineering Hurdles Solved */}
                <motion.div
                    className="editorial-card"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    style={{ padding: '2.5rem 2rem' }}
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
                            <Cpu size={22} color="var(--text-main)" />
                            <h3 style={{ 
                                fontSize: '1.2rem', 
                                margin: 0,
                                fontFamily: 'var(--font-heading)',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                color: '#ffffff'
                            }}>
                                ENGINEERING HURDLES SOLVED
                            </h3>
                        </div>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--text-subtle)', letterSpacing: '0.15em' }}>
                            02 / SOLUTIONS
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                        {project.challenges && project.challenges.map((ch, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <span style={{
                                    fontFamily: 'monospace',
                                    fontSize: '0.76rem',
                                    fontWeight: 700,
                                    color: '#f8fafc',
                                    padding: '0.2rem 0.5rem',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    flexShrink: 0,
                                    marginTop: '2px'
                                }}>
                                    0{idx + 1}
                                </span>
                                <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.7, color: 'var(--text-muted)' }}>
                                    {ch}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#34d399', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                        <ShieldCheck size={16} />
                        <span>PRODUCTION QUALITY & INTEGRITY ASSURANCE</span>
                    </div>
                </motion.div>
            </div>

            {/* Next / Previous Project Navigation Waypoint */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.12)', paddingTop: '2.5rem' }}>
                <Link to={`/projects/${prevProject.slug}`} className="editorial-card" style={{ padding: '1.5rem 1.8rem', textDecoration: 'none' }}>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                        ← PREVIOUS CASE STUDY
                    </span>
                    <strong style={{ fontSize: '1.15rem', color: '#ffffff', fontFamily: 'var(--font-heading)', textTransform: 'uppercase' }}>
                        {prevProject.title}
                    </strong>
                </Link>

                <Link to={`/projects/${nextProject.slug}`} className="editorial-card" style={{ padding: '1.5rem 1.8rem', textDecoration: 'none', textAlign: 'right' }}>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                        NEXT CASE STUDY →
                    </span>
                    <strong style={{ fontSize: '1.15rem', color: '#ffffff', fontFamily: 'var(--font-heading)', textTransform: 'uppercase' }}>
                        {nextProject.title}
                    </strong>
                </Link>
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        className="lightbox-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(3, 7, 18, 0.95)',
                            backdropFilter: 'blur(16px)',
                            zIndex: 10000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2rem'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                width: '100%',
                                maxWidth: '1000px',
                                background: '#030712',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            {/* Close button */}
                            <button 
                                onClick={() => setSelectedImage(null)} 
                                style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    background: 'none',
                                    border: 'none',
                                    color: '#ffffff',
                                    cursor: 'pointer',
                                    zIndex: 10
                                }}
                                title="Close (Esc)"
                            >
                                <X size={22} />
                            </button>

                            {/* Prev / Next buttons */}
                            {screenshots.length > 1 && (
                                <>
                                    <button 
                                        onClick={handlePrevImage} 
                                        style={{
                                            position: 'absolute',
                                            left: '1rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: '#030712',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            color: '#fff',
                                            width: '40px',
                                            height: '40px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            zIndex: 10
                                        }}
                                        title="Previous (Left Arrow)"
                                    >
                                        <ChevronLeft size={22} />
                                    </button>
                                    <button 
                                        onClick={handleNextImage} 
                                        style={{
                                            position: 'absolute',
                                            right: '1rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: '#030712',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            color: '#fff',
                                            width: '40px',
                                            height: '40px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            zIndex: 10
                                        }}
                                        title="Next (Right Arrow)"
                                    >
                                        <ChevronRight size={22} />
                                    </button>
                                </>
                            )}

                            <div style={{ width: '100%', maxHeight: '70vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617' }}>
                                <img src={selectedImage.src} alt={selectedImage.title} style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} />
                            </div>

                            <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid rgba(255, 255, 255, 0.12)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.4rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#fff', fontFamily: 'var(--font-heading)', textTransform: 'uppercase' }}>
                                        {selectedImage.title}
                                    </h3>
                                    <span className="editorial-badge" style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem' }}>
                                        {selectedImage.category}
                                    </span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                    {selectedImage.description}
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProjectDetail;
