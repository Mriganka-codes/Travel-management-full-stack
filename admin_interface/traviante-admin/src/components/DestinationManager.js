import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Alert, Spinner, Pagination, Image } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './DestinationManager.css';

function DestinationManager() {
  const [destinations, setDestinations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentDestination, setCurrentDestination] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchDestinations(currentPage);
  }, [currentPage]);

  const fetchDestinations = async (page) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`http://localhost:5000/api/destinations`, {
        params: {
          page,
          limit: 6
        }
      });
      setDestinations(response.data.destinations);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      setError('Failed to fetch destinations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      for (const key in currentDestination) {
        formData.append(key, currentDestination[key]);
      }
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (currentDestination.destination_id) {
        await axios.put(`http://localhost:5000/api/admin/destinations/${currentDestination.destination_id}`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axios.post('http://localhost:5000/api/admin/destinations', formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      setShowModal(false);
      fetchDestinations(currentPage);
    } catch (error) {
      console.error('Error saving destination:', error);
      setError('Failed to save destination. Please try again.');
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
        fetchDestinations(currentPage);
      } catch (error) {
        console.error('Error deleting destination:', error);
        setError('Failed to delete destination. Please try again.');
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Container fluid className="destination-manager">
      <Row className="mb-4">
        <Col>
          <h2 className="text-primary">Manage Destinations</h2>
        </Col>
        <Col xs="auto">
          <Button variant="success" onClick={() => { setCurrentDestination({}); setImagePreview(null); setShowModal(true); }}>
            <FaPlus /> Add New Destination
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
            <Col key={dest.destination_id} lg={4} md={6} sm={12} className="mb-4">
              <Card className="h-100 destination-card">
                {dest.image && (
                  <Card.Img variant="top" src={`http://localhost:5000${dest.image}`} alt={dest.destination_name} />
                )}
                <Card.Body>
                  <Card.Title>{dest.destination_name}</Card.Title>
                  <Card.Text>
                    <strong>Country:</strong> {dest.country}<br />
                    <strong>City:</strong> {dest.city}
                  </Card.Text>
                </Card.Body>
                <Card.Footer className="text-right">
                  <Button variant="outline-primary" size="sm" className="mr-2" onClick={() => { setCurrentDestination(dest); setImagePreview(dest.image ? `http://localhost:5000${dest.image}` : null); setShowModal(true); }}>
                    <FaEdit /> Edit
                  </Button>
                  <Button variant="outline-danger" size="sm" onClick={() => handleDelete(dest.destination_id)}>
                    <FaTrash /> Delete
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Row className="mt-4">
        <Col className="d-flex justify-content-center">
          <Pagination>
            <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
            <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
            {[...Array(totalPages).keys()].map((number) => (
              <Pagination.Item 
                key={number + 1} 
                active={number + 1 === currentPage} 
                onClick={() => handlePageChange(number + 1)}
              >
                {number + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
            <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
          </Pagination>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{currentDestination.destination_id ? 'Edit Destination' : 'Add New Destination'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>Destination Name</Form.Label>
              <Form.Control 
                type="text" 
                value={currentDestination.destination_name || ''} 
                onChange={(e) => setCurrentDestination({...currentDestination, destination_name: e.target.value})}
                required 
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Country</Form.Label>
              <Form.Control 
                type="text" 
                value={currentDestination.country || ''} 
                onChange={(e) => setCurrentDestination({...currentDestination, country: e.target.value})}
                required 
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>City</Form.Label>
              <Form.Control 
                type="text" 
                value={currentDestination.city || ''} 
                onChange={(e) => setCurrentDestination({...currentDestination, city: e.target.value})}
                required 
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Image</Form.Label>
              <Form.Control 
                type="file" 
                onChange={handleImageChange}
              />
            </Form.Group>
            {imagePreview && (
              <Image src={imagePreview} alt="Preview" fluid className="mt-3" />
            )}
            <Button variant="primary" type="submit" className="mt-3">Save Destination</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default DestinationManager;