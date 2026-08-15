import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Search, Home, User, FolderGit2, Code, FileText, Star, Mail,
    Copy, ExternalLink, ShieldCheck, Scale, X, ArrowRight, CornerDownLeft, Sparkles
} from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import { useToast } from '../context/ToastContext';

const XIcon = ({ size = 16, color = 'currentColor' }) => (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={color} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
);

export const CommandPalette = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const { contact } = portfolioData;

    // Listen for Cmd+K / Ctrl+K and custom event
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            } else if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        const handleCustomOpen = () => setIsOpen(true);

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('open-command-palette', handleCustomOpen);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('open-command-palette', handleCustomOpen);
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    const items = [
        // Navigation
        { id: 'home', category: 'Navigation', title: 'Home', subtitle: 'Return to mission control', icon: Home, action: () => navigate('/') },
        { id: 'about', category: 'Navigation', title: 'About Me', subtitle: 'Background & leadership story', icon: User, action: () => navigate('/about') },
        { id: 'projects', category: 'Navigation', title: 'All Projects', subtitle: 'Browse all case studies & works', icon: FolderGit2, action: () => navigate('/projects') },
        { id: 'skills', category: 'Navigation', title: 'Skills & Tech Stack', subtitle: 'React Native, TypeScript, Node.js', icon: Code, action: () => navigate('/skills') },
        { id: 'resume', category: 'Navigation', title: 'Resume & Experience', subtitle: 'BMSCE, certifications, timeline', icon: FileText, action: () => navigate('/resume') },
        { id: 'testimonials', category: 'Navigation', title: 'Testimonials', subtitle: 'Feedback & quotes', icon: Star, action: () => navigate('/testimonials') },
        { id: 'contact', category: 'Navigation', title: 'Contact', subtitle: 'Get in touch directly', icon: Mail, action: () => navigate('/contact') },
        { id: 'privacy', category: 'Legal & Info', title: 'Privacy Policy', subtitle: 'Data protection & transparency', icon: ShieldCheck, action: () => navigate('/privacy') },
        { id: 'terms', category: 'Legal & Info', title: 'Terms of Service', subtitle: 'Licensing & usage terms', icon: Scale, action: () => navigate('/terms') },

        // Featured Case Studies
        { id: 'case-elevatex-web', category: 'Case Studies', title: 'ElevateX Web Platform', subtitle: 'MERN, Socket.io, Razorpay Escrow Case Study', icon: Sparkles, action: () => navigate('/projects/elevatex-web') },
        { id: 'case-elevatex-mobile', category: 'Case Studies', title: 'ElevateX Mobile App', subtitle: 'React Native, Multiplayer 1v1 Duels Case Study', icon: Smartphone, action: () => navigate('/projects/elevatex-mobile') },
        { id: 'case-conquerone', category: 'Case Studies', title: 'ConquerONE (AI Fitness)', subtitle: 'Gemini AI 6-Model Cascade & Health Connect', icon: Sparkles, action: () => navigate('/projects/conquerone') },
        { id: 'case-portfolio', category: 'Case Studies', title: 'Developer Portfolio', subtitle: 'Cosmic Starfield & Multi-Chromatic System', icon: Sparkles, action: () => navigate('/projects/portfolio') },

        // Quick Actions
        {
            id: 'copy-email',
            category: 'Quick Actions',
            title: 'Copy Email Address',
            subtitle: contact.email,
            icon: Copy,
            action: () => {
                navigator.clipboard.writeText(contact.email);
                showToast('Email copied to clipboard! 📋', 'success');
            }
        },
        {
            id: 'copy-phone',
            category: 'Quick Actions',
            title: 'Copy Phone Number',
            subtitle: contact.phone,
            icon: Copy,
            action: () => {
                navigator.clipboard.writeText(contact.phone);
                showToast('Phone number copied to clipboard! 📱', 'success');
            }
        },

        // External Links
        { id: 'github', category: 'Social Profiles', title: 'GitHub', subtitle: 'Explore open source code', icon: ExternalLink, action: () => window.open(contact.github, '_blank') },
        { id: 'linkedin', category: 'Social Profiles', title: 'LinkedIn', subtitle: 'Connect professionally', icon: ExternalLink, action: () => window.open(contact.linkedin, '_blank') },
        { id: 'instagram', category: 'Social Profiles', title: 'Instagram', subtitle: 'Follow @vivaswan.shetty', icon: ExternalLink, action: () => window.open(contact.instagram, '_blank') },
        { id: 'x', category: 'Social Profiles', title: 'X (Twitter)', subtitle: 'Follow @vivaswanshetty', icon: XIcon, action: () => window.open(contact.x, '_blank') }
    ];

    const filteredItems = items.filter((item) => {
        const q = query.toLowerCase().trim();
        if (!q) return true;
        return (
            item.title.toLowerCase().includes(q) ||
            item.subtitle.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q)
        );
    });

    const handleSelect = (item) => {
        setIsOpen(false);
        item.action();
    };

    const handleKeyDownInList = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
        } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
            e.preventDefault();
            handleSelect(filteredItems[selectedIndex]);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 99999,
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        padding: '12vh 1rem 2rem',
                        background: 'rgba(2, 6, 23, 0.75)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)'
                    }}
                    onClick={() => setIsOpen(false)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '100%',
                            maxWidth: '620px',
                            background: 'rgba(15, 23, 42, 0.95)',
                            border: '1px solid rgba(59, 130, 246, 0.25)',
                            borderRadius: '1.25rem',
                            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(59, 130, 246, 0.15)',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {/* Search Input Bar */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.85rem',
                            padding: '1.2rem 1.4rem',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                            position: 'relative'
                        }}>
                            <Search size={20} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setSelectedIndex(0);
                                }}
                                onKeyDown={handleKeyDownInList}
                                placeholder="Type a command or search (e.g., projects, contact, resume)..."
                                style={{
                                    width: '100%',
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    color: '#fff',
                                    fontSize: '1.05rem',
                                    fontFamily: 'inherit'
                                }}
                            />
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.06)',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    borderRadius: '6px',
                                    padding: '0.3rem 0.5rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                ESC
                            </button>
                        </div>

                        {/* List Items */}
                        <div
                            style={{
                                maxHeight: '380px',
                                overflowY: 'auto',
                                padding: '0.75rem'
                            }}
                        >
                            {filteredItems.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                                    <Sparkles size={28} color="var(--accent-primary)" style={{ margin: '0 auto 0.75rem', opacity: 0.6 }} />
                                    <p style={{ margin: 0, fontSize: '0.95rem' }}>No commands found matching "{query}"</p>
                                </div>
                            ) : (
                                filteredItems.map((item, idx) => {
                                    const isSelected = idx === selectedIndex;
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => handleSelect(item)}
                                            onMouseEnter={() => setSelectedIndex(idx)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '0.75rem 1rem',
                                                borderRadius: '0.75rem',
                                                cursor: 'pointer',
                                                background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                                                border: isSelected ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                                                transition: 'all 0.15s ease'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                                <div style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '8px',
                                                    background: isSelected ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
                                                    color: isSelected ? '#fff' : 'var(--accent-secondary)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'all 0.15s'
                                                }}>
                                                    <item.icon size={16} />
                                                </div>
                                                <div>
                                                    <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600 }}>
                                                        {item.title}
                                                    </div>
                                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                        {item.subtitle}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{
                                                    fontSize: '0.7rem',
                                                    color: 'var(--text-muted)',
                                                    background: 'rgba(255, 255, 255, 0.04)',
                                                    padding: '0.2rem 0.5rem',
                                                    borderRadius: '4px'
                                                }}>
                                                    {item.category}
                                                </span>
                                                {isSelected && <CornerDownLeft size={14} color="var(--accent-primary)" />}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer Hints */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.75rem 1.25rem',
                            background: 'rgba(2, 6, 23, 0.6)',
                            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)'
                        }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <span>↑↓ Navigate</span>
                                <span>↵ Select</span>
                                <span>Esc Close</span>
                            </div>
                            <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                                Vivaswan's Portfolio.
                            </span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CommandPalette;
