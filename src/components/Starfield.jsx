import React, { useEffect, useState, useRef } from 'react';

const Starfield = () => {
    const [scrollY, setScrollY] = useState(0);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const rafRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (rafRef.current) return;
            rafRef.current = requestAnimationFrame(() => {
                setScrollY(window.scrollY);
                rafRef.current = null;
            });
        };

        const handleMouseMove = (e) => {
            setMousePos({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('mousemove', handleMouseMove, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <>
            <style>{`
                .starfield-bg {
                    position: fixed;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    z-index: -4;
                    background:
                        radial-gradient(ellipse at 20% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
                        radial-gradient(ellipse at 80% 20%, rgba(139, 92, 246, 0.06) 0%, transparent 50%),
                        radial-gradient(ellipse at 50% 50%, rgba(96, 165, 250, 0.03) 0%, transparent 70%),
                        linear-gradient(180deg, #020617 0%, #0f172a 50%, #1e293b 100%);
                }

                .grid-overlay {
                    position: fixed;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    z-index: -3;
                    background-image:
                        linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px);
                    background-size: 80px 80px;
                    mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
                    -webkit-mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
                }

                .floating-orb {
                    position: fixed;
                    border-radius: 50%;
                    z-index: -2;
                    transition: transform 0.3s ease-out;
                }

                .orb-1 {
                    width: 500px; height: 500px;
                    background: radial-gradient(circle, rgba(59, 130, 246, 0.25), transparent 70%);
                    top: 5%; left: -15%;
                    filter: blur(100px);
                    opacity: 0.5;
                }

                .orb-2 {
                    width: 400px; height: 400px;
                    background: radial-gradient(circle, rgba(139, 92, 246, 0.2), transparent 70%);
                    bottom: 15%; right: -10%;
                    filter: blur(80px);
                    opacity: 0.4;
                }

                .orb-3 {
                    width: 300px; height: 300px;
                    background: radial-gradient(circle, rgba(96, 165, 250, 0.15), transparent 70%);
                    top: 40%; left: 55%;
                    filter: blur(60px);
                    opacity: 0.3;
                }

                .parallax-layer {
                    position: fixed;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    pointer-events: none;
                    z-index: -1;
                }

                .parallax-line {
                    position: absolute;
                    width: 1px;
                    background: linear-gradient(180deg, transparent, rgba(59, 130, 246, 0.2), transparent);
                    transform-origin: top center;
                }

                .parallax-glow {
                    position: fixed;
                    width: 600px;
                    height: 600px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 60%);
                    filter: blur(80px);
                    z-index: -1;
                    pointer-events: none;
                }

                @keyframes orb-float {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -40px) scale(1.08); }
                    66% { transform: translate(-15px, 25px) scale(0.95); }
                }

                @keyframes float-slow {
                    0%, 100% { transform: translate(0, 0); }
                    50% { transform: translate(20px, -20px); }
                }
            `}</style>

            <div className="starfield-bg" />
            <div className="grid-overlay" />

            <div
                className="floating-orb orb-1"
                style={{
                    transform: `translate(${mousePos.x * 0.3}px, ${-scrollY * 0.1}px) translateY(calc(var(--scroll-offset, 0px)))`,
                }}
            />
            <div
                className="floating-orb orb-2"
                style={{
                    transform: `translate(${-mousePos.x * 0.2}px, ${scrollY * 0.15}px)`,
                }}
            />
            <div
                className="floating-orb orb-3"
                style={{
                    transform: `translate(${mousePos.x * 0.4}px, ${-scrollY * 0.08}px)`,
                }}
            />

            <div className="parallax-layer">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="parallax-line"
                        style={{
                            left: `${10 + i * 12}%`,
                            height: `${150 + (i % 3) * 100}px`,
                            top: `${20 + (i % 4) * 15}%`,
                            opacity: 0.15 + (i % 3) * 0.05,
                            transform: `translateY(${scrollY * (0.02 + i * 0.01)}px)`,
                            animation: `float-slow ${6 + i}s ease-in-out infinite`,
                            animationDelay: `${i * 0.5}s`
                        }}
                    />
                ))}
            </div>

            <div
                className="parallax-glow"
                style={{
                    top: `${20 - scrollY * 0.05}%`,
                    left: `${50 + mousePos.x * 0.3}%`,
                    transform: `translate(-50%, -50%) translate(${mousePos.x}px, ${mousePos.y * 0.5}px)`,
                }}
            />
        </>
    );
};

export default Starfield;