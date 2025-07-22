import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function ManageUsers() {
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState({ first_name: '', last_name: '', email: '', phone_number: '', address: '' });
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchCustomers();
    }
  }, [token]);

  const fetchCustomers = async () => {
    try {
      console.log('Fetching customers with token:', token);
      const response = await axios.get('http://localhost:5000/api/admin/customers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Customers response:', response.data);
      setCustomers(response.data.customers);
      setError('');
    } catch (error) {
      console.error('Error fetching customers:', error.response?.data || error.message);
      setError('Failed to fetch customers. Please try again.');
    }
  };

  const handleShowModal = (customer = { first_name: '', last_name: '', email: '', phone_number: '', address: '' }) => {
    setCurrentCustomer(customer);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSaveCustomer = async () => {
    try {
      if (currentCustomer.customer_id) {
        await axios.put(`http://localhost:5000/api/admin/customers/${currentCustomer.customer_id}`, currentCustomer, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/admin/customers', currentCustomer, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      fetchCustomers();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  const handleDeleteCustomer = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/customers/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  return (
    <Container>
      <h2 className="my-4">Manage Customers</h2>
      <Button variant="primary" onClick={() => handleShowModal()}>Add Customer</Button>
      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(customer => (
            <tr key={customer.customer_id}>
              <td>{customer.customer_id}</td>
              <td>{customer.first_name}</td>
              <td>{customer.last_name}</td>
              <td>{customer.email}</td>
              <td>{customer.phone_number}</td>
              <td>{customer.address}</td>
              <td>
                <Button variant="warning" onClick={() => handleShowModal(customer)}>Edit</Button>{' '}
                <Button variant="danger" onClick={() => handleDeleteCustomer(customer.customer_id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{currentCustomer.customer_id ? 'Edit Customer' : 'Add Customer'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formFirstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter first name"
                value={currentCustomer.first_name}
                onChange={(e) => setCurrentCustomer({ ...currentCustomer, first_name: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formLastName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter last name"
                value={currentCustomer.last_name}
                onChange={(e) => setCurrentCustomer({ ...currentCustomer, last_name: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={currentCustomer.email}
                onChange={(e) => setCurrentCustomer({ ...currentCustomer, email: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formPhoneNumber">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter phone number"
                value={currentCustomer.phone_number}
                onChange={(e) => setCurrentCustomer({ ...currentCustomer, phone_number: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formAddress">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter address"
                value={currentCustomer.address}
                onChange={(e) => setCurrentCustomer({ ...currentCustomer, address: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
          <Button variant="primary" onClick={handleSaveCustomer}>{currentCustomer.customer_id ? 'Save Changes' : 'Add Customer'}</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ManageUsers;