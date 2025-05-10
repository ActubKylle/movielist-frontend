// src/components/movies/MovieForm.js
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const currentYear = new Date().getFullYear();

function MovieForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    release_year: '',
    description: ''
  });
  
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Fetch all available genres for the dropdown
    fetchGenres();
    
    if (isEditing) {
      fetchMovie();
    }
  }, [id]);

  const fetchGenres = async () => {
    try {
      const response = await axios.get('/api/genres');
      setGenres(response.data);
    } catch (error) {
      console.error('Error fetching genres:', error);
      // If we couldn't fetch the genres, we'll use a default list
      setGenres([
        'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 
        'Documentary', 'Drama', 'Fantasy', 'Horror', 'Mystery',
        'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western'
      ]);
    }
  };

  const fetchMovie = async () => {
    try {
      console.log(`Fetching movie with ID: ${id}`);
      const response = await axios.get(`/api/movies/${id}`);
      console.log("Movie data:", response.data);
      
      // Set form data from the response
      setFormData(response.data);
      
      // Set image preview if there's an image path
      if (response.data.image_path) {
        setImagePreview(`/storage/${response.data.image_path}`);
      }
    } catch (error) {
      console.error('Error fetching movie:', error);
      
      if (error.response && error.response.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        navigate('/login');
        return;
      }
      
      toast.error('Could not load movie details');
      navigate('/movies');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      setImage(file);
      
      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Clear any errors for the image field
      if (errors.image) {
        setErrors({
          ...errors,
          image: null
        });
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    
    try {
      // Check if auth header is set
      const authHeader = axios.defaults.headers.common['Authorization'];
      if (!authHeader) {
        const token = localStorage.getItem('token');
        if (token) {
          console.log("Setting missing Authorization header from localStorage");
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          throw new Error("No authentication token found");
        }
      }
      
      // Create a form data object to send the image
      const formPayload = new FormData();
      formPayload.append('title', formData.title);
      formPayload.append('genre', formData.genre);
      formPayload.append('release_year', formData.release_year);
      formPayload.append('description', formData.description || '');
      
      // Only append the image if a new one was selected
      if (image) {
        formPayload.append('image', image);
      }
      
      let response;
      if (isEditing) {
        console.log(`Updating movie with ID: ${id}`);
        // For PUT requests with FormData, we need to use the _method parameter
        formPayload.append('_method', 'PUT');
        response = await axios.post(`/api/movies/${id}`, formPayload, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log("Update response:", response.data);
        toast.success('Movie updated successfully');
      } else {
        console.log("Creating new movie");
        response = await axios.post('/api/movies', formPayload, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log('Movie created successfully:', response.data);
        toast.success('Movie added successfully');
      }
      
      // Navigate immediately without timeout
      navigate('/movies', { state: { refreshMovies: true, newMovieId: response.data.id } });
    } catch (error) {
      console.error('Error saving movie:', error);
      
      if (error.response && error.response.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        navigate('/login');
        return;
      }
      
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
        toast.error('Please correct the errors in the form');
      } else {
        toast.error(isEditing ? 'Failed to update movie' : 'Failed to add movie');
      }
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading movie data...</p>
      </div>
    );
  }

  return (
    <div>
      <h1>{isEditing ? 'Edit Movie' : 'Add New Movie'}</h1>
      
      <div className="card shadow-sm">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="mb-3">
              <label htmlFor="title" className="form-label">Movie Title</label>
              <input
                type="text"
                className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter movie title"
                required
              />
              {errors.title && <div className="invalid-feedback">{errors.title[0]}</div>}
            </div>
            
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="genre" className="form-label">Genre</label>
                <div className="input-group">
                  <select
                    className={`form-select ${errors.genre ? 'is-invalid' : ''}`}
                    id="genre"
                    name="genre"
                    value={formData.genre}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Genre</option>
                    {genres.map((genre, index) => (
                      <option key={index} value={genre}>{genre}</option>
                    ))}
                  </select>
                  {errors.genre && <div className="invalid-feedback">{errors.genre[0]}</div>}
                </div>
              </div>
              
              <div className="col-md-6">
                <label htmlFor="release_year" className="form-label">Release Year</label>
                <input
                  type="number"
                  className={`form-control ${errors.release_year ? 'is-invalid' : ''}`}
                  id="release_year"
                  name="release_year"
                  value={formData.release_year}
                  onChange={handleChange}
                  min="1900"
                  max={currentYear + 5}
                  placeholder="Enter release year"
                  required
                />
                {errors.release_year && <div className="invalid-feedback">{errors.release_year[0]}</div>}
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows="4"
                placeholder="Enter movie description (optional)"
              ></textarea>
              {errors.description && <div className="invalid-feedback">{errors.description[0]}</div>}
            </div>
            
            <div className="mb-4">
              <label htmlFor="image" className="form-label">Movie Poster</label>
              <input
                type="file"
                className={`form-control ${errors.image ? 'is-invalid' : ''}`}
                id="image"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
              />
              {errors.image && <div className="invalid-feedback">{errors.image[0]}</div>}
              
              {imagePreview && (
                <div className="mt-2">
                  <p>Preview:</p>
                  <img 
                    src={imagePreview} 
                    alt="Movie poster preview" 
                    className="img-thumbnail" 
                    style={{ maxHeight: '200px' }} 
                  />
                </div>
              )}
            </div>
            
            <div className="d-flex justify-content-between">
              <button 
                type="button" 
                className="btn btn-outline-secondary"
                onClick={() => navigate('/movies')}
              >
                Cancel
              </button>
              
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {isEditing ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  isEditing ? 'Update Movie' : 'Add Movie'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default MovieForm;
