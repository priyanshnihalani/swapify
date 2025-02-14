import React from 'react';

function LoaderAnimation() {
    const styles = {
        animationStyles: `
      @keyframes typing1 {
        0%, 1% { clip-path: inset(0 100% 0 0); opacity: 0; }
        2% { clip-path: inset(0 100% 0 0); opacity: 1; }
        7% { clip-path: inset(0 0 0 0); opacity: 1; }
        28% { clip-path: inset(0 0 0 0); opacity: 1; }
        31% { clip-path: inset(0 0 0 0); opacity: 0; }
        33.33%, 100% { clip-path: inset(0 100% 0 0); opacity: 0; }
      }
      @keyframes typing2 {
        0%, 33.33% { clip-path: inset(0 100% 0 0); opacity: 0; }
        35.33% { clip-path: inset(0 100% 0 0); opacity: 1; }
        40.33% { clip-path: inset(0 0 0 0); opacity: 1; }
        61.33% { clip-path: inset(0 0 0 0); opacity: 1; }
        64.33% { clip-path: inset(0 0 0 0); opacity: 0; }
        66.66%, 100% { clip-path: inset(0 100% 0 0); opacity: 0; }
      }
      @keyframes typing3 {
        0%, 66.66% { clip-path: inset(0 100% 0 0); opacity: 0; }
        68.66% { clip-path: inset(0 100% 0 0); opacity: 1; }
        73.66% { clip-path: inset(0 0 0 0); opacity: 1; }
        94.66% { clip-path: inset(0 0 0 0); opacity: 1; }
        97.66% { clip-path: inset(0 0 0 0); opacity: 0; }
        100% { clip-path: inset(0 100% 0 0); opacity: 0; }
      }
      @keyframes cursor {
        0%, 100% { border-right-color: rgba(37, 37, 53, 0.75); }
        50% { border-right-color: transparent; }
      }
    `,
        text: {
            fontFamily: 'monospace',
            fontSize: '10px',
            fontWeight: 'bold',
            borderRight: '3px solid',
            animation: 'cursor 0.8s infinite ease-in-out',
            paddingRight: '4px'
        },
        word1: {
            animation: 'typing1 4.0s infinite cubic-bezier(0.4, 0.0, 0.2, 1)'
        },
        word2: {
            animation: 'typing2 4.0s infinite cubic-bezier(0.4, 0.0, 0.2, 1)'
        },
        word3: {
            animation: 'typing3 4.0s infinite cubic-bezier(0.4, 0.0, 0.2, 1)'
        }
    };

    return (
        <div className="loader-container flex min-h-screen">
            <style>{styles.animationStyles}</style>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100">
                <defs>
                    <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: '#252535' }} />
                        <stop offset="100%" style={{ stopColor: '#6C6C9B' }} />
                    </linearGradient>
                </defs>
                <g style={styles.word1}>
                    <text
                        x="150"
                        y="50"
                        textAnchor="middle"
                        style={{ ...styles.text, fill: 'url(#primaryGradient)' }}
                    >
                        Connect...
                    </text>
                </g>

                <g style={styles.word2}>
                    <text
                        x="150"
                        y="50"
                        textAnchor="middle"
                        style={{ ...styles.text, fill: 'url(#primaryGradient)' }}
                    >
                        Learn...
                    </text>
                </g>
                <g style={styles.word3}>
                    <text
                        x="150"
                        y="50"
                        textAnchor="middle"
                        style={{ ...styles.text, fill: 'url(#primaryGradient)' }}
                    >
                        Teach...
                    </text>
                </g>
                
            </svg>
        </div>
    );
};

export default LoaderAnimation;