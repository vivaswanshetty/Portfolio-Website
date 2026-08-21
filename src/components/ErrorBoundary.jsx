import React, { Component } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Unhandled runtime error captured by ErrorBoundary:', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '80vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '3rem 1.5rem',
                    textAlign: 'center',
                    position: 'relative',
                    zIndex: 20
                }}>
                    <div style={{
                        maxWidth: '560px',
                        background: 'rgba(9, 14, 26, 0.75)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '1.25rem',
                        padding: '3rem 2rem',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(239, 68, 68, 0.15)'
                    }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.75rem',
                            color: '#ef4444'
                        }}>
                            <AlertTriangle size={28} />
                        </div>

                        <div className="editorial-eyebrow-container" style={{ alignItems: 'center', marginBottom: '0.8rem' }}>
                            <span className="editorial-eyebrow-text" style={{ color: '#ef4444' }}>
                                SYSTEM EXCEPTION CAUGHT.
                            </span>
                            <div className="editorial-eyebrow-rule" style={{ backgroundColor: '#ef4444' }} />
                        </div>

                        <h2 style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            letterSpacing: '-0.02em',
                            color: '#ffffff',
                            margin: '0 0 1rem'
                        }}>
                            SOMETHING WENT <span style={{ color: '#ef4444' }}>WRONG</span>.
                        </h2>

                        <p style={{
                            color: 'var(--text-muted)',
                            fontSize: '0.92rem',
                            lineHeight: 1.7,
                            marginBottom: '2.25rem'
                        }}>
                            This page encountered an unexpected runtime exception. You can refresh the current view or return to the homepage.
                        </p>

                        <div style={{
                            display: 'flex',
                            gap: '0.85rem',
                            justifyContent: 'center',
                            flexWrap: 'wrap'
                        }}>
                            <button
                                onClick={this.handleReload}
                                className="editorial-btn-primary"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                            >
                                <RotateCcw size={14} /> RELOAD VIEW
                            </button>

                            <button
                                onClick={this.handleReset}
                                className="editorial-btn-secondary"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                            >
                                <Home size={14} /> BACK TO HOME
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
