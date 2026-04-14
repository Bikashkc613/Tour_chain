import { useEffect, useState } from 'react'
import axios from 'axios'
import { useWallet } from '@solana/wallet-adapter-react'
import BackgroundLayer from '../components/BackgroundLayer'

function NFTCard({ nft, index }) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [show, setShow] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => setShow(true), index * 100)
    return () => clearTimeout(timer)
  }, [index])

  const handleMouseMove = (e) => {
    const card = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - card.left
    const y = e.clientY - card.top
    const centerX = card.width / 2
    const centerY = card.height / 2
    const rotateX = (centerY - y) / 10
    const rotateY = (x - centerX) / 10
    setRotate({ x: rotateX, y: rotateY })
  }

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 })
  }

  const tierGlow = {
    Gold: 'rgba(255, 204, 0, 0.4)',
    Silver: 'rgba(255, 255, 255, 0.3)',
    Bronze: 'rgba(205, 127, 50, 0.3)'
  }[nft.tier] || 'rgba(0, 255, 204, 0.3)'

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: '1500px',
        opacity: show ? 1 : 0,
        transform: `translateY(${show ? 0 : '40px'})`,
        transition: 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
        cursor: 'pointer'
      }}
    >
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(30px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 40,
        padding: 24,
        textAlign: 'center',
        transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        transition: 'transform 0.15s ease-out, box-shadow 0.4s ease',
        boxShadow: rotate.x !== 0 
          ? `0 40px 80px rgba(0,0,0,0.5), 0 0 30px ${tierGlow}` 
          : '0 20px 40px rgba(0,0,0,0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Dynamic Light Glide */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: `linear-gradient(${135 + rotate.y * 5}deg, transparent, rgba(255,255,255,0.08), transparent)`,
          pointerEvents: 'none'
        }}></div>

        <div style={{ 
          width: '100%', 
          aspectRatio: '1', 
          borderRadius: 24, 
          overflow: 'hidden',
          marginBottom: 24,
          background: 'rgba(0,0,0,0.2)',
          border: '1px solid rgba(255,255,255,0.05)',
          position: 'relative'
        }}>
          <img 
            src={`http://localhost:3001${nft.image}`} 
            alt={nft.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=400&q=80' }}
          />
        </div>
        
        <h3 style={{ 
            margin: '0 0 10px 0', 
            fontSize: '1.4rem', 
            fontWeight: 900, 
            color: '#fff',
            letterSpacing: '-0.02em'
        }}>{nft.name}</h3>
        
        <div style={{ 
          display: 'inline-block',
          padding: '6px 18px',
          borderRadius: 100,
          backgroundColor: 'rgba(255,255,255,0.05)',
          border: `1px solid ${tierGlow}`,
          color: '#fff',
          fontSize: 11,
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: 2
        }}>
          {nft.tier} Elite
        </div>

        <div style={{ marginTop: 24, padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
             <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontFamily: "'JetBrains Mono', monospace", margin: 0 }}>
                #ID-{nft.mint ? nft.mint.substring(0, 15).toUpperCase() : 'PENDING'}
             </p>
        </div>
      </div>
    </div>
  )
}

export default function NFTsPage() {
  const { publicKey } = useWallet()
  const [nfts, setNfts] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
    if (!publicKey) return
    axios.get(`http://localhost:3001/api/nfts/${publicKey.toString()}`)
      .then(r => setNfts(r.data))
  }, [publicKey])

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '120px 24px',
      color: '#fff',
      fontFamily: "'Outfit', 'Inter', sans-serif"
    }}>
      <BackgroundLayer />

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <header style={{ 
            textAlign: 'center', 
            marginBottom: 80,
            opacity: loaded ? 1 : 0,
            transform: `translateY(${loaded ? 0 : '20px'})`,
            transition: 'all 0.8s ease'
        }}>
          <span style={{ color: '#00ffcc', fontWeight: 900, letterSpacing: 3, fontSize: 12, textTransform: 'uppercase' }}>Blockchain Collection</span>
          <h1 style={{ 
            fontSize: '4.5rem', 
            fontWeight: 950, 
            margin: '16px 0', 
            letterSpacing: '-0.05em',
            background: 'linear-gradient(to bottom, #fff, #888)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Himalayan Vault
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.3rem', fontWeight: 500, maxWidth: 600, margin: '0 auto' }}>
             Your mountain legacy, forever preserved on the Solana ledger.
          </p>
          
          {!publicKey && (
            <div style={{ 
              marginTop: 40, 
              padding: '24px 40px', 
              background: 'rgba(255,255,255,0.03)', 
              backdropFilter: 'blur(30px)',
              borderRadius: 24, 
              display: 'inline-block',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
            }}>
               <p style={{ margin: 0, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>Authentication Required: Unlock your vault with Solana</p>
            </div>
          )}
        </header>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: 40 
        }}>
          {nfts.map((nft, i) => <NFTCard key={nft.mint} nft={nft} index={i} />)}
        </div>

        {publicKey && nfts.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: 120, 
            background: 'rgba(255,255,255,0.02)', 
            border: '1px dashed rgba(255,255,255,0.1)', 
            borderRadius: 40,
            backdropFilter: 'blur(20px)',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 1s ease'
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 12 }}>Vault is currently empty</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem' }}>
              Begin your trek to earn your first certified achievement.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}