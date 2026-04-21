// frontend/src/pages/LeaderboardPage.jsx
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useWallet } from '@solana/wallet-adapter-react'

const ADMIN_WALLET = 'DDziwsKXB4FTGj1B3kXw5uTD2Yp9HdWjwXphgHJxUzvf'

export default function LeaderboardPage() {
  const { publicKey } = useWallet()
  const [tourists, setTourists] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })

  useEffect(() => {
    setLoaded(true)
    if (publicKey?.toString() === ADMIN_WALLET) {
      axios.get('http://localhost:3001/api/leaderboard/top')
        .then(res => setTourists(res.data))
        .catch(err => console.error(err))
    }
  }, [publicKey])

  const handleMouseMove = (e) => {
    const x = e.clientX / window.innerWidth
    const y = e.clientY / window.innerHeight
    setMousePos({ x, y })
  }

  const isAdmin = publicKey?.toString() === ADMIN_WALLET
  const top3 = tourists.slice(0, 3)
  const rest = tourists.slice(3)

  return (
    <div 
      onMouseMove={handleMouseMove}
      style={{ padding: '80px 0' }}
      className="animate-in"
    >
      {!isAdmin ? (
        <div className="glass-card" style={{ maxWidth: 600, margin: '60px auto', textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ fontSize: 80, marginBottom: 24 }}>🔐</div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 16 }}>Restricted Access</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '1.2rem', lineHeight: 1.6 }}>
            The Global Leaderboard is reserved for official oversight. Please connect the authorized Ministry of Tourism wallet.
          </p>
        </div>
      ) : (
        <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <header style={{ textAlign: 'center', marginBottom: 100 }}>
              <h1 className="gradient-text" style={{ fontSize: '4.5rem' }}>Global Summit</h1>
              <p style={{ color: 'var(--text-dim)', fontSize: '1.3rem' }}>The world's top Himalayan explorers.</p>
          </header>

          {/* The Platinum Orbs (Top 3) */}
          {top3.length > 0 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: 40, 
              marginBottom: 160,
              transform: `perspective(1000px) rotateX(${(mousePos.y - 0.5) * 10}deg) rotateY(${(mousePos.x - 0.5) * 10}deg)`,
              transition: 'transform 0.1s ease-out'
            }}>
              {/* Rank 2 */}
              {top3[1] && (
                <div style={{ textAlign: 'center', opacity: 0, animation: 'fadeInScale 0.8s 0.2s forwards' }}>
                    <div style={{ 
                        width: 140, height: 140, borderRadius: '50%',
                        border: '2px solid rgba(238,238,238,0.5)',
                        background: 'rgba(255,255,255,0.03)',
                        backdropFilter: 'blur(20px)',
                        padding: 10, position: 'relative',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset 0 0 20px rgba(255,255,255,0.05)'
                    }}>
                          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(45deg, #bbb, #fff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🗻</div>
                          <div style={{ position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)', background: '#fff', color: '#000', padding: '4px 12px', borderRadius: 100, fontSize: 13, fontWeight: 900 }}>2nd</div>
                    </div>
                    <p style={{ marginTop: 24, fontWeight: 800, fontSize: '1.2rem' }}>{top3[1].walletAddress.substring(0, 8)}...</p>
                    <p style={{ color: '#00ffcc', fontWeight: 900, fontSize: '1.5rem', marginTop: 8 }}>{top3[1].totalVisits} 🏔️</p>
                </div>
              )}

              {/* Rank 1 - Golden Champion */}
              <div style={{ textAlign: 'center', zIndex: 10, opacity: 0, animation: 'fadeInScale 0.8s forwards' }}>
                  <div style={{ position: 'relative' }}>
                      {/* Pulsing Aura */}
                      <div className="sun-aura"></div>
                      
                      <div style={{ 
                        width: 220, height: 220, borderRadius: '50%',
                        border: '4px solid #FFD700',
                        background: 'rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(30px)',
                        padding: 15, position: 'relative',
                        boxShadow: '0 30px 80px rgba(255, 215, 0, 0.2)'
                    }}>
                          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(45deg, #FFD700, #ff8c00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80 }}>👑</div>
                          <div style={{ position: 'absolute', top: -15, right: -15, width: 60, height: 60, background: '#FFD700', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '5px solid #080a12', fontSize: 24, fontWeight: 1000, color: '#000' }}>1</div>
                    </div>
                  </div>
                  <p style={{ marginTop: 32, fontWeight: 1000, fontSize: '1.8rem', letterSpacing: '-0.02em' }}>{top3[0].walletAddress.substring(0, 10)}...</p>
                  <p style={{ color: '#FFD700', fontWeight: 1000, fontSize: '2.5rem', marginTop: 8 }}>{top3[0].totalVisits} VISITS</p>
              </div>

              {/* Rank 3 */}
              {top3[2] && (
                <div style={{ textAlign: 'center', opacity: 0, animation: 'fadeInScale 0.8s 0.4s forwards' }}>
                    <div style={{ 
                        width: 140, height: 140, borderRadius: '50%',
                        border: '2px solid rgba(205, 127, 50, 0.5)',
                        background: 'rgba(255,255,255,0.03)',
                        backdropFilter: 'blur(20px)',
                        padding: 10, position: 'relative',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    }}>
                          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(45deg, #cd7f32, #8b4513)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🏔️</div>
                          <div style={{ position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)', background: '#cd7f32', color: '#fff', padding: '4px 12px', borderRadius: 100, fontSize: 13, fontWeight: 900 }}>3rd</div>
                    </div>
                    <p style={{ marginTop: 24, fontWeight: 800, fontSize: '1.2rem' }}>{top3[2].walletAddress.substring(0, 8)}...</p>
                    <p style={{ color: '#00ffcc', fontWeight: 900, fontSize: '1.5rem', marginTop: 8 }}>{top3[2].totalVisits} 🏔️</p>
                </div>
              )}
            </div>
          )}

          {/* Global List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {rest.map((tourist, index) => (
              <div 
                key={tourist.walletAddress} 
                className="summit-row"
                style={{ animationDelay: `${0.6 + index * 0.05}s` }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                  <span style={{ fontSize: '1rem', fontWeight: 900, color: 'rgba(255,255,255,0.2)', width: 40 }}>#{index + 4}</span>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🚶</div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)' }}>
                    {tourist.walletAddress.substring(0, 20)}...
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 1000, color: '#fff' }}>{tourist.totalVisits}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 900 }}>MILESTONES</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes auraFloat {
          0% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.3); opacity: 0.1; }
          100% { transform: scale(1); opacity: 0.3; }
        }
        .sun-aura {
          position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
          background: radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%);
          animation: auraFloat 5s infinite ease-in-out;
          pointer-events: none;
        }
        .summit-row {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          backdrop-filter: blur(20px);
          padding: 24px 40px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          opacity: 0;
          animation: slideInUp 0.8s forwards;
        }
        .summit-row:hover {
          transform: scale(1.02);
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,215,0,0.3);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
      `}</style>
    </div>
  )
}
