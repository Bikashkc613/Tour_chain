import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ExplorePage from './pages/ExplorePage'
import ScanPage from './pages/ScanPage'
import NFTsPage from './pages/NFTsPage'
import LeaderboardPage from './pages/LeaderboardPage'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ paddingTop: '80px' }}>
        <Routes>
          <Route path="/" element={<ExplorePage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/nfts" element={<NFTsPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
export default App