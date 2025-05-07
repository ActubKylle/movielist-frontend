// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import MoviesList from './components/movies/MoviesList';
import MovieForm from './components/movies/MovieForm';
import MovieDetails from './components/movies/MovieDetails';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './components/pages/Home';
import NotFound from './components/pages/NotFound';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import './App.css';

// Set up axios defaults
axios.defaults.baseURL = 'http://movie-backend.test';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.withCredentials = false; // Important for token auth
// In App.js
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      // Make sure we don't add "Bearer " twice
      if (token.startsWith('Bearer ')) {
        config.headers.Authorization = token;
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

 // In App.js
 useEffect(() => {
  // Get token from localStorage on page load
  const storedToken = localStorage.getItem('token');
  
  if (storedToken) {
    console.log("Found stored token, setting in axios");
    console.log("Token first few characters:", storedToken.substring(0, 10) + "...");
    setToken(storedToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    checkAuth();
  } else {
    setLoading(false);
  }
}, []);

  // Check if user is authenticated
  const checkAuth = async () => {
    try {
      console.log("Checking authentication status...");
      const response = await axios.get('/api/user');
      console.log("User authenticated successfully:", response.data);
      setUser(response.data);
    } catch (error) {
      console.error('Authentication error:', error.response?.data?.message || error.message);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  // Handle successful login
// After login/registration, set the token in axios headers
// If the token already includes "Bearer", don't add it again
const handleLogin = (userData, authToken) => {
  console.log("Login successful:", userData);
  
  // Store user data
  setUser(userData);
  
  // Make sure token is properly formatted (without "Bearer ")
  const tokenToStore = authToken.startsWith('Bearer ') 
    ? authToken.substring(7) 
    : authToken;
  
  console.log("Storing token:", tokenToStore);
  
  // Set token in state and localStorage
  setToken(tokenToStore);
  localStorage.setItem('token', tokenToStore);
  
  // Set the Authorization header correctly
  axios.defaults.headers.common['Authorization'] = `Bearer ${tokenToStore}`;
};
  // Logout function
  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <Navbar user={user} onLogout={handleLogout} />
        
        <main className="container flex-grow-1 py-4">
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/movies" />} />
            <Route path="/register" element={!user ? <Register onLogin={handleLogin} /> : <Navigate to="/movies" />} />
            
            {/* Protected routes */}
            <Route path="/movies" element={user ? <MoviesList /> : <Navigate to="/login" />} />
            <Route path="/movies/create" element={user ? <MovieForm /> : <Navigate to="/login" />} />
            <Route path="/movies/:id" element={user ? <MovieDetails /> : <Navigate to="/login" />} />
            <Route path="/movies/edit/:id" element={user ? <MovieForm /> : <Navigate to="/login" />} />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        
        <Footer />
        <ToastContainer position="bottom-right" />
      </div>
    </Router>
  );
}

export default App;