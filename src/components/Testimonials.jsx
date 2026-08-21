import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { portfolioData } from '../data/portfolioData';
import { Quote, Star, ExternalLink } from 'lucide-react';
import MagneticWrapper from './MagneticWrapper';

const TestimonialCard = ({ testimonial, index }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    const name = testimonial.name || testimonial.author || 'Collaborator';
    const role = testimonial.role || '';
    const company = testimonial.company || '';
    const content = testimonial.quote || testimonial.content || '';
    const photoUrl = testimonial.photoUrl || null;
    const linkedinUrl = testimonial.linkedinUrl || null;

    // Generate initials (e.g. "Vivaswan Shetty" -> "VS", "Mentor" -> "M")
    const getInitials = (str) => {
        if (!str) return 'C';
        const parts = str.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return str.substring(0, 2).toUpperCase();
    };

    const initials = getInitials(name);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="editorial-card"
            style={{ 
                padding: '2.5rem 2rem', 
                position: 'relative', 
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box'
            }}
            whileHover={{ y: -5, transition: { duration: 0.15, ease: 'easeOut' } }}
        >
            {/* Header: Quote Icon & 5 Star Rating */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '1rem',
                marginBottom: '1.25rem'
            }}>
                <Quote size={24} color="#ef4444" style={{ opacity: 0.8, flexShrink: 0 }} />

                <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} fill="#ef4444" color="#ef4444" style={{ opacity: 0.9 }} />
                    ))}
                </div>
            </div>

            {/* Quote Body */}
            <p style={{ 
                fontFamily: 'var(--font-body)',
                fontSize: '0.96rem', 
                marginBottom: '2rem', 
                lineHeight: 1.8,
                color: 'var(--text-main)',
                flex: 1,
                minHeight: '5rem'
            }}>
                "{content}"
            </p>

            {/* Author Footer */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                marginTop: 'auto'
            }}>
                {photoUrl ? (
                    <img 
                        src={photoUrl} 
                        alt={name}
                        loading="lazy"
                        style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '8px',
                            objectFit: 'cover',
                            border: '1px solid rgba(239, 68, 68, 0.3)'
                        }}
                    />
                ) : (
                    <div style={{
                        width: '42px', 
                        height: '42px', 
                        borderRadius: '8px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.35)',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontWeight: 800, 
                        fontSize: '0.85rem', 
                        color: '#ef4444',
                        fontFamily: 'var(--font-heading)',
                        letterSpacing: '0.05em'
                    }}>
                        {initials}
                    </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                    {linkedinUrl ? (
                        <a 
                            href={linkedinUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ 
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                fontSize: '0.92rem', 
                                marginBottom: '0.2rem', 
                                fontFamily: 'var(--font-heading)',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                color: '#ffffff',
                                textDecoration: 'none',
                                transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}
                        >
                            <span>{name}</span>
                            <ExternalLink size={12} color="#ef4444" />
                        </a>
                    ) : (
                        <h4 style={{ 
                            fontSize: '0.92rem', 
                            marginBottom: '0.2rem', 
                            fontFamily: 'var(--font-heading)',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            color: '#ffffff'
                        }}>
                            {name}
                        </h4>
                    )}

                    <span style={{ 
                        fontSize: '0.74rem', 
                        color: 'var(--text-muted)', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.08em',
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        {role}{company ? ` • ${company}` : ''}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

const Testimonials = () => {
    const { testimonials } = portfolioData;
    const ref = useRef(null);

    // Conditionally render nothing if testimonials array is empty or undefined
    if (!testimonials || testimonials.length === 0) {
        return null;
    }

    return (
        <div className="editorial-page-container" ref={ref}>
            {/* Opening Editorial Header */}
            <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="editorial-page-header"
            >
                <div className="editorial-eyebrow-container" style={{ marginBottom: '0.8rem' }}>
                    <span className="editorial-eyebrow-text">
                        ENDORSEMENTS & COLLABORATIONS.
                    </span>
                </div>
                <h1 className="editorial-page-title">
                    PEER & LEADERSHIP <span style={{ color: '#ef4444' }}>ENDORSEMENTS</span>.
                </h1>
                <p style={{ maxWidth: '600px', color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>
                    Direct feedback from engineering mentors, technical collaborators, and teams I've partnered with.
                </p>
            </motion.div>

            {/* Testimonials Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '2.5rem', maxWidth: '1100px', margin: '0 auto' }}>
                {testimonials.map((testimonial, index) => (
                    <TestimonialCard key={index} testimonial={testimonial} index={index} />
                ))}
            </div>

            {/* Bottom Callout Banner */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="editorial-card"
                style={{
                    textAlign: 'center',
                    padding: '3.5rem 2rem',
                    maxWidth: '850px',
                    margin: '5rem auto 0'
                }}
            >
                <div className="editorial-eyebrow-container" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
                    <span className="editorial-eyebrow-text">
                        COLLABORATION READY
                    </span>
                </div>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)', fontWeight: 800, textTransform: 'uppercase', color: '#ffffff' }}>
                    READY TO BUILD SOMETHING EXTRAORDINARY?
                </h2>
                <p style={{ marginBottom: '2.5rem', maxWidth: '500px', margin: '0 auto 2.5rem', color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.7 }}>
                    Let's discuss technical architecture, system design, and production engineering.
                </p>
                <MagneticWrapper>
                    <Link to="/contact" className="editorial-btn-primary" style={{ padding: '0.9rem 2.2rem', fontSize: '0.85rem' }}>
                        GET IN TOUCH →
                    </Link>
                </MagneticWrapper>
            </motion.div>
        </div>
    );
};

export default Testimonials;