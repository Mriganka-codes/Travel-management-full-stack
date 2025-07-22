import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import DestinationManager from './components/DestinationManager';
import ManageUsers from './components/ManageUsers';
import AppNavbar from './components/Navbar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SearchResults from './components/SearchResults';
import PackageManager from './components/PackageManager';
import AccommodationManager from './components/AccommodationManager';
import ItineraryManager from './components/ItineraryManager';
import DiscountManager from './components/DiscountManager';
import TransportationManager from './components/TransportationManager';

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppNavbar />
        <Container>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/destinations" element={<PrivateRoute><DestinationManager /></PrivateRoute>} />
            <Route path="/manage-users" element={<PrivateRoute><ManageUsers /></PrivateRoute>} />
            <Route path="/search-results" element={<PrivateRoute><SearchResults /></PrivateRoute>} />
            <Route path="/packages" element={<PrivateRoute><PackageManager /></PrivateRoute>} />
            <Route path="/accommodations" element={<PrivateRoute><AccommodationManager /></PrivateRoute>} />
            <Route path="/itineraries" element={<PrivateRoute><ItineraryManager /></PrivateRoute>} />
            <Route path="/discounts" element={<PrivateRoute><DiscountManager /></PrivateRoute>} />
            <Route path="/transportations" element={<PrivateRoute><TransportationManager /></PrivateRoute>} />
          </Routes>
        </Container>
      </Router>
    </AuthProvider>
  );
}

export default App;