import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

const ADMIN_WALLET = 'DDziwsKXB4FTGj1B3kXw5uTD2Yp9HdWjwXphgHJxUzvf'

export default function Navbar() {
  const location = useLocation()
  const { publicKey } = useWallet()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isAdmin = publicKey?.toString() === ADMIN_WALLET

  const navLinks = [
    { name: 'Explore', path: '/' },
    { name: 'Scan QR', path: '/scan' },
    { name: 'My NFTs', path: '/nfts' },
  ]

  if (isAdmin) {
    navLinks.push({ name: 'Leaderboard', path: '/leaderboard' })
  }

  return (
    <>
      <div style={{ height: 100 }}></div>
      <nav className={`glass-card ${scrolled ? 'nav-scrolled' : ''}`} style={{
        position: 'fixed',
        top: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        width: '90%',
        maxWidth: 1100,
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: '100px',
      }}>
        {/* Logo Section */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>🏔</span>
          <span className="gradient-text" style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>
            Tourism Chain
          </span>
        </Link>

        {/* Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  textDecoration: 'none',
                  padding: '10px 20px',
                  borderRadius: 100,
                  fontSize: 14,
                  fontWeight: 600,
                  color: isActive ? 'var(--primary)' : '#ffffff',
                  backgroundColor: isActive ? 'var(--surface)' : 'transparent',
                  transition: 'all 0.3s ease'
                }}
              >
                {link.name}
              </Link>
            )
          })}
        </div>

        {/* Action Button */}
        <div className="wallet-adapter-wrapper">
          <WalletMultiButton />
        </div>

        <style>{`
          .nav-scrolled {
            transform: translateX(-50%) translateY(-4px) scale(0.98) !important;
            border-color: var(--primary-glow) !important;
          }
          .wallet-adapter-button {
            background-color: var(--primary) !important;
            border-radius: 12px !important;
            height: 44px !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            box-shadow: 0 4px 14px 0 var(--primary-glow) !important;
          }
        `}</style>
      </nav>
    </>
  )
}