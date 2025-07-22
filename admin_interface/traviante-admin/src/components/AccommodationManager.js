import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function AccommodationManager() {
  const [accommodations, setAccommodations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentAccommodation, setCurrentAccommodation] = useState({
    hotel_name: '',
    hotel_rating: '',
    room_type: '',
    meals_included: '',
    amenities: ''
  });
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchAccommodations();
    }
  }, [token]);

  const fetchAccommodations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/accommodations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAccommodations(response.data.accommodations);
      setError('');
    } catch (error) {
      console.error('Error fetching accommodations:', error.response?.data || error.message);
      setError('Failed to fetch accommodations. Please try again.');
    }
  };

  const handleShowModal = (acc = {
    hotel_name: '',
    hotel_rating: '',
    room_type: '',
    meals_included: '',
    amenities: ''
  }) => {
    setCurrentAccommodation(acc);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSaveAccommodation = async () => {
    try {
      if (currentAccommodation.accommodation_id) {
        await axios.put(`http://localhost:5000/api/admin/accommodations/${currentAccommodation.accommodation_id}`, currentAccommodation, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/admin/accommodations', currentAccommodation, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchAccommodations();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving accommodation:', error);
    }
  };

  const handleDeleteAccommodation = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/accommodations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAccommodations();
    } catch (error) {
      console.error('Error deleting accommodation:', error);
    }
  };

  return (
    <Container>
      <h2 className="my-4">Manage Accommodations</h2>
      <Button variant="primary" onClick={() => handleShowModal()}>Add Accommodation</Button>
      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>Hotel Name</th>
            <th>Rating</th>
            <th>Room Type</th>
            <th>Meals Included</th>
            <th>Amenities</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {accommodations.map(acc => (
            <tr key={acc.accommodation_id}>
              <td>{acc.hotel_name}</td>
              <td>{acc.hotel_rating}</td>
              <td>{acc.room_type}</td>
              <td>{acc.meals_included}</td>
              <td>{acc.amenities}</td>
              <td>
                <Button variant="warning" onClick={() => handleShowModal(acc)}>Edit</Button>{' '}
                <Button variant="danger" onClick={() => handleDeleteAccommodation(acc.accommodation_id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{currentAccommodation.accommodation_id ? 'Edit Accommodation' : 'Add Accommodation'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formHotelName">
              <Form.Label>Hotel Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter hotel name"
                value={currentAccommodation.hotel_name}
                onChange={(e) => setCurrentAccommodation({ ...currentAccommodation, hotel_name: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formHotelRating">
              <Form.Label>Hotel Rating</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter hotel rating"
                value={currentAccommodation.hotel_rating}
                onChange={(e) => setCurrentAccommodation({ ...currentAccommodation, hotel_rating: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formRoomType">
              <Form.Label>Room Type</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter room type"
                value={currentAccommodation.room_type}
                onChange={(e) => setCurrentAccommodation({ ...currentAccommodation, room_type: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formMealsIncluded">
              <Form.Label>Meals Included</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter meals included"
                value={currentAccommodation.meals_included}
                onChange={(e) => setCurrentAccommodation({ ...currentAccommodation, meals_included: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formAmenities">
              <Form.Label>Amenities</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter amenities"
                value={currentAccommodation.amenities}
                onChange={(e) => setCurrentAccommodation({ ...currentAccommodation, amenities: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
          <Button variant="primary" onClick={handleSaveAccommodation}>{currentAccommodation.accommodation_id ? 'Save Changes' : 'Add Accommodation'}</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default AccommodationManager;