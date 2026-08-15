import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, ExternalLink, Github, Layers, Cpu, CheckCircle2, 
    Smartphone, Globe, Sparkles, ChevronLeft, ChevronRight, X, Maximize2, ShieldCheck, Zap
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
            <div className="section-container" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Project Not Found</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>The requested case study could not be located.</p>
                <Link to="/projects" className="btn btn-primary">
                    <ArrowLeft size={16} /> Back to Projects
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
        <div className="page-container case-study-page">
            
            {/* Top Navigation Bar */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="case-study-top-nav"
            >
                <Link to="/projects" className="case-study-back-link">
                    <ArrowLeft size={16} /> Back to Projects
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <Link to="/projects" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Projects</Link>
                    <span>/</span>
                    <span style={{ color: 'white', fontWeight: 600 }}>{project.title}</span>
                </div>
            </motion.div>

            {/* Project Hero Header */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="case-study-hero"
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <span className={`case-study-badge ${isMobileApp ? 'mobile' : 'web'}`}>
                        {isMobileApp ? <Smartphone size={14} /> : <Globe size={14} />}
                        {project.category}
                    </span>
                    <span className="case-study-status-badge">
                        <span className="live-pulse-dot" /> Production Ready
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', margin: '0.5rem 0 0.8rem', flexWrap: 'wrap' }}>
                    {project.logo && (
                        <div className="case-study-hero-logo">
                            <img src={project.logo} alt={`${project.title} Logo`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                    )}
                    <h1 className="case-study-title" style={{ margin: 0 }}>{project.title}</h1>
                </div>

                <p className="case-study-tagline">{project.tagline}</p>
                <p className="case-study-overview">{project.problem}</p>

                {/* Primary Action Buttons */}
                <div className="case-study-actions">
                    {project.link && project.link !== "/" && (
                        <a
                            href={project.link}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-primary"
                        >
                            <ExternalLink size={16} />
                            {isMobileApp ? "View Project & Releases" : "Launch Live Web App"}
                        </a>
                    )}
                    {project.repo && (
                        <a
                            href={project.repo}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline"
                        >
                            <Github size={16} />
                            Source Code (GitHub)
                        </a>
                    )}
                </div>

                {/* Quantitative Impact Metrics */}
                {project.metrics && (
                    <div className="case-study-metrics-grid">
                        {project.metrics.map((m, idx) => (
                            <motion.div
                                key={idx}
                                className="case-study-metric-card"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, delay: 0.2 + idx * 0.08 }}
                            >
                                <span className="metric-val">{m.val}</span>
                                <span className="metric-label">{m.label}</span>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Interactive Screenshot Showcase Gallery */}
            {screenshots.length > 0 && (
                <section style={{ marginTop: '4rem', marginBottom: '5rem' }}>
                    <div className="case-study-section-header">
                        <div>
                            <span className="section-eyebrow">Interactive Interface Showcase</span>
                            <h2 style={{ fontSize: '1.8rem', margin: 0 }}>High-Resolution Screenshots</h2>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '480px', margin: 0 }}>
                            Click any screen to expand into high-definition lightbox zoom with detailed UX notes.
                        </p>
                    </div>

                    {/* Screenshot Category Filters */}
                    {screenshotCategories.length > 2 && (
                        <div className="case-study-tabs">
                            {screenshotCategories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`case-study-tab-btn ${activeCategory === cat ? 'active' : ''}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Screenshot Grid with Device Mockups */}
                    <div className={`case-study-gallery-grid ${isMobileApp ? 'mobile-grid' : 'web-grid'}`}>
                        {filteredScreenshots.map((item, idx) => (
                            <motion.div
                                key={idx}
                                className={`gallery-item-card ${isMobileApp ? 'mobile-mockup' : 'web-mockup'}`}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.06 }}
                                onClick={() => setSelectedImage(item)}
                            >
                                {/* Browser or Phone Mockup Frame Header */}
                                {isMobileApp ? (
                                    <div className="phone-notch-bar">
                                        <span className="phone-camera-dot" />
                                        <span className="phone-speaker" />
                                    </div>
                                ) : (
                                    <div className="browser-window-header">
                                        <div className="browser-dots">
                                            <span className="dot dot-red" />
                                            <span className="dot dot-yellow" />
                                            <span className="dot dot-green" />
                                        </div>
                                        <div className="browser-address-bar">
                                            <span className="browser-lock">🔒</span> {project.link ? project.link.replace('https://', '') : 'app.elevatex.dev'}
                                        </div>
                                    </div>
                                )}

                                <div className="gallery-image-container">
                                    <img 
                                        src={item.src} 
                                        alt={item.title} 
                                        className="gallery-image" 
                                        loading="lazy" 
                                    />
                                    <div className="gallery-hover-overlay">
                                        <Maximize2 size={24} color="#fff" />
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Click to Expand</span>
                                    </div>
                                </div>

                                <div className="gallery-caption">
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                        <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#fff' }}>{item.title}</h4>
                                        <span className="gallery-category-pill">{item.category}</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                        {item.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* Architecture & Engineering Deep-Dive */}
            <div className="case-study-deep-dive-grid">
                
                {/* System Architecture */}
                <motion.div
                    className="card case-study-deep-card"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="deep-card-header">
                        <div className="deep-icon-box cyan">
                            <Layers size={22} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>System Architecture</h3>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>High-Level Technical Structure</span>
                        </div>
                    </div>
                    <p style={{ fontSize: '0.92rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                        {project.architecture}
                    </p>

                    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.8rem', color: 'var(--accent-azure)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Technology Stack
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {project.tech.map((t, idx) => (
                                <span key={idx} className="tech-badge" style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}>
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Engineering Challenges Solved */}
                <motion.div
                    className="card case-study-deep-card"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                >
                    <div className="deep-card-header">
                        <div className="deep-icon-box violet">
                            <Cpu size={22} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Engineering Hurdles Solved</h3>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Architectural Solutions & Performance</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {project.challenges && project.challenges.map((ch, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
                                <div style={{ 
                                    width: '24px', height: '24px', 
                                    borderRadius: '50%', 
                                    background: 'rgba(168, 85, 247, 0.15)', 
                                    color: '#c084fc', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    flexShrink: 0,
                                    marginTop: '2px'
                                }}>
                                    {idx + 1}
                                </div>
                                <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                                    {ch}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#34d399', fontSize: '0.88rem', fontWeight: 600 }}>
                            <ShieldCheck size={18} />
                            <span>Production Quality Assurance & Error Handling</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Next / Previous Project Navigation Waypoint */}
            <div className="case-study-nav-footer">
                <Link to={`/projects/${prevProject.slug}`} className="project-nav-btn prev">
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>← Previous Project</span>
                    <strong style={{ fontSize: '1rem', color: '#fff' }}>{prevProject.title}</strong>
                </Link>

                <Link to={`/projects/${nextProject.slug}`} className="project-nav-btn next">
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Next Project →</span>
                    <strong style={{ fontSize: '1rem', color: '#fff' }}>{nextProject.title}</strong>
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
                    >
                        <motion.div
                            className="lightbox-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close button */}
                            <button className="lightbox-close-btn" onClick={() => setSelectedImage(null)} title="Close (Esc)">
                                <X size={20} />
                            </button>

                            {/* Prev / Next buttons */}
                            {screenshots.length > 1 && (
                                <>
                                    <button className="lightbox-nav-btn prev" onClick={handlePrevImage} title="Previous (Left Arrow)">
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button className="lightbox-nav-btn next" onClick={handleNextImage} title="Next (Right Arrow)">
                                        <ChevronRight size={24} />
                                    </button>
                                </>
                            )}

                            <div className="lightbox-image-wrapper">
                                <img src={selectedImage.src} alt={selectedImage.title} className="lightbox-image" />
                            </div>

                            <div className="lightbox-info">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.4rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#fff' }}>{selectedImage.title}</h3>
                                    <span className="gallery-category-pill">{selectedImage.category}</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
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
