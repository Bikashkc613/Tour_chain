import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { useWallet } from '@solana/wallet-adapter-react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function ScanPage() {
  const { publicKey } = useWallet()
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const scannerRef = useRef(null)
  const fileInputRef = useRef(null)
  const initializationRef = useRef(false)

  useEffect(() => {
    if (!initializationRef.current) {
        scannerRef.current = new Html5Qrcode('qr-reader')
        initializationRef.current = true
        startLivingFeed()
    }
    
    return () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(() => {})
        }
    }
  }, [])

  const startLivingFeed = async () => {
    if (!scannerRef.current) return
    setIsCameraActive(true) 
    try {
        await scannerRef.current.start(
            { facingMode: 'environment' },
            { fps: 20, qrbox: { width: 250, height: 250 } },
            onDataCaptured,
            () => {} 
        )
    } catch (err) {
        console.error("Camera failed:", err)
        setIsCameraActive(false)
    }
  }

  const stopLivingFeed = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
        try { await scannerRef.current.stop() } catch (e) {}
    }
  }

  const onDataCaptured = async (decodedText) => {
    await stopLivingFeed()
    processVisit(decodedText)
  }

  const processVisit = async (qrData) => {
    setLoading(true)
    if (!publicKey) {
        setResult({ error: 'Please connect your wallet first.' })
        setLoading(false)
        return
    }

    try {
        const res = await axios.post('http://localhost:3001/api/visits/verify-visit', {
            qrData,
            walletAddress: publicKey.toString()
        })
        setResult({ 
          success: true, 
          message: res.data.message, 
          tx: res.data.solanaTx,
          shareUrl: `https://dial.to/?action=solana-action:http://localhost:3001/api/actions/share-visit/${res.data.visitId}`
        })
    } catch (err) {
        setResult({ error: err.response?.data?.error || 'Verification Error' })
    } finally {
        setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} className="animate-in">
      <div className="glass-card" style={{ maxWidth: 500, width: '100%', textAlign: 'center' }}>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: 8 }}>Digital Scanner</h1>
        <p style={{ color: 'var(--text-dim)', marginBottom: 40 }}>Point your camera at the location QR code.</p>

        <div style={{ position: 'relative', marginBottom: 40 }}>
          <div id="qr-reader" style={{ 
            width: '100%', aspectRatio: '1/1', borderRadius: 24, overflow: 'hidden',
            display: (isCameraActive && !loading && !result) ? 'block' : 'none'
          }}></div>

          {(loading || result) && (
            <div style={{ padding: '60px 20px' }}>
              {loading ? (
                <div className="spinner" style={{ margin: '0 auto' }}></div>
              ) : (
                <div className="animate-in">
                  <div style={{ fontSize: 64, marginBottom: 24 }}>{result.success ? '🏆' : '❌'}</div>
                  <h2 style={{ fontSize: '2rem', marginBottom: 12 }}>{result.success ? 'Visit Verified!' : 'Access Denied'}</h2>
                  <p style={{ color: 'var(--text-dim)', marginBottom: 32 }}>{result.message || result.error}</p>
                  
                  <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
                    {result.success && (
                      <button 
                        className="btn-primary" 
                        onClick={() => window.open(result.shareUrl, '_blank')}
                        style={{ background: '#1DA1F2', boxShadow: '0 4px 14px 0 rgba(29, 161, 242, 0.4)' }}
                      >
                        Share as Solana Blink 🐦
                      </button>
                    )}
                    <button className="btn-primary" onClick={() => navigate('/')}>Back to Explorer</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
          <button className="btn-secondary" onClick={() => fileInputRef.current.click()} style={{ background: 'var(--surface)', border: 'none', color: '#fff', padding: '12px 24px', borderRadius: 12, cursor: 'pointer' }}>
            Upload Image 📸
          </button>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={(e) => {
             const file = e.target.files[0];
             if(file) scannerRef.current.scanFile(file, true).then(onDataCaptured);
          }} />
        </div>
      </div>
    </div>
  )
}