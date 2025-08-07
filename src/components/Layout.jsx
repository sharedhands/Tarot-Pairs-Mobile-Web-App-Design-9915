import React from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import Header from './Header';

const Layout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-mystical-gradient">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mystical-gradient">
      <Header />
      <main className="pb-20">
        {children}
      </main>
      <Navigation />
    </div>
  );
};

export default Layout;