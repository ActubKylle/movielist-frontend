// src/components/auth/Register.js
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

function Register({ onLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
  
    try {
      const response = await axios.post('/api/register', formData);
      
      // Handle successful registration
      toast.success('Registration successful!');
      onLogin(response.data.user, response.data.token);
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="card shadow">
          <div className="card-header bg-primary text-white">
            <h4 className="mb-0">Create an Account</h4>
          </div>
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`} 
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                {errors.name && errors.name.map((error, index) => (
                  <div key={index} className="invalid-feedback">{error}</div>
                ))}
              </div>
              
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`} 
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {errors.email && errors.email.map((error, index) => (
                  <div key={index} className="invalid-feedback">{error}</div>
                ))}
              </div>
              
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input 
                  type="password" 
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`} 
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                {errors.password && errors.password.map((error, index) => (
                  <div key={index} className="invalid-feedback">{error}</div>
                ))}
                <div className="form-text">Must be at least 8 characters long</div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="password_confirmation" className="form-label">Confirm Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  id="password_confirmation"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="d-grid gap-2">
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Registering...
                    </>
                  ) : 'Register'}
                </button>
              </div>
            </form>
          </div>
          <div className="card-footer text-center py-3">
            <p className="mb-0">Already have an account? <Link to="/login" className="text-primary">Login</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;