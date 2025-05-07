// src/components/movies/MoviesList.js
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

function MoviesList() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [genres, setGenres] = useState([]);
  const [years, setYears] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(localStorage.getItem('user_id'));
  const location = useLocation();
  const navigate = useNavigate();

  // This effect will run when the component mounts or when filters change
  useEffect(() => {
    fetchMovies();
  }, [searchQuery, genreFilter, yearFilter]);

  // This additional effect will run when the location changes (i.e., when redirected from form)
  useEffect(() => {
    // Force refresh of movies when navigating to this page
    fetchMovies();
  }, [location]);

  // This effect will check if the user ID has changed (e.g., after login/logout)
  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId !== currentUserId) {
      setCurrentUserId(storedUserId);
      fetchMovies();
    }
  }, [currentUserId]);


  const fetchMovies = async () => {
    try {
      setLoading(true);
      console.log("Starting fetchMovies() call");
      
      // Check if Authentication header is set
      const authHeader = axios.defaults.headers.common['Authorization'];
      console.log("Authorization header:", authHeader);
      
      // If no auth header is set, try to get it from localStorage
      if (!authHeader) {
        const token = localStorage.getItem('token');
        if (token) {
          console.log("Setting missing Authorization header from localStorage");
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          console.error("No authentication token found. User may not be logged in.");
          navigate('/login');
          return;
        }
      }
      
      // Add cache busting parameter and make the request
      const response = await axios.get('/api/movies', {
        params: {
          search: searchQuery,
          genre: genreFilter,
          year: yearFilter,
          _cache: new Date().getTime() // Cache busting
        }
      });
      
      console.log("API Response:", response);
      console.log("Movies data:", response.data);
      
      // Check if response is valid
      if (Array.isArray(response.data)) {
        setMovies(response.data);
        
        // Extract unique genres and years for filters
        if (response.data.length > 0) {
          const uniqueGenres = [...new Set(response.data.map(movie => movie.genre))];
          const uniqueYears = [...new Set(response.data.map(movie => movie.release_year))];
          
          setGenres(uniqueGenres);
          setYears(uniqueYears.sort((a, b) => b - a)); // Sort years descending
        }
      } else {
        console.error("Invalid response format:", response.data);
        toast.error('Invalid data received from server');
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      
      // Handle unauthorized errors specifically
      if (error.response && error.response.status === 401) {
        console.error('Authentication error - redirecting to login');
        toast.error('Your session has expired. Please log in again.');
        navigate('/login');
        return;
      }
      
      console.error('Error details:', error.response?.data || 'No response data');
      toast.error('Failed to load movies');
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        await axios.delete(`/api/movies/${id}`);
        setMovies(movies.filter(movie => movie.id !== id));
        toast.success('Movie deleted successfully');
      } catch (error) {
        console.error('Error deleting movie:', error);
        toast.error('Failed to delete movie');
      }
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setGenreFilter('');
    setYearFilter('');
  };

  const forceRefresh = () => {
    // Force a complete refresh of the component
    setLoading(true);
    fetchMovies();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>My Movies</h1>
        <div>
          <button 
            onClick={forceRefresh} 
            className="btn btn-outline-primary me-2"
            title="Refresh movies list"
          >
            <i className="bi bi-arrow-clockwise"></i>
          </button>
          <Link to="/movies/create" className="btn btn-success">
            <i className="bi bi-plus-lg me-1"></i> Add Movie
          </Link>
        </div>
      </div>
      
      <div className="search-box">
        <div className="row g-3">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="col-md-3">
            <select
              className="form-select"
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
            >
              <option value="">All Genres</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
          
          <div className="col-md-3">
            <select
              className="form-select"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              <option value="">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div className="col-md-2">
            <button 
              className="btn btn-outline-secondary w-100"
              onClick={resetFilters}
              disabled={!searchQuery && !genreFilter && !yearFilter}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading movies...</p>
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-film display-1 text-muted"></i>
          <h3 className="mt-3">No movies found</h3>
          <p className="text-muted">
            {searchQuery || genreFilter || yearFilter ? 
              'Try changing your search criteria' : 
              'Add some movies to get started'}
          </p>
          {(searchQuery || genreFilter || yearFilter) && (
            <button className="btn btn-outline-primary mt-2" onClick={resetFilters}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {movies.map(movie => (
            <div className="col" key={movie.id}>
              <div className="card movie-card h-100">
                <div className="card-body">
                  <h5 className="card-title">{movie.title}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">{movie.genre} | {movie.release_year}</h6>
                  <p className="card-text">
                    {movie.description ? (
                      movie.description.length > 100 ? 
                        `${movie.description.substring(0, 100)}...` : 
                        movie.description
                    ) : (
                      <span className="text-muted fst-italic">No description</span>
                    )}
                  </p>
                </div>
                <div className="card-footer bg-transparent">
                  <div className="btn-group w-100">
                    <Link to={`/movies/${movie.id}`} className="btn btn-outline-primary">
                      <i className="bi bi-eye"></i>
                    </Link>
                    <Link to={`/movies/edit/${movie.id}`} className="btn btn-outline-secondary">
                      <i className="bi bi-pencil"></i>
                    </Link>
                    <button 
                      onClick={() => handleDelete(movie.id)} 
                      className="btn btn-outline-danger"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MoviesList;