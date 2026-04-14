// frontend/src/pages/ExplorePage.jsx
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function ExplorePage() {
  const [places, setPlaces] = useState([])
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [showQR, setShowQR] = useState(false)

  const [qrImage, setQrImage] = useState('')
  const [loadingQR, setLoadingQR] = useState(false)

  const handleGenerateQR = async (placeId) => {
    setLoadingQR(true)
    try {
      const res = await axios.get(`http://localhost:3001/api/places/${placeId}/generate-qr`)
      setQrImage(res.data.qrImage)
      setShowQR(true)
    } catch (err) {
      alert('Failed to generate secure QR code. Is the backend running?')
    } finally {
      setLoadingQR(false)
    }
  }

  useEffect(() => {
    // We prioritize showing all 12 iconic locations for the demo
    const demoPlaces = [
      { placeId: 'everest', name: 'Everest Base Camp', region: 'Himalaya', description: 'The roof of the world. A legendary trekking journey into the heart of the Himalayas.', imageUrl: '/images/everest%20base%20camp.jpg', longDesc: 'Everest Base Camp is the ultimate destination for trekkers worldwide. Situated at an altitude of 5,364 meters, it offers a close-up view of the world\'s highest peak and the Khumbu Icefall.' },
      { placeId: 'kathmandu', name: 'Kathmandu Durbar Square', region: 'Kathmandu', description: 'Ancient royal architecture and living history.', imageUrl: '/images/Kathmandu%20Durbar%20Square.jpg', longDesc: 'A UNESCO World Heritage site, this square is the ancient heart of Kathmandu, filled with stunning temples, courtyards, and the residence of the Living Goddess, Kumari.' },
      { placeId: 'pokhara', name: 'Phewa Lake', region: 'Pokhara', description: 'Crystal clear waters reflecting the Annapurna range.', imageUrl: '/images/Phewa%20Lake.jpg', longDesc: 'The second largest lake in Nepal, Phewa Lake is the center of attraction in Pokhara. The Tal Barahi Temple situated on an island in the middle of the lake is a major pilgrimage site.' },
      { placeId: 'lumbini', name: 'Lumbini (Maya Devi Temple)', region: 'Rupandehi', description: 'The sacred birthplace of Lord Buddha.', imageUrl: '/images/Lumbini%20(Maya%20Devi%20Temple).jpg', longDesc: 'Lumbini is one of the most sacred places for Buddhists. It is the birthplace of Siddhartha Gautama, who later became the Buddha. The Maya Devi Temple marks the exact spot of his birth.' },
      { placeId: 'chitwan', name: 'Chitwan National Park', region: 'Terai', description: 'Explore the wild heart of the Nepalese jungle.', imageUrl: '/images/Chitwan%20National%20Park.jpg', longDesc: 'Nepal\'s first national park, Chitwan is home to the rare one-horned rhino, Bengal tigers, and hundreds of bird species. It offers a unique jungle safari experience.' },
      { placeId: 'mustang', name: 'Upper Mustang', region: 'Mustang', description: 'The hidden kingdom of the Himalayas.', imageUrl: '/images/Upper%20Mustang.jpg', longDesc: 'Known as the "Last Forbidden Kingdom," Upper Mustang is a remote area with a distinct Tibetan-influenced culture, ancient caves, and a desert-like landscape surrounded by snow-capped peaks.' },
      { placeId: 'bhaktapur', name: 'Bhaktapur Durbar Square', region: 'Bhaktapur', description: 'The city of devotees and ancient wood carvings.', imageUrl: '/images/Bhaktapur%20Durbar%20Square.jpg', longDesc: 'An open-air museum of medieval art and architecture. Bhaktapur is famous for its pottery, weaving, and the 55-window palace built in the 15th century.' },
      { placeId: 'janakpur', name: 'Janaki Mandir', region: 'Janakpur', description: 'Magnificent marble temple dedicated to Goddess Sita.', imageUrl: '/images/Janaki%20Mandir.jpg', longDesc: 'A masterpiece of Hindu-Rajput architecture, this temple in Janakpur is dedicated to Sita, the heroine of the Ramayana. It is a major destination for pilgrims from Nepal and India.' },
      { placeId: 'gorkha', name: 'Gorkha Durbar', region: 'Gorkha', description: 'The historic ancestral home of the Shah dynasty.', imageUrl: '/images/Gorkha%20Durbar.jpg', longDesc: 'The birthplace of Prithvi Narayan Shah, the founder of modern Nepal. The palace complex sits atop a hill, offering defensive views and a rich history of the Gurkha warriors.' },
      { placeId: 'manang', name: 'Manang Valley', region: 'Manang', description: 'A hidden valley with breathtaking alpine scenery.', imageUrl: '/images/Manang%20Valley.jpg', longDesc: 'A highlights of the Annapurna Circuit, Manang is a group of villages known for their unique traditions, diverse landscapes, and proximity to Tilicho Lake, the highest lake in the world.' },
      { placeId: 'rara', name: 'Rara Lake', region: 'Mugu', description: 'The deepest and largest lake in Nepal.', imageUrl: '/images/Rara%20Lake.jpg', longDesc: 'Surrounded by Rara National Park, this pristine lake is known for its shifting colors and untouched natural beauty. It is a peaceful paradise for nature lovers.' },
      { placeId: 'nagarkot', name: 'Nagarkot', region: 'Bhaktapur', description: 'Breathtaking panoramic views of the Himalayas.', imageUrl: '/images/Nagarkot.jpg', longDesc: 'Located just outside Kathmandu, Nagarkot is famous for its stunning sunrise views of the Himalayas, including Everest on a clear day. It is a popular nature escape.' }
    ];

    axios.get('http://localhost:3001/api/places/all')
      .then(res => {
        if (res.data && res.data.length > 10) {
          setPlaces(res.data)
        } else {
          setPlaces(demoPlaces)
        }
      })
      .catch(() => {
        setPlaces(demoPlaces)
      })
  }, [])

  return (
    <div style={{ padding: 24, minHeight: '100vh', background: '#f8f9fa' }}>
      <header style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1a1a1a', marginBottom: 8 }}>Discover Nepal</h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>Visit iconic locations to earn unique NFT badges on Solana.</p>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
        {places.map(place => (
          <div 
            key={place.placeId} 
            style={{ 
              background: '#fff',
              borderRadius: 24, 
              overflow: 'hidden', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ position: 'relative' }}>
              <img 
                src={place.imageUrl || '/images/everest%20base%20camp.jpg'} 
                alt={place.name} 
                style={{ width: '100%', height: 220, objectFit: 'cover' }} 
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80' }}
              />
              <div style={{ 
                position: 'absolute', 
                top: 16, 
                left: 16, 
                background: 'rgba(255,255,255,0.9)', 
                backdropFilter: 'blur(10px)',
                padding: '6px 12px', 
                borderRadius: 100,
                fontSize: 12,
                fontWeight: 600,
                color: '#333'
              }}>
                {place.region}
              </div>
            </div>
            <div style={{ padding: 24 }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.25rem', color: '#1a1a1a' }}>{place.name}</h3>
              <p style={{ fontSize: 14, color: '#666', marginBottom: 20, lineHeight: 1.5, height: 42, overflow: 'hidden' }}>{place.description}</p>
              <button 
                onClick={() => setSelectedPlace(place)}
                style={{ 
                  width: '100%',
                  backgroundColor: '#000', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '12px', 
                  borderRadius: 12, 
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {places.length === 0 && (
        <div style={{ textAlign: 'center', padding: 80, border: '2px dashed #ddd', borderRadius: 32 }}>
          <p style={{ color: '#999' }}>No locations discovered yet. Connect to backend to see more.</p>
        </div>
      )}

      {/* Details Modal */}
      {selectedPlace && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20
        }}>
          <div style={{ 
            background: '#fff', width: '100%', maxWidth: 600, maxHeight: '90vh',
            borderRadius: 32, overflowY: 'auto', position: 'relative'
          }}>
            <button 
              onClick={() => { setSelectedPlace(null); setShowQR(false); }}
              style={{ position: 'absolute', top: 20, right: 20, background: '#f0f0f0', border: 'none', width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', fontSize: 20, zIndex: 1 }}
            >
              &times;
            </button>
            
            <img src={selectedPlace.imageUrl} style={{ width: '100%', height: 300, objectFit: 'cover' }} />
            
            <div style={{ padding: 32 }}>
              <span style={{ color: '#666', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>{selectedPlace.region}</span>
              <h2 style={{ fontSize: '2rem', margin: '8px 0 16px 0' }}>{selectedPlace.name}</h2>
              <p style={{ color: '#444', lineHeight: 1.7, marginBottom: 32 }}>{selectedPlace.longDesc || selectedPlace.description}</p>
              
              <div style={{ padding: 24, background: '#f9f9f9', borderRadius: 24, border: '1px solid #eee' }}>
                <h4 style={{ margin: '0 0 8px 0' }}>Tourism Proof-of-Visit</h4>
                <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>Scan the QR code at {selectedPlace.name} to mint your exclusive NFT badge.</p>
                
                {showQR ? (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      background: '#fff', padding: 20, borderRadius: 16, display: 'inline-block', boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      border: '1px solid #eee', marginBottom: 12
                    }}>
                      <img src={qrImage} width={200} height={200} alt="Location QR Code" />
                    </div>
                    <p style={{ fontSize: 11, color: '#999' }}>Point your app scanner at this code to test check-in.</p>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleGenerateQR(selectedPlace.placeId)}
                    disabled={loadingQR}
                    style={{ 
                      width: '100%', 
                      background: '#000', 
                      color: '#fff', 
                      border: 'none', 
                      padding: '14px', 
                      borderRadius: 14, 
                      fontWeight: 700, 
                      cursor: loadingQR ? 'not-allowed' : 'pointer',
                      opacity: loadingQR ? 0.7 : 1
                    }}
                  >
                    {loadingQR ? 'Generating Security Token...' : 'Generate Secure Test QR Code'}
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
