import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function TransportationManager() {
  const [transportations, setTransportations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentTransportation, setCurrentTransportation] = useState({
    package_id: '',
    type: '',
    details: '',
    departure_time: '',
    arrival_time: ''
  });
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchTransportations();
    }
  }, [token]);

  const fetchTransportations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/transportations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransportations(response.data.transportations);
      setError('');
    } catch (error) {
      console.error('Error fetching transportations:', error.response?.data || error.message);
      setError('Failed to fetch transportations. Please try again.');
    }
  };

  const handleShowModal = (transportation = {
    package_id: '',
    type: '',
    details: '',
    departure_time: '',
    arrival_time: ''
  }) => {
    setCurrentTransportation(transportation);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSaveTransportation = async () => {
    try {
      if (currentTransportation.transportation_id) {
        await axios.put(`http://localhost:5000/api/admin/transportations/${currentTransportation.transportation_id}`, currentTransportation, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/admin/transportations', currentTransportation, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchTransportations();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving transportation:', error);
    }
  };

  const handleDeleteTransportation = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/transportations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTransportations();
    } catch (error) {
      console.error('Error deleting transportation:', error);
    }
  };

  return (
    <Container>
      <h2 className="my-4">Manage Transportations</h2>
      <Button variant="primary" onClick={() => handleShowModal()}>Add Transportation</Button>
      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>Package ID</th>
            <th>Type</th>
            <th>Details</th>
            <th>Departure Time</th>
            <th>Arrival Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transportations.map(transportation => (
            <tr key={transportation.transportation_id}>
              <td>{transportation.package_id}</td>
              <td>{transportation.type}</td>
              <td>{transportation.details}</td>
              <td>{new Date(transportation.departure_time).toLocaleString()}</td>
              <td>{new Date(transportation.arrival_time).toLocaleString()}</td>
              <td>
                <Button variant="warning" onClick={() => handleShowModal(transportation)}>Edit</Button>{' '}
                <Button variant="danger" onClick={() => handleDeleteTransportation(transportation.transportation_id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{currentTransportation.transportation_id ? 'Edit Transportation' : 'Add Transportation'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formPackageId">
              <Form.Label>Package ID</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter package ID"
                value={currentTransportation.package_id}
                onChange={(e) => setCurrentTransportation({ ...currentTransportation, package_id: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formType">
              <Form.Label>Type</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter type"
                value={currentTransportation.type}
                onChange={(e) => setCurrentTransportation({ ...currentTransportation, type: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formDetails">
              <Form.Label>Details</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter details"
                value={currentTransportation.details}
                onChange={(e) => setCurrentTransportation({ ...currentTransportation, details: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formDepartureTime">
              <Form.Label>Departure Time</Form.Label>
              <Form.Control
                type="datetime-local"
                placeholder="Enter departure time"
                value={currentTransportation.departure_time}
                onChange={(e) => setCurrentTransportation({ ...currentTransportation, departure_time: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formArrivalTime">
              <Form.Label>Arrival Time</Form.Label>
              <Form.Control
                type="datetime-local"
                placeholder="Enter arrival time"
                value={currentTransportation.arrival_time}
                onChange={(e) => setCurrentTransportation({ ...currentTransportation, arrival_time: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
          <Button variant="primary" onClick={handleSaveTransportation}>{currentTransportation.transportation_id ? 'Save Changes' : 'Add Transportation'}</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default TransportationManager;