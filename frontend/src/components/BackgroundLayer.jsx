// frontend/src/components/BackgroundLayer.jsx
import React from 'react';

const BackgroundLayer = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -1,
      background: '#080a12',
      overflow: 'hidden'
    }}>
      {/* Mesh Gradient Blobs */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>
      <div className="blob blob-4"></div>

      <style>{`
        .blob {
          position: absolute;
          width: 800px;
          height: 800px;
          filter: blur(80px);
          border-radius: 50%;
          opacity: 0.15;
          pointer-events: none;
          mix-blend-mode: screen;
        }

        .blob-1 {
          background: radial-gradient(circle, #00ffcc 0%, transparent 70%);
          top: -20%;
          left: -10%;
          animation: drift 25s infinite alternate ease-in-out;
        }

        .blob-2 {
          background: radial-gradient(circle, #3a7bd5 0%, transparent 70%);
          bottom: -10%;
          right: -5%;
          animation: drift 30s infinite alternate-reverse ease-in-out;
        }

        .blob-3 {
          background: radial-gradient(circle, #ff007a 0%, transparent 70%);
          top: 30%;
          right: 10%;
          animation: drift 20s infinite alternate ease-in-out;
          opacity: 0.08;
        }

        .blob-4 {
          background: radial-gradient(circle, #00d2ff 0%, transparent 70%);
          bottom: 20%;
          left: 15%;
          animation: drift 35s infinite alternate-reverse ease-in-out;
          opacity: 0.1;
        }

        @keyframes drift {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(100px, 50px) scale(1.1); }
          100% { transform: translate(-50px, 100px) scale(0.9); }
        }

        /* Subtle Noise Texture */
        ::after {
          content: "";
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: url("https://grainy-gradients.vercel.app/noise.svg");
          opacity: 0.04;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default BackgroundLayer;
