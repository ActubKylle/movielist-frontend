// src/components/pages/Home.js
import { Link } from 'react-router-dom';

function Home({ user }) {
  return (
    <div className="text-center py-5">
      <div className="py-5">
        <h1 className="display-4 mb-4">Welcome to Movie Manager</h1>
        <p className="lead mb-4">A simple application to manage your movie collection</p>
        
        {user ? (
          <div>
            <p className="mb-4">Hello, {user.name}! Ready to manage your movies?</p>
            <Link to="/movies" className="btn btn-primary btn-lg me-2">
              View My Movies
            </Link>
            <Link to="/movies/create" className="btn btn-success btn-lg">
              Add New Movie
            </Link>
          </div>
        ) : (
          <div>
            <p className="mb-4">Log in or create an account to get started</p>
            <Link to="/login" className="btn btn-primary btn-lg me-2">
              Login
            </Link>
            <Link to="/register" className="btn btn-outline-primary btn-lg">
              Register
            </Link>
          </div>
        )}
      </div>
      
      <div className="row mt-5 justify-content-center">
        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h3 className="h5">Manage Movies</h3>
              <p>Add, edit, and delete movies in your collection.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h3 className="h5">Search & Filter</h3>
              <p>Easily find movies with search and filter functionality.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h3 className="h5">Secure Access</h3>
              <p>Your movie collection is private and secure.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;