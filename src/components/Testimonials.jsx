import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { portfolioData } from '../data/portfolioData';
import { Quote, Star } from 'lucide-react';

const TestimonialCard = ({ testimonial, index }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    const name = testimonial.name || testimonial.author || 'Collaborator';
    const role = testimonial.role || '';
    const company = testimonial.company || '';
    const content = testimonial.content || testimonial.quote || '';
    const avatarLetter = (name && name.charAt(0)) ? name.charAt(0).toUpperCase() : 'E';

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
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
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                paddingBottom: '1rem',
                marginBottom: '1.5rem'
            }}>
                <Quote size={24} color="#f8fafc" style={{ opacity: 0.6, flexShrink: 0 }} />

                <motion.div
                    style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ delay: 0.3 + index * 0.15 }}
                >
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                            transition={{ delay: 0.4 + i * 0.05 + index * 0.15 }}
                        >
                            <Star size={14} fill="#f8fafc" color="#f8fafc" />
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.3 + index * 0.15 }}
                style={{ 
                    fontFamily: 'var(--font-body)',
                    fontSize: '1rem', 
                    marginBottom: '2rem', 
                    lineHeight: 1.8,
                    color: 'var(--text-main)',
                    flex: 1,
                    minHeight: '5.5rem'
                }}
            >
                "{content}"
            </motion.p>

            <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.4 + index * 0.15 }}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    paddingTop: '1.25rem',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    marginTop: 'auto'
                }}
            >
                <motion.div
                    style={{
                        width: '42px', 
                        height: '42px', 
                        borderRadius: '10px',
                        background: '#f8fafc',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontWeight: 800, 
                        fontSize: '1rem', 
                        color: '#020617',
                        fontFamily: 'var(--font-heading)'
                    }}
                    whileHover={{ scale: 1.08 }}
                >
                    {avatarLetter}
                </motion.div>
                <div>
                    <h4 style={{ 
                        fontSize: '0.95rem', 
                        marginBottom: '0.2rem', 
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        color: '#ffffff'
                    }}>
                        {name}
                    </h4>
                    <span style={{ 
                        fontSize: '0.75rem', 
                        color: 'var(--text-muted)', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.1em' 
                    }}>
                        {role}{company ? ` • ${company}` : ''}
                    </span>
                </div>
            </motion.div>
        </motion.div>
    );
};

const Testimonials = () => {
    const { testimonials } = portfolioData;
    const ref = useRef(null);

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
                    <div className="editorial-eyebrow-rule" />
                </div>
                <h1 className="editorial-page-title">
                    PEER & LEADERSHIP <span style={{ color: '#ef4444' }}>ENDORSEMENTS</span>.
                </h1>
                <p style={{ maxWidth: '600px', color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>
                    Direct feedback from engineering leaders, product collaborators, and teams I've partnered with.
                </p>
            </motion.div>

            {/* Testimonials 2-Column Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2.5rem', maxWidth: '1100px', margin: '0 auto' }}>
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
                    marginTop: '5rem',
                    padding: '4rem 2rem',
                    maxWidth: '850px',
                    margin: '5rem auto 0'
                }}
            >
                <div className="editorial-eyebrow-container" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
                    <span className="editorial-eyebrow-text">
                        COLLABORATION READY
                    </span>
                </div>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)', fontWeight: 800, textTransform: 'uppercase', color: '#ffffff' }}>
                    READY TO BUILD SOMETHING EXTRAORDINARY?
                </h2>
                <p style={{ marginBottom: '2.5rem', maxWidth: '500px', margin: '0 auto 2.5rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    Let's discuss technical architecture, system design, and product delivery.
                </p>
                <motion.div
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ display: 'inline-block' }}
                >
                    <Link to="/contact" className="editorial-btn-primary" style={{ padding: '0.9rem 2.2rem', fontSize: '0.85rem' }}>
                        GET IN TOUCH →
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Testimonials;