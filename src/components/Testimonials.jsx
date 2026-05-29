import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { portfolioData } from '../data/portfolioData';
import { Quote, Star } from 'lucide-react';

const TestimonialCard = ({ testimonial, index }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="card"
            style={{ padding: '2.5rem', position: 'relative', overflow: 'hidden' }}
            whileHover={{ y: -5, transition: { duration: 0.15, ease: 'easeOut' } }}
        >
            <motion.div
                style={{
                    position: 'absolute',
                    top: '-30px',
                    right: '-30px',
                    width: '120px',
                    height: '120px',
                    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1), transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(20px)'
                }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
            />

            <Quote size={32} color="var(--accent-primary)" style={{ marginBottom: '1.5rem', opacity: 0.3 }} />

            <motion.div
                style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem' }}
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
                        <Star size={16} fill="var(--accent-primary)" color="var(--accent-primary)" />
                    </motion.div>
                ))}
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.3 + index * 0.15 }}
                style={{ fontStyle: 'italic', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: 1.7 }}
            >
                "{testimonial.content}"
            </motion.p>

            <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.4 + index * 0.15 }}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid rgba(255,255,255,0.1)'
                }}
            >
                <motion.div
                    style={{
                        width: '50px', height: '50px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', fontSize: '1.2rem', color: 'white'
                    }}
                    whileHover={{ scale: 1.1 }}
                >
                    {testimonial.name.charAt(0)}
                </motion.div>
                <div>
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{testimonial.name}</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)' }}>{testimonial.role}</span>
                </div>
            </motion.div>
        </motion.div>
    );
};

const Testimonials = () => {
    const { testimonials } = portfolioData;
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <div className="page-container" ref={ref}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{ textAlign: 'center', marginBottom: '4rem' }}
            >
                <span style={{
                    display: 'inline-block',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                    color: 'var(--accent-primary)',
                    marginBottom: '1rem',
                    fontWeight: 600
                }}>
                    Testimonials
                </span>
                <h1 style={{ marginBottom: '1rem' }}>What People Say</h1>
                <p style={{ maxWidth: '500px', margin: '0 auto' }}>
                    Feedback from colleagues and collaborators.
                </p>
            </motion.div>

            <div className="grid grid-2" style={{ gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
                {testimonials.map((testimonial, index) => (
                    <TestimonialCard key={index} testimonial={testimonial} index={index} />
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{
                    textAlign: 'center',
                    marginTop: '5rem',
                    padding: '4rem',
                    background: 'rgba(15, 23, 42, 0.5)',
                    borderRadius: '1.5rem',
                    border: '1px solid rgba(59, 130, 246, 0.1)',
                    maxWidth: '800px',
                    margin: '5rem auto 0'
                }}
            >
                <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Ready to work together?</h2>
                <p style={{ marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
                    Let's create something amazing.
                </p>
                <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ display: 'inline-block' }}
                >
                    <Link to="/contact" className="btn btn-primary">
                        Get in Touch
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Testimonials;