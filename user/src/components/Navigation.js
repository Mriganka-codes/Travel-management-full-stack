import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navigation = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');  // Redirect to home page after logout
  };

  return (
    <div className="font-sans">
      <nav className="sticky top-0 z-50 flex items-center justify-between p-4 bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/icon.svg" alt="Traviante logo" className="w-20 h-20" />
            <span className="text-2xl font-bold">TRAVIANTE</span>
          </Link>
          <div className="hidden md:flex space-x-6">
            <Link to="/" className="text-lg font-medium hover:text-green-200 transition-colors duration-200">Home</Link>
            <Link to="/about" className="text-lg font-medium hover:text-green-200 transition-colors duration-200">About</Link>
            <Link to="/contact" className="text-lg font-medium hover:text-green-200 transition-colors duration-200">Contact</Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-lg font-medium">Welcome, {user.first_name}</span>
              <Link to="/profile" className="text-lg font-medium hover:text-green-200 transition-colors duration-200">Profile</Link>
              <button 
                onClick={handleLogout} 
                className="text-lg font-medium bg-white text-green-600 px-4 py-2 rounded-md hover:bg-green-100 transition-colors duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-lg font-medium bg-white text-green-600 px-4 py-2 rounded-md hover:bg-green-100 transition-colors duration-200">Login</Link>
              <Link to="/register" className="text-lg font-medium hover:text-green-200 transition-colors duration-200">Register</Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navigation;