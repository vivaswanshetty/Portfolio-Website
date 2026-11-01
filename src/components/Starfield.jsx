import React from 'react';

const Starfield = () => {
    return (
        <>
            <style>{`
                .starfield-bg {
                    position: fixed;
                    top: 0; 
                    left: 0;
                    width: 100%; 
                    height: 100%;
                    z-index: -4;
                    background: #060709;
                }

                .grid-overlay {
                    position: fixed;
                    top: 0; 
                    left: 0;
                    width: 100%; 
                    height: 100%;
                    z-index: -3;
                    background-image:
                        linear-gradient(rgba(255, 255, 255, 0.012) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255, 255, 255, 0.012) 1px, transparent 1px);
                    background-size: 100px 100px;
                    mask-image: radial-gradient(ellipse at 50% 40%, black 0%, transparent 75%);
                    -webkit-mask-image: radial-gradient(ellipse at 50% 40%, black 0%, transparent 75%);
                    pointer-events: none;
                }
            `}</style>

            <div className="starfield-bg" />
            <div className="grid-overlay" />
        </>
    );
};

export default Starfield;