import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { 
    Github, Linkedin, Mail, MapPin, ArrowUpRight, Instagram, 
    Copy, ArrowUp, Clock, Terminal, Sparkles, CheckCheck
} from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import { useToast } from '../context/ToastContext';
import vLogo from '../assets/logos/v-logo.png';

const XIcon = ({ size = 15, color = 'currentColor' }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={color} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
);

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const { contact } = portfolioData;
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const { showToast } = useToast();
    const [copied, setCopied] = useState(false);
    const [bengaluruTime, setBengaluruTime] = useState('');

    // Real-time Bengaluru, India (IST) clock
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const options = {
                timeZone: 'Asia/Kolkata',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            };
            setBengaluruTime(new Intl.DateTimeFormat('en-US', options).format(now));
        };
        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const openCommandPalette = () => {
        window.dispatchEvent(new CustomEvent('open-command-palette'));
    };

    const handleCopyEmail = (e) => {
        e.preventDefault();
        navigator.clipboard.writeText(contact.email);
        setCopied(true);
        showToast('Email address copied to clipboard! 📋', 'success');
        setTimeout(() => setCopied(false), 2500);
    };

    const footerSections = [
        {
            title: "Navigation",
            links: [
                { name: "Home", path: "/" },
                { name: "About Me", path: "/about" },
                { name: "Projects", path: "/projects" },
                { name: "Skills & Tech", path: "/skills" },
                { name: "Resume & CV", path: "/resume" }
            ]
        },
        {
            title: "Featured Systems",
            links: [
                { name: "ElevateX Mobile", path: "/projects/elevatex-mobile" },
                { name: "ElevateX Web", path: "/projects/elevatex-web" },
                { name: "ConquerONE", path: "/projects/conquerone" },
                { name: "Developer Portfolio", path: "/projects/portfolio" }
            ]
        },
        {
            title: "Legal & Info",
            links: [
                { name: "Privacy Policy", path: "/privacy" },
                { name: "Terms of Service", path: "/terms" },
                { name: "Testimonials", path: "/testimonials" },
                { name: "Contact Hub", path: "/contact" }
            ]
        }
    ];

    const socialLinks = [
        { icon: Github, href: contact.github, label: 'GitHub' },
        { icon: Linkedin, href: contact.linkedin, label: 'LinkedIn' },
        { icon: Instagram, href: contact.instagram, label: 'Instagram' },
        { icon: XIcon, href: contact.x, label: 'X' }
    ];

    return (
        <motion.footer
            ref={ref}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
                position: 'relative',
                background: 'transparent',
                borderTop: 'none',
                padding: '3rem 0 3rem',
                overflow: 'hidden'
            }}
        >
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 2 }}>
                
                {/* Pre-Footer Editorial Callout Card */}
                <motion.div 
                    className="editorial-card"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    style={{
                        padding: '3.5rem 3rem',
                        marginBottom: '5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2rem',
                        position: 'relative',
                        overflow: 'hidden',
                        background: 'rgba(9, 14, 26, 0.65)',
                        backdropFilter: 'blur(20px)',
                        borderTop: '2px solid #ef4444'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
                        <div style={{ maxWidth: '650px' }}>
                            <div className="editorial-eyebrow-container" style={{ marginBottom: '1rem' }}>
                                <span className="editorial-eyebrow-text">
                                    AVAILABLE FOR 2026 INITIATIVES
                                </span>
                            </div>
                            <h3 style={{ 
                                fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', 
                                fontFamily: 'var(--font-heading)',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                letterSpacing: '-0.02em',
                                color: '#ffffff',
                                margin: '0 0 1rem',
                                lineHeight: 1.15
                            }}>
                                LET'S BUILD <span style={{ color: '#ef4444' }}>HIGH-IMPACT</span> SYSTEMS TOGETHER.
                            </h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>
                                Visionary platforms, high-performance distributed systems, or mobile engineering challenges.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <Link to="/contact" className="editorial-btn-primary">
                                INITIATE CONVERSATION <ArrowUpRight size={15} style={{ marginLeft: '6px' }} />
                            </Link>
                            <button 
                                onClick={openCommandPalette} 
                                className="editorial-badge"
                                style={{ 
                                    padding: '0.75rem 1.25rem', 
                                    cursor: 'pointer', 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '0.6rem',
                                    fontSize: '0.76rem'
                                }}
                                title="Open Command Palette (⌘K)"
                            >
                                <Terminal size={14} />
                                <span>COMMAND MENU</span>
                                <span style={{ fontFamily: 'monospace', opacity: 0.7, marginLeft: '4px' }}>⌘K</span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Main 4-Column Editorial Footer Grid */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
                    gap: '3.5rem 2rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    paddingBottom: '4rem',
                    marginBottom: '2.5rem'
                }}>
                    
                    {/* Brand & Mission Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', textDecoration: 'none' }}>
                            <div style={{
                                width: '36px', height: '36px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                padding: '4px'
                            }}>
                                <img src={vLogo} alt="Vivaswan Shetty Monogram" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                <span style={{ 
                                    fontFamily: 'var(--font-heading)', 
                                    fontWeight: 900, 
                                    fontSize: '1.15rem', 
                                    letterSpacing: '0.1em',
                                    color: '#ffffff',
                                    textTransform: 'uppercase'
                                }}>
                                    VIVASWAN
                                </span>
                                <span className="navbar-logo-dot" />
                            </div>
                        </NavLink>

                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.7, margin: 0 }}>
                            Future Engineering Leader & Full-Stack Systems Architect building high-performance mobile, web, and distributed software systems.
                        </p>

                        {/* Location & Live Clock Badge */}
                        <div className="editorial-time-badge" style={{ padding: '0.45rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'flex-start', fontSize: '0.72rem' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444', display: 'inline-block' }} />
                            <Clock size={12} color="#f8fafc" />
                            <span>BENGALURU, IN (IST):</span>
                            <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>{bengaluruTime || 'Live'}</strong>
                        </div>
                    </div>

                    {/* Navigation, Projects & Legal Columns */}
                    {footerSections.map((column, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ duration: 0.5, delay: 0.2 + idx * 0.08 }}
                        >
                            <h4 style={{ 
                                margin: '0 0 1.25rem', 
                                fontSize: '0.75rem', 
                                fontFamily: 'var(--font-body)',
                                fontWeight: 700, 
                                textTransform: 'uppercase', 
                                letterSpacing: '0.18em', 
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem'
                            }}>
                                <span style={{ color: '#ef4444', fontSize: '0.7rem' }}>0{idx + 1} /</span>
                                {column.title}
                            </h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {column.links.map((link, i) => (
                                    <li key={i}>
                                        <NavLink
                                            to={link.path}
                                            style={{
                                                color: 'var(--text-muted)',
                                                textDecoration: 'none',
                                                fontSize: '0.86rem',
                                                transition: 'all 0.2s ease',
                                                display: 'inline-block'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.color = '#ef4444';
                                                e.currentTarget.style.transform = 'translateX(4px)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.color = 'var(--text-muted)';
                                                e.currentTarget.style.transform = 'translateX(0)';
                                            }}
                                        >
                                            {link.name}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}

                    {/* Connect & Direct Contact Column */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.5, delay: 0.45 }}
                    >
                        <h4 style={{ 
                            margin: '0 0 1.25rem', 
                            fontSize: '0.75rem', 
                            fontFamily: 'var(--font-body)',
                            fontWeight: 700, 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.18em', 
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem'
                        }}>
                            <span style={{ color: '#ef4444', fontSize: '0.7rem' }}>04 /</span>
                            CONNECT & CHANNELS
                        </h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                <Mail size={13} color="#ef4444" />
                                <a 
                                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${contact.email}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ color: '#ffffff', textDecoration: 'none', fontFamily: 'monospace', transition: 'color 0.2s ease' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}
                                >
                                    {contact.email}
                                </a>
                                <button
                                    onClick={handleCopyEmail}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', transition: 'color 0.2s ease' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                                    title="Copy Email Address"
                                >
                                    {copied ? <CheckCheck size={13} color="#34d399" /> : <Copy size={13} />}
                                </button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                <MapPin size={13} color="#ef4444" />
                                <span>Bengaluru, Karnataka, IN</span>
                            </div>
                        </div>

                        {/* Social Buttons */}
                        <div style={{ display: 'flex', gap: '0.65rem' }}>
                            {socialLinks.map((social, i) => (
                                <motion.a
                                    key={i}
                                    href={social.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="editorial-social-btn"
                                    whileHover={{ scale: 1.12, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    title={social.label}
                                >
                                    <social.icon size={16} />
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>

                </div>

                {/* Bottom Sub-Footer Bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1rem'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                            © {currentYear} <strong>Vivaswan Shetty</strong>. Built with precision, React 19 & Vite.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.74rem', color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                            <span className="live-pulse-dot" />
                            <span>ALL SYSTEMS OPERATIONAL</span>
                        </div>
                    </div>

                    <div>
                        <button
                            onClick={scrollToTop}
                            className="editorial-btn-secondary"
                            style={{ fontSize: '0.75rem', cursor: 'pointer' }}
                            title="Scroll smoothly back to top"
                        >
                            <span>BACK TO TOP</span>
                            <ArrowUp size={13} />
                        </button>
                    </div>
                </motion.div>

            </div>
        </motion.footer>
    );
};

export default Footer;