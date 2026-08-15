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
                        iconColor = '#3b82f6';
                        borderColor = 'rgba(59, 130, 246, 0.3)';
                    }

                    return (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                                pointerEvents: 'auto',
                                background: 'rgba(15, 23, 42, 0.85)',
                                backdropFilter: 'blur(16px)',
                                WebkitBackdropFilter: 'blur(16px)',
                                border: `1px solid ${borderColor}`,
                                padding: '0.85rem 1.25rem',
                                borderRadius: '1rem',
                                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(59, 130, 246, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                color: '#f8fafc',
                                fontSize: '0.9rem',
                                fontWeight: 500
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
