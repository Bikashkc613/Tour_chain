// frontend/src/pages/ScanPage.jsx
import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { useWallet } from '@solana/wallet-adapter-react'
import axios from 'axios'
import BackgroundLayer from '../components/BackgroundLayer'

export default function ScanPage() {
  const { publicKey } = useWallet()
  const [result, setResult] = useState(null)
  const [isScanning, setIsScanning] = useState(true)
  const [scanningStatus, setScanningStatus] = useState('System Online')
  const [showHUD, setShowHUD] = useState(false)
  const scannerRef = useRef(null)

  useEffect(() => {
    // Staggered Entrance Animation
    setTimeout(() => setShowHUD(true), 100)

    const scanner = new Html5Qrcode('qr-reader')
    scannerRef.current = scanner

    scanner.start(
      { facingMode: 'environment' },
      { 
        fps: 30, 
        qrbox: (viewWidth, viewHeight) => {
          return { width: viewWidth * 0.7, height: viewWidth * 0.7 }
        }
      },
      async (decodedText) => {
        setIsScanning(false)
        setScanningStatus('Authenticating Gateway...')
        
        if (!publicKey) {
          setResult({ error: 'Auth Required: Connect Wallet' })
          scanner.stop()
          return
        }

        try {
          const res = await axios.post('http://localhost:3001/api/visits/verify-visit', {
            qrData: decodedText,
            walletAddress: publicKey.toString()
          })
          setResult({ success: true, message: res.data.message })
          setScanningStatus('Access Verified')
        } catch (err) {
          const errorMsg = err.response?.data?.error || err.message || 'Verification Error';
          setResult({ error: errorMsg })
          setScanningStatus('Gateway Rejected')
        } finally {
          scanner.stop()
        }
      },
      (err) => {}
    ).catch(e => {
        setScanningStatus('Hardware Unavailable')
        console.error(e)
    })

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [publicKey])

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      color: '#fff',
      fontFamily: "'Outfit', 'Inter', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      <BackgroundLayer />

      <div style={{ 
        zIndex: 1, 
        textAlign: 'center', 
        maxWidth: 500, 
        width: '100%',
        opacity: showHUD ? 1 : 0,
        transform: `translateY(${showHUD ? 0 : '30px'})`,
        transition: 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)'
      }}>
        <div style={{ marginBottom: 40 }}>
            <span style={{ 
                border: '1px solid rgba(0, 255, 204, 0.3)', 
                padding: '6px 16px', 
                borderRadius: 100, 
                fontSize: 12, 
                fontWeight: 800, 
                letterSpacing: 2, 
                textTransform: 'uppercase',
                background: 'rgba(0, 255, 204, 0.05)',
                color: '#00ffcc'
            }}>
                Secure Protocol
            </span>
            <h2 style={{ 
                fontSize: '3.5rem', 
                fontWeight: 900, 
                marginTop: 16,
                marginBottom: 8, 
                letterSpacing: '-0.05em',
                background: 'linear-gradient(to right, #fff, #00ffcc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}>
                Digital Gateway
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem', fontWeight: 500 }}>Align your badge to unlock mountain rewards.</p>
        </div>

        {/* Tactical HUD Scanner */}
        <div style={{ 
          position: 'relative',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(30px)',
          borderRadius: 50,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: 30,
          boxShadow: '0 40px 100px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(255,255,255,0.02)',
          marginBottom: 40
        }}>
          {/* Decorative Corner Rings */}
          <div className="hud-ring"></div>

          {/* Scanner Area */}
          <div style={{ 
            position: 'relative',
            width: '100%',
            aspectRatio: '1',
            borderRadius: 32,
            overflow: 'hidden',
            background: '#000',
            border: '2px solid rgba(0, 255, 204, 0.1)'
          }}>
            <div id="qr-reader" style={{ width: '100%', height: '100%' }}></div>
            
            {/* Cinematic HUD Overlay */}
            {isScanning && (
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                 {/* Precision Grid */}
                 <div style={{ 
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundImage: 'linear-gradient(rgba(0,255,204,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,204,0.05) 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                 }}></div>

                 {/* Sweeping Laser */}
                 <div className="laser-sweep"></div>
                 
                 {/* Digital Scope */}
                 <div style={{ position: 'absolute', top: '25%', left: '25%', right: '25%', bottom: '25%', border: '1px solid rgba(0,255,204,0.2)', borderRadius: 20 }}></div>
                 <div className="corner-bracket tr"></div>
                 <div className="corner-bracket tl"></div>
                 <div className="corner-bracket br"></div>
                 <div className="corner-bracket bl"></div>
              </div>
            )}
          </div>

          {/* Real-time Status */}
          <div style={{ 
            marginTop: 30, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '0 10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ 
                width: 12, height: 12, borderRadius: '2px', background: isScanning ? '#00ffcc' : '#ff3b30',
                boxShadow: isScanning ? '0 0 15px #00ffcc' : 'none',
                animation: isScanning ? 'pulseHUD 1s infinite' : 'none',
                transform: 'rotate(45deg)'
              }}></div>
              <span style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.7)' }}>{scanningStatus}</span>
            </div>
            {!isScanning && (
                <button 
                  onClick={() => window.location.reload()} 
                  style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    color: '#fff', 
                    padding: '10px 24px', 
                    borderRadius: 16, 
                    fontSize: 11, 
                    fontWeight: 800, 
                    letterSpacing: 1, 
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => { e.target.style.background = '#fff'; e.target.style.color = '#000'; }}
                  onMouseLeave={(e) => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.color = '#fff'; }}
                >
                    System Reboot
                </button>
            )}
          </div>
        </div>

        {/* Holographic Result Modal */}
        {result && (
          <div style={{ 
            padding: 40, 
            borderRadius: 40,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(40px)',
            border: `1px solid ${result.success ? 'rgba(0,255,204,0.3)' : 'rgba(255,59,48,0.3)'}`,
            boxShadow: result.success ? '0 30px 80px rgba(0,255,204,0.15)' : '0 30px 80px rgba(255,59,48,0.15)',
            animation: 'modalIn 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28)'
          }}>
            <div style={{ 
                fontSize: '2rem', fontWeight: 900, marginBottom: 16, 
                color: result.success ? '#00ffcc' : '#ff3b30'
            }}>
                {result.success ? 'Gateway Unlocked' : 'Access Restricted'}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: 32 }}>{result.message || result.error}</p>
            {result.success && (
                <button 
                  className="glow-button"
                  onClick={() => window.location.href='/nfts'}
                >
                    Acquire Achievement
                </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes laserSweep {
          0% { transform: translateY(-100%); opacity: 0; }
          40% { opacity: 0.8; }
          60% { opacity: 0.8; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        @keyframes pulseHUD {
          0% { opacity: 0.4; transform: rotate(45deg) scale(0.8); }
          50% { opacity: 1; transform: rotate(45deg) scale(1.1); }
          100% { opacity: 0.4; transform: rotate(45deg) scale(0.8); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.9) translateY(40px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes ringRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .laser-sweep {
          position: absolute; top: 0; left: 0; width: 100%; height: 60px;
          background: linear-gradient(to bottom, transparent, rgba(0, 255, 204, 0.4), transparent);
          box-shadow: 0 0 20px rgba(0, 255, 204, 0.2);
          animation: laserSweep 2s ease-in-out infinite;
        }
        .hud-ring {
          position: absolute; top: -20px; right: -20px; width: 120px; height: 120px;
          border: 1px dashed rgba(255,255,255,0.1); border-radius: 50%;
          animation: ringRotate 20s linear infinite; pointer-events: none;
        }
        .corner-bracket { position: absolute; width: 30px; height: 30px; border-color: #00ffcc; border-style: solid; }
        .corner-bracket.tl { top: 20px; left: 20px; border-width: 2px 0 0 2px; }
        .corner-bracket.tr { top: 20px; right: 20px; border-width: 2px 2px 0 0; }
        .corner-bracket.bl { bottom: 20px; left: 20px; border-width: 0 0 2px 2px; }
        .corner-bracket.br { bottom: 20px; right: 20px; border-width: 0 2px 2px 0; }
        .glow-button {
          background: #fff; color: #000; border: none; padding: 18px 48px; border-radius: 20px;
          font-size: 14px; font-weight: 900; letter-spacing: 1px; cursor: pointer;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          box-shadow: 0 0 30px rgba(0, 255, 204, 0.2);
        }
        .glow-button:hover { transform: scale(1.05); box-shadow: 0 0 50px rgba(0, 255, 204, 0.4); }
        #qr-reader-results { display: none !important; }
        #qr-reader__dashboard { background: transparent !important; border: none !important; padding: 0 !important; }
        #qr-reader video { border-radius: 30px !important; object-fit: cover !important; }
      `}</style>
    </div>
  )
}