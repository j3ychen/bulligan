import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';
import HowToPlayPage from './pages/HowToPlayPage';
import PredictionPage from './pages/PredictionPage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';

function App() {
  // TODO: Later we'll check if user is authenticated
  const isAuthenticated = true; // Change to true to test authenticated routes

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Show navigation only when authenticated */}
        {isAuthenticated && <Navigation />}
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/how-to-play" element={<HowToPlayPage />} />
          
          {/* Authenticated Routes */}
          <Route 
            path="/prediction" 
            element={isAuthenticated ? <PredictionPage /> : <Navigate to="/" />} 
          />
          <Route 
            path="/profile" 
            element={isAuthenticated ? <ProfilePage /> : <Navigate to="/" />} 
          />
          <Route 
            path="/leaderboard" 
            element={isAuthenticated ? <LeaderboardPage /> : <Navigate to="/" />} 
          />

          {/* 404 Catch-all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
