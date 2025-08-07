import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import ExplorePairs from './pages/ExplorePairs';
import DailyDraw from './pages/DailyDraw';
import Favorites from './pages/Favorites';
import CuratedPairs from './pages/CuratedPairs';
import Upgrade from './pages/Upgrade';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<ExplorePairs />} />
              <Route path="/daily-draw" element={<DailyDraw />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/curated" element={<CuratedPairs />} />
              <Route path="/upgrade" element={<Upgrade />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </Layout>
        </Router>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;