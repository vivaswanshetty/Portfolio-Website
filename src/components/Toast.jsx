import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const ToastContainer = () => {
    const { toasts, removeToast } = useToast();

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '2rem',
                right: '2rem',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                pointerEvents: 'none',
                maxWidth: 'calc(100vw - 4rem)'
            }}
        >
            <AnimatePresence>
                {toasts.map((toast) => {
                    let Icon = CheckCircle2;
                    let iconColor = '#22c55e';
                    let borderColor = 'rgba(34, 197, 94, 0.3)';

                    if (toast.type === 'error') {
                        Icon = AlertCircle;
                        iconColor = '#ef4444';
                        borderColor = 'rgba(239, 68, 68, 0.3)';
                    } else if (toast.type === 'info') {
                        Icon = Info;
                        iconColor = '#ef4444';
                        borderColor = 'rgba(239, 68, 68, 0.4)';
                    }

                    return (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                                pointerEvents: 'auto',
                                background: 'rgba(3, 7, 18, 0.92)',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                border: `1px solid ${borderColor}`,
                                borderLeft: `3px solid ${iconColor}`,
                                padding: '0.85rem 1.25rem',
                                borderRadius: 0,
                                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.8), 0 0 20px rgba(239, 68, 68, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                color: '#f8fafc',
                                fontSize: '0.85rem',
                                fontFamily: 'var(--font-body)',
                                fontWeight: 600,
                                letterSpacing: '0.04em',
                                textTransform: 'uppercase'
                            }}
                        >
                            <Icon size={18} color={iconColor} style={{ flexShrink: 0 }} />
                            <span>{toast.message}</span>
                            <button
                                onClick={() => removeToast(toast.id)}
                                style={{
                                    marginLeft: '0.5rem',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0.2rem',
                                    borderRadius: '4px',
                                    transition: 'color 0.2s'
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                                aria-label="Dismiss toast"
                            >
                                <X size={14} />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

export default ToastContainer;
