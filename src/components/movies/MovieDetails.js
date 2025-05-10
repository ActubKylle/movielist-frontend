// src/components/movies/MovieDetails.js
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovie();
  }, [id]);

  const fetchMovie = async () => {
    try {
      const response = await axios.get(`/api/movies/${id}`);
      setMovie(response.data);
    } catch (error) {
      console.error('Error fetching movie:', error);
      toast.error('Could not load movie details');
      navigate('/movies');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        await axios.delete(`/api/movies/${id}`);
        toast.success('Movie deleted successfully');
        navigate('/movies');
      } catch (error) {
        console.error('Error deleting movie:', error);
        toast.error('Failed to delete movie');
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading movie details...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Movie Details</h1>
        <div>
          <Link to="/movies" className="btn btn-outline-secondary me-2">
            <i className="bi bi-arrow-left me-1"></i> Back to List
          </Link>
        </div>
      </div>

      <div className="card shadow">
        <div className="card-header bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="h4 mb-0">{movie.title}</h2>
            <div className="badge bg-primary">{movie.release_year}</div>
          </div>
        </div>
        
        <div className="row g-0">
          {movie.image_path && (
            <div className="col-md-4">
              <img 
                src={`/storage/${movie.image_path}`} 
                alt={movie.title} 
                className="img-fluid rounded-start"
                style={{ maxHeight: '300px', objectFit: 'cover' }}
              />
            </div>
          )}
          
          <div className={movie.image_path ? "col-md-8" : "col-md-12"}>
            <div className="card-body">
              <div className="mb-4">
                <h5 className="card-title">Genre</h5>
                <p className="card-text">{movie.genre}</p>
              </div>
              
              {movie.description && (
                <div className="mb-4">
                  <h5 className="card-title">Description</h5>
                  <p className="card-text">{movie.description}</p>
                </div>
              )}
              
              <div className="mb-2">
                <h5 className="card-title">Created</h5>
                <p className="card-text">{new Date(movie.created_at).toLocaleString()}</p>
              </div>
              
              {movie.created_at !== movie.updated_at && (
                <div>
                  <h5 className="card-title">Last Updated</h5>
                  <p className="card-text">{new Date(movie.updated_at).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="card-footer">
          <div className="d-flex justify-content-end">
            <Link to={`/movies/edit/${movie.id}`} className="btn btn-primary me-2">
              <i className="bi bi-pencil me-1"></i> Edit
            </Link>
            <button onClick={handleDelete} className="btn btn-danger">
              <i className="bi bi-trash me-1"></i> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetails;
