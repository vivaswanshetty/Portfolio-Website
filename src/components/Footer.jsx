import React, { useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Github, Linkedin, Mail, MapPin, ArrowUpRight } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const { contact } = portfolioData;
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    const footerLinks = [
        {
            title: "Navigation",
            links: [
                { name: "Home", path: "/" },
                { name: "About", path: "/about" },
                { name: "Contact", path: "/contact" }
            ]
        },
        {
            title: "Work",
            links: [
                { name: "Projects", path: "/projects" },
                { name: "Resume", path: "/resume" },
                { name: "Skills", path: "/skills" }
            ]
        }
    ];

    const socialLinks = [
        { icon: Github, href: contact.github, label: 'GitHub' },
        { icon: Linkedin, href: contact.linkedin, label: 'LinkedIn' }
    ];

    return (
        <motion.footer
            ref={ref}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
                background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.1) 0%, rgba(2, 6, 23, 0.95) 100%)',
                borderTop: '1px solid rgba(59, 130, 246, 0.12)',
                padding: '6rem 0 3rem',
                marginTop: 'auto',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Ambient background glow */}
            <div style={{
                position: 'absolute',
                bottom: '-50px',
                left: '10%',
                width: '450px',
                height: '250px',
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)',
                filter: 'blur(80px)',
                pointerEvents: 'none',
                zIndex: 1
            }} />

            <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                <div className="footer-grid">
                    <div>
                        <NavLink to="/" className="navbar-logo" style={{ fontSize: '1.6rem', marginBottom: '1.5rem', display: 'inline-block' }}>
                            VIVASWAN
                        </NavLink>
                        <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, maxWidth: '280px', fontSize: '0.95rem' }}>
                            Building solutions that matter through innovation and engineering excellence.
                        </p>
                    </div>

                    {footerLinks.map((column, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}
                        >
                            <h4 style={{ marginBottom: '1.5rem', fontSize: '0.95rem', color: 'white', fontWeight: 600, letterSpacing: '0.05em' }}>{column.title}</h4>
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {column.links.map((link, i) => (
                                    <li key={i}>
                                        <NavLink
                                            to={link.path}
                                            className="footer-link"
                                        >
                                            {link.name}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <h4 style={{ marginBottom: '1.5rem', fontSize: '0.95rem', color: 'white', fontWeight: 600, letterSpacing: '0.05em' }}>Connect</h4>
                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                <Mail size={15} color="var(--accent-primary)" />
                                <span>{contact.email}</span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                <MapPin size={15} color="var(--accent-primary)" />
                                <a 
                                    href="https://www.google.com/maps/search/?api=1&query=Bengaluru%2C+India"
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ color: 'inherit', transition: 'color 0.25s ease', textDecoration: 'none' }}
                                    onMouseEnter={(e) => e.target.style.color = 'white'}
                                    onMouseLeave={(e) => e.target.style.color = 'inherit'}
                                >
                                    Bengaluru, India
                                </a>
                            </li>
                        </ul>

                        <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.8rem' }}>
                            {socialLinks.map((social, i) => (
                                <motion.a
                                    key={i}
                                    href={social.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="footer-social-btn"
                                    whileHover={{ y: -3, scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <social.icon size={16} />
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    style={{
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        paddingTop: '2rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1.5rem'
                    }}
                >
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                        © {currentYear} Vivaswan Shetty. All rights reserved.
                    </p>
                    <NavLink
                        to="/contact"
                        className="footer-work-together-btn"
                    >
                        Let's work together <ArrowUpRight size={14} />
                    </NavLink>
                </motion.div>
            </div>
        </motion.footer>
    );
};

export default Footer;