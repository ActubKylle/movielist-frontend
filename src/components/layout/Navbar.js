// src/components/layout/Navbar.js
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import axios from 'axios';

function Navbar({ user, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    
    try {
      // Call logout API - optional depending on your backend setup
      await axios.post('/api/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Update local state
    onLogout();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          <i className="bi bi-film me-2"></i>
          Movie Manager
        </Link>
        
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          {user ? (
            <>
              <ul className="navbar-nav me-auto">
                <li className="nav-item">
                  <NavLink className="nav-link" to="/movies">My Movies</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/movies/create">Add Movie</NavLink>
                </li>
              </ul>
              
              <ul className="navbar-nav">
                <li className="nav-item dropdown">
                  <a 
                    className="nav-link dropdown-toggle" 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      toggleDropdown();
                    }}
                  >
                    <i className="bi bi-person-circle me-1"></i>
                    {user.name}
                  </a>
                  {dropdownOpen && (
                    <ul className="dropdown-menu dropdown-menu-end show" style={{ position: 'absolute' }}>
                      <li>
                        <a className="dropdown-item" href="#" onClick={handleLogout}>
                          <i className="bi bi-box-arrow-right me-2"></i>
                          Logout
                        </a>
                      </li>
                    </ul>
                  )}
                </li>
              </ul>
            </>
          ) : (
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <NavLink className="nav-link" to="/login">Login</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/register">Register</NavLink>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;