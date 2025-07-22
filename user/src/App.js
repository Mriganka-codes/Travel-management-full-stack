import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import PopularDestinations from './components/PopularDestinations';
import FeaturedPackages from './components/FeaturedPackages';
import About from './components/About';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import Profile from './components/Profile';
import LoginPage from './components/LoginPage';
import RegistrationPage from './components/RegistrationPage';
import { AuthProvider } from './context/AuthContext';

const TravianteHomepage = () => {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <div className="font-sans">
            <Navigation />
            <Routes>
              <Route path="/" element={
                <>
                  <HeroSection />
                  <PopularDestinations />
                  <FeaturedPackages />
                  <About />
                  <ContactForm />
                </>
              } />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegistrationPage />} />
              {/* Add more routes as needed */}
            </Routes>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default TravianteHomepage;