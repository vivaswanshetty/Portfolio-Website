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

const XIcon = ({ size = 16, color = 'currentColor' }) => (
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
        { icon: Github, href: contact.github, label: 'GitHub', color: '#38bdf8' },
        { icon: Linkedin, href: contact.linkedin, label: 'LinkedIn', color: '#60a5fa' },
        { icon: Instagram, href: contact.instagram, label: 'Instagram', color: '#f43f5e' },
        { icon: XIcon, href: contact.x, label: 'X', color: '#c084fc' }
    ];

    return (
        <motion.footer
            ref={ref}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="site-footer"
        >
            {/* Ambient Background Cosmic Glows */}
            <div className="footer-ambient-glow glow-1" />
            <div className="footer-ambient-glow glow-2" />

            <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                
                {/* Pre-Footer Hero CTA Card */}
                <motion.div 
                    className="footer-cta-card"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="footer-cta-content">
                        <div className="footer-cta-badge">
                            <span className="live-pulse-dot" /> Available for High-Impact Engineering Roles
                        </div>
                        <h3 className="footer-cta-title">
                            Let's Build Something <span className="gradient-text-azure">Extraordinary</span> Together
                        </h3>
                        <p className="footer-cta-desc">
                            Have a visionary product, innovative system, or engineering challenge? Let's connect and build scalable, high-performance solutions.
                        </p>
                    </div>
                    <div className="footer-cta-actions">
                        <Link to="/contact" className="btn btn-primary footer-cta-primary-btn">
                            Initiate Conversation <ArrowUpRight size={16} />
                        </Link>
                        <button 
                            onClick={openCommandPalette} 
                            className="footer-cmd-trigger-btn"
                            title="Open Command Palette (⌘K)"
                        >
                            <Terminal size={14} />
                            <span>Quick Menu</span>
                            <span className="footer-cmd-badge">⌘K</span>
                        </button>
                    </div>
                </motion.div>

                {/* Main 4-Column Footer Grid */}
                <div className="footer-main-grid">
                    
                    {/* Brand & Mission Column */}
                    <div className="footer-brand-column">
                        <NavLink to="/" className="footer-brand-link">
                            <div className="footer-logo-box">
                                <img src={vLogo} alt="Vivaswan Shetty Monogram" className="footer-logo-img" />
                            </div>
                            <span className="footer-logo-title">
                                VIVASWAN <span className="footer-logo-dot">•</span>
                            </span>
                        </NavLink>

                        <p className="footer-brand-bio">
                            Future Engineering Leader & Full-Stack Systems Architect building high-performance mobile, web, and distributed software systems.
                        </p>

                        {/* Location & Live Clock Badge */}
                        <div className="footer-meta-pill">
                            <Clock size={13} color="#38bdf8" />
                            <span>Bengaluru, IN (IST):</span>
                            <strong style={{ color: '#fff', fontFamily: 'monospace' }}>{bengaluruTime || 'Live'}</strong>
                        </div>
                    </div>

                    {/* Navigation, Projects & Legal Columns */}
                    {footerSections.map((column, idx) => (
                        <motion.div
                            key={idx}
                            className="footer-nav-column"
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ duration: 0.5, delay: 0.2 + idx * 0.08 }}
                        >
                            <h4 className="footer-column-heading">{column.title}</h4>
                            <ul className="footer-links-list">
                                {column.links.map((link, i) => (
                                    <li key={i}>
                                        <NavLink
                                            to={link.path}
                                            className="footer-nav-link"
                                        >
                                            <span className="footer-link-text">{link.name}</span>
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}

                    {/* Connect & Direct Contact Column */}
                    <motion.div
                        className="footer-connect-column"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.5, delay: 0.45 }}
                    >
                        <h4 className="footer-column-heading">Connect & Socials</h4>
                        <ul className="footer-connect-list">
                            <li>
                                <div className="footer-email-box">
                                    <Mail size={14} color="var(--accent-azure)" style={{ flexShrink: 0 }} />
                                    <a 
                                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${contact.email}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="footer-email-link"
                                        title="Open Gmail Composer"
                                    >
                                        {contact.email}
                                    </a>
                                    <button
                                        onClick={handleCopyEmail}
                                        className="footer-copy-btn"
                                        title="Copy Email Address"
                                    >
                                        {copied ? <CheckCheck size={13} color="#22c55e" /> : <Copy size={13} />}
                                    </button>
                                </div>
                            </li>
                            <li>
                                <a 
                                    href="https://www.google.com/maps/search/?api=1&query=Bengaluru%2C+India"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="footer-location-link"
                                >
                                    <MapPin size={14} color="var(--accent-azure)" style={{ flexShrink: 0 }} />
                                    <span>Bengaluru, Karnataka, India</span>
                                </a>
                            </li>
                        </ul>

                        {/* Social Buttons */}
                        <div className="footer-social-row">
                            {socialLinks.map((social, i) => (
                                <motion.a
                                    key={i}
                                    href={social.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="footer-social-circle"
                                    whileHover={{ y: -4, scale: 1.1 }}
                                    whileTap={{ scale: 0.92 }}
                                    title={social.label}
                                    style={{ '--social-hover-color': social.color }}
                                >
                                    <social.icon size={16} />
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>

                </div>

                {/* Bottom Sub-Footer Bar */}
                <motion.div
                    className="footer-bottom-bar"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                >
                    <div className="footer-bottom-left">
                        <p className="footer-copyright">
                            © {currentYear} <strong>Vivaswan Shetty</strong>. Built with precision, React 19 & Vite.
                        </p>
                        <div className="footer-system-status">
                            <span className="footer-status-dot" />
                            <span>All Systems Operational</span>
                        </div>
                    </div>

                    <div className="footer-bottom-right">
                        <button
                            onClick={scrollToTop}
                            className="footer-scroll-top-btn"
                            title="Scroll smoothly back to top"
                        >
                            <span>Back to top</span>
                            <div className="footer-scroll-arrow-box">
                                <ArrowUp size={14} />
                            </div>
                        </button>
                    </div>
                </motion.div>

            </div>
        </motion.footer>
    );
};

export default Footer;