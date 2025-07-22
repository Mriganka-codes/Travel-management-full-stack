import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function ItineraryManager() {
  const [itineraries, setItineraries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentItinerary, setCurrentItinerary] = useState({
    package_id: '',
    day: '',
    description: '',
    inclusions: '',
    exclusions: ''
  });
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchItineraries();
    }
  }, [token]);

  const fetchItineraries = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/itineraries', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItineraries(response.data.itineraries);
      setError('');
    } catch (error) {
      console.error('Error fetching itineraries:', error.response?.data || error.message);
      setError('Failed to fetch itineraries. Please try again.');
    }
  };

  const handleShowModal = (itinerary = {
    package_id: '',
    day: '',
    description: '',
    inclusions: '',
    exclusions: ''
  }) => {
    setCurrentItinerary(itinerary);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSaveItinerary = async () => {
    try {
      if (currentItinerary.itinerary_id) {
        await axios.put(`http://localhost:5000/api/admin/itineraries/${currentItinerary.itinerary_id}`, currentItinerary, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/admin/itineraries', currentItinerary, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchItineraries();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving itinerary:', error);
    }
  };

  const handleDeleteItinerary = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/itineraries/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchItineraries();
    } catch (error) {
      console.error('Error deleting itinerary:', error);
    }
  };

  return (
    <Container>
      <h2 className="my-4">Manage Itineraries</h2>
      <Button variant="primary" onClick={() => handleShowModal()}>Add Itinerary</Button>
      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>Package ID</th>
            <th>Day</th>
            <th>Description</th>
            <th>Inclusions</th>
            <th>Exclusions</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {itineraries.map(itinerary => (
            <tr key={itinerary.itinerary_id}>
              <td>{itinerary.package_id}</td>
              <td>{itinerary.day}</td>
              <td>{itinerary.description}</td>
              <td>{itinerary.inclusions}</td>
              <td>{itinerary.exclusions}</td>
              <td>
                <Button variant="warning" onClick={() => handleShowModal(itinerary)}>Edit</Button>{' '}
                <Button variant="danger" onClick={() => handleDeleteItinerary(itinerary.itinerary_id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{currentItinerary.itinerary_id ? 'Edit Itinerary' : 'Add Itinerary'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formPackageId">
              <Form.Label>Package ID</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter package ID"
                value={currentItinerary.package_id}
                onChange={(e) => setCurrentItinerary({ ...currentItinerary, package_id: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formDay">
              <Form.Label>Day</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter day"
                value={currentItinerary.day}
                onChange={(e) => setCurrentItinerary({ ...currentItinerary, day: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                placeholder="Enter description"
                value={currentItinerary.description}
                onChange={(e) => setCurrentItinerary({ ...currentItinerary, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formInclusions">
              <Form.Label>Inclusions</Form.Label>
              <Form.Control
                as="textarea"
                placeholder="Enter inclusions"
                value={currentItinerary.inclusions}
                onChange={(e) => setCurrentItinerary({ ...currentItinerary, inclusions: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formExclusions">
              <Form.Label>Exclusions</Form.Label>
              <Form.Control
                as="textarea"
                placeholder="Enter exclusions"
                value={currentItinerary.exclusions}
                onChange={(e) => setCurrentItinerary({ ...currentItinerary, exclusions: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
          <Button variant="primary" onClick={handleSaveItinerary}>{currentItinerary.itinerary_id ? 'Save Changes' : 'Add Itinerary'}</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ItineraryManager;