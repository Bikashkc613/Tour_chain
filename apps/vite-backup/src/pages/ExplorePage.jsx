// frontend/src/pages/ExplorePage.jsx
import { useEffect, useState } from 'react'
import axios from 'axios'

const demoPlaces = [
  { placeId: 'everest', name: 'Everest Base Camp', region: 'Himalaya', description: 'The roof of the world. A legendary trekking journey into the heart of the Himalayas.', imageUrl: '/images/everest%20base%20camp.jpg', longDesc: 'Everest Base Camp is the ultimate destination for trekkers worldwide. Situated at an altitude of 5,364 meters, it offers a close-up view of the world\'s highest peak and the Khumbu Icefall.' },
  { placeId: 'kathmandu', name: 'Kathmandu Durbar Square', region: 'Kathmandu', description: 'Ancient royal architecture and living history.', imageUrl: '/images/Kathmandu%20Durbar%20Square.jpg', longDesc: 'A UNESCO World Heritage site, this square is the ancient heart of Kathmandu, filled with stunning temples, courtyards, and the residence of the Living Goddess, Kumari.' },
  { placeId: 'pokhara', name: 'Phewa Lake', region: 'Pokhara', description: 'Crystal clear waters reflecting the Annapurna range.', imageUrl: '/images/Phewa%20Lake.jpg', longDesc: 'The second largest lake in Nepal, Phewa Lake is the center of attraction in Pokhara. The Tal Barahi Temple situated on an island in the middle of the lake is a major pilgrimage site.' },
  { placeId: 'lumbini', name: 'Lumbini (Maya Devi Temple)', region: 'Rupandehi', description: 'The sacred birthplace of Lord Buddha.', imageUrl: '/images/Lumbini%20(Maya%20Devi%20Temple).jpg', longDesc: 'Lumbini is one of the most sacred places for Buddhists. It is the birthplace of Siddhartha Gautama, who later became the Buddha. The Maya Devi Temple marks the exact spot of his birth.' },
  { placeId: 'chitwan', name: 'Chitwan National Park', region: 'Terai', description: 'Explore the wild heart of the Nepalese jungle.', imageUrl: '/images/Chitwan%20National%20Park.jpg', longDesc: 'Nepal\'s first national park, Chitwan is home to the rare one-horned rhino, Bengal tigers, and hundreds of bird species. It offers a unique jungle safari experience.' },
  { placeId: 'mustang', name: 'Upper Mustang', region: 'Mustang', description: 'The hidden kingdom of the Himalayas.', imageUrl: '/images/Upper%20Mustang.jpg', longDesc: 'Known as the "Last Forbidden Kingdom," Upper Mustang is a remote area with a distinct Tibetan-influenced culture, ancient caves, and a desert-like landscape surrounded by snow-capped peaks.' },
];

export default function ExplorePage() {
  const [places, setPlaces] = useState([])
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [showQR, setShowQR] = useState(false)
  const [qrImage, setQrImage] = useState('')
  const [loadingQR, setLoadingQR] = useState(false)

  useEffect(() => {
    axios.get('http://localhost:3001/api/places/all')
      .then(res => setPlaces(res.data.length > 0 ? res.data : demoPlaces))
      .catch(() => setPlaces(demoPlaces))
  }, [])

  const handleGenerateQR = async (placeId) => {
    setLoadingQR(true)
    try {
      const res = await axios.get(`http://localhost:3001/api/places/${placeId}/generate-qr`)
      setQrImage(res.data.qrImage)
      setShowQR(true)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingQR(false)
    }
  }

  const getImageSrc = (path) => {
    if (!path) return 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=400&q=80'
    if (path.startsWith('http')) return path
    const cleanPath = decodeURIComponent(path)
    const encodedPath = cleanPath.split('/').map(segment => encodeURIComponent(segment)).join('/')
    return `http://localhost:3001${encodedPath.startsWith('/') ? '' : '/'}${encodedPath}`
  }

  return (
    <div style={{ padding: '40px 0' }} className="animate-in">
      <header style={{ marginBottom: 60, textAlign: 'center' }}>
        <h1 className="gradient-text">Explore Nepal</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '1.2rem', maxWidth: 600, margin: '16px auto' }}>
          Discover the hidden gems of the Himalayas and collect verified blockchain badges.
        </p>
      </header>
      
      <div className="places-grid">
        {places.map(place => (
          <div key={place.placeId} className="glass-card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', height: 200, width: '100%' }}>
              <img 
                src={getImageSrc(place.imageUrl)} 
                alt={place.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '24px 24px 0 0' }} 
              />
              <div style={{ 
                position: 'absolute', top: 16, left: 16, 
                backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)',
                padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 700 
              }}>
                {place.region}
              </div>
            </div>
            <div style={{ padding: 24 }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: 12 }}>{place.name}</h2>
              <p style={{ color: 'var(--text-dim)', fontSize: 14, marginBottom: 24, height: 42, overflow: 'hidden' }}>
                {place.description}
              </p>
              <button className="btn-primary" style={{ width: '100%' }} onClick={() => setSelectedPlace(place)}>
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedPlace && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)', zIndex: 2000,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20
        }}>
          <div className="glass-card animate-in" style={{ width: '100%', maxWidth: 700, padding: 0, overflow: 'hidden' }}>
             <button 
                onClick={() => { setSelectedPlace(null); setShowQR(false); }}
                style={{ position: 'absolute', top: 20, right: 20, background: 'var(--surface)', border: 'none', color: '#fff', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', zIndex: 10 }}
              >✕</button>
            
            <img src={getImageSrc(selectedPlace.imageUrl)} style={{ width: '100%', height: 350, objectFit: 'cover' }} />
            
            <div style={{ padding: 40 }}>
              <span style={{ color: 'var(--accent)', fontWeight: 700, letterSpacing: 1, fontSize: 12, textTransform: 'uppercase' }}>{selectedPlace.region}</span>
              <h1 style={{ fontSize: '2.5rem', marginTop: 12 }}>{selectedPlace.name}</h1>
              <p style={{ color: 'var(--text-dim)', lineHeight: 1.8, marginBottom: 32 }}>{selectedPlace.longDesc || selectedPlace.description}</p>
              
              <div style={{ padding: 32, backgroundColor: 'var(--surface)', borderRadius: 24, border: '1px solid var(--surface-border)' }}>
                <h3>Proof-of-Visit</h3>
                <p style={{ fontSize: 14, color: 'var(--text-dim)', marginBottom: 24 }}>Collect your verified cNFT badge for visiting this location.</p>
                
                {showQR ? (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ background: '#fff', padding: 20, borderRadius: 24, display: 'inline-block' }}>
                      <img src={qrImage} width={200} height={200} alt="Location QR" />
                    </div>
                  </div>
                ) : (
                  <button onClick={() => handleGenerateQR(selectedPlace.placeId)} className="btn-primary" style={{ width: '100%' }}>
                    {loadingQR ? 'Generating...' : 'Generate Check-in QR'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
