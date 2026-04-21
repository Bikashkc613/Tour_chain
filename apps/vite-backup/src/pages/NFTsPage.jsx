// frontend/src/pages/NFTsPage.jsx
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useWallet } from '@solana/wallet-adapter-react'

function NFTCard({ nft, index }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setShow(true), index * 100)
    return () => clearTimeout(timer)
  }, [index])

  const getImageSrc = (path) => {
    if (!path) return 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=400&q=80'
    if (path.startsWith('http')) return path
    // Clean and split path
    const cleanPath = decodeURIComponent(path)
    const encodedPath = cleanPath.split('/').map(segment => encodeURIComponent(segment)).join('/')
    return `http://localhost:3001${encodedPath.startsWith('/') ? '' : '/'}${encodedPath}`
  }

  return (
    <div className={`glass-card animate-in ${show ? 'show' : ''}`} style={{ padding: 24, textAlign: 'center' }}>
        <div style={{ width: '100%', aspectRatio: '1', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
          <img 
            src={getImageSrc(nft.image)} 
            alt={nft.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </div>
        <h3 style={{ marginBottom: 12, fontSize: '1.4rem' }}>{nft.name}</h3>
        <div style={{ 
          display: 'inline-block',
          padding: '6px 16px',
          borderRadius: 100,
          background: 'var(--surface)',
          border: '1px solid var(--accent)',
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--accent)',
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginBottom: 20
        }}>
          {nft.tier} Elite
        </div>
        
        {nft.tx && (
          <a 
            href={`https://explorer.solana.com/tx/${nft.tx}?cluster=devnet`} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              display: 'block', 
              fontSize: 12, 
              color: 'var(--text-dim)', 
              textDecoration: 'none',
              marginTop: 12,
              opacity: 0.7
            }}
            onMouseEnter={(e) => e.target.style.opacity = 1}
            onMouseLeave={(e) => e.target.style.opacity = 0.7}
          >
            View on Explorer ↗
          </a>
        )}
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
      .catch(err => console.error('Failed to fetch NFTs:', err))
  }, [publicKey])

  return (
    <div style={{ padding: '80px 0' }} className="animate-in">
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: 80 }}>
          <h1 className="gradient-text" style={{ fontSize: '4.5rem' }}>Himalayan Vault</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '1.3rem', maxWidth: 600, margin: '16px auto' }}>
             Your mountain legacy, forever preserved on the Solana ledger.
          </p>
        </header>
          
        {!publicKey && (
          <div className="glass-card" style={{ 
            marginTop: 40, 
            padding: '40px', 
            textAlign: 'center',
            maxWidth: 600,
            margin: '0 auto'
          }}>
             <h2 style={{ marginBottom: 12 }}>Vault Locked</h2>
             <p style={{ color: 'var(--text-dim)' }}>Please connect your Solana wallet to view your collected achievement badges.</p>
          </div>
        )}
        
        {publicKey && (
          <div className="places-grid">
            {nfts.map((nft, i) => <NFTCard key={nft.mint || i} nft={nft} index={i} />)}
          </div>
        )}

        {publicKey && nfts.length === 0 && (
          <div className="glass-card" style={{ 
            textAlign: 'center', 
            padding: 100, 
            opacity: loaded ? 1 : 0,
            transition: 'opacity 1s ease'
          }}>
            <div style={{ fontSize: 64, marginBottom: 24 }}>🏔️</div>
            <h3 style={{ fontSize: '1.8rem', marginBottom: 12 }}>Vault is currently empty</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', maxWidth: 450, margin: '0 auto' }}>
              You haven't collected any badges yet. Trek to iconic locations across Nepal to earn your first certified proof-of-visit.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}