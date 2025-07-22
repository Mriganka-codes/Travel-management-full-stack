import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Image, Alert } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './SearchResults.css';

function SearchResults() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchTerm = new URLSearchParams(location.search).get('term');

  useEffect(() => {
    fetchSearchResults();
  }, [searchTerm]);

  const fetchSearchResults = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`http://localhost:5000/api/destinations`, {
        params: {
          search: searchTerm
        }
      });
      setDestinations(response.data.destinations);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setError('Failed to fetch search results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this destination?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/destinations/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchSearchResults();
      } catch (error) {
        console.error('Error deleting destination:', error);
        setError('Failed to delete destination. Please try again.');
      }
    }
  };

  return (
    <Container fluid className="search-results">
      <Row className="mb-4">
        <Col>
          <h2 className="text-primary">Search Results for "{searchTerm}"</h2>
        </Col>
        <Col xs="auto">
          <Button variant="secondary" onClick={() => navigate('/destinations')}>
            <FaPlus /> Back to Destinations
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <Row>
          {destinations.map((dest) => (
            <Col key={dest.id} lg={4} md={6} sm={12} className="mb-4">
              <Card className="h-100 destination-card">
                <Card.Img 
                  variant="top" 
                  src={dest.image ? `http://localhost:5000${dest.image}` : 'placeholder-image.jpg'} 
                  alt={dest.name}
                />
                <Card.Body>
                  <Card.Title>{dest.name}</Card.Title>
                  <Card.Text>
                    <strong>Address:</strong> {dest.address}<br />
                    <strong>Price:</strong> ${dest.price}<br />
                    <strong>Category:</strong> {dest.category}<br />
                    <strong>Theme:</strong> {dest.theme}
                  </Card.Text>
                </Card.Body>
                <Card.Footer className="text-right">
                  <Button variant="outline-primary" size="sm" className="mr-2" onClick={() => navigate(`/edit-destination/${dest.id}`)}>
                    <FaEdit /> Edit
                  </Button>
                  <Button variant="outline-danger" size="sm" onClick={() => handleDelete(dest.id)}>
                    <FaTrash /> Delete
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default SearchResults;