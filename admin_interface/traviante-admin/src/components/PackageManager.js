import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function PackageManager() {
  const [packages, setPackages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentPackage, setCurrentPackage] = useState({
    package_name: '',
    description: '',
    package_type: '',
    duration: '',
    start_date: '',
    end_date: '',
    base_price: '',
    currency: ''
  });
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchPackages();
    }
  }, [token]);

  const fetchPackages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/packages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPackages(response.data.packages);
      setError('');
    } catch (error) {
      console.error('Error fetching packages:', error.response?.data || error.message);
      setError('Failed to fetch packages. Please try again.');
    }
  };

  const handleShowModal = (pkg = {
    package_name: '',
    description: '',
    package_type: '',
    duration: '',
    start_date: '',
    end_date: '',
    base_price: '',
    currency: ''
  }) => {
    setCurrentPackage(pkg);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSavePackage = async () => {
    try {
      const formData = {
        ...currentPackage,
        duration: parseInt(currentPackage.duration),
        base_price: parseFloat(currentPackage.base_price)
      };

      if (currentPackage.package_id) {
        await axios.put(`http://localhost:5000/api/admin/packages/${currentPackage.package_id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/admin/packages', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchPackages();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving package:', error);
    }
  };

  const handleDeletePackage = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/packages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
    }
  };

  return (
    <Container>
      <h2 className="my-4">Manage Packages</h2>
      <Button variant="primary" onClick={() => handleShowModal()}>Add Package</Button>
      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>ID</th>
            <th>Package Name</th>
            <th>Description</th>
            <th>Package Type</th>
            <th>Duration</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Base Price</th>
            <th>Currency</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {packages.map(pkg => (
            <tr key={pkg.package_id}>
              <td>{pkg.package_id}</td>
              <td>{pkg.package_name}</td>
              <td>{pkg.description}</td>
              <td>{pkg.package_type}</td>
              <td>{pkg.duration}</td>
              <td>{pkg.start_date}</td>
              <td>{pkg.end_date}</td>
              <td>{pkg.base_price}</td>
              <td>{pkg.currency}</td>
              <td>
                <Button variant="warning" onClick={() => handleShowModal(pkg)}>Edit</Button>{' '}
                <Button variant="danger" onClick={() => handleDeletePackage(pkg.package_id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{currentPackage.package_id ? 'Edit Package' : 'Add Package'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formPackageName">
              <Form.Label>Package Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter package name"
                value={currentPackage.package_name}
                onChange={(e) => setCurrentPackage({ ...currentPackage, package_name: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter description"
                value={currentPackage.description}
                onChange={(e) => setCurrentPackage({ ...currentPackage, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formPackageType">
              <Form.Label>Package Type</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter package type"
                value={currentPackage.package_type}
                onChange={(e) => setCurrentPackage({ ...currentPackage, package_type: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formDuration">
              <Form.Label>Duration</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter duration"
                value={currentPackage.duration}
                onChange={(e) => setCurrentPackage({ ...currentPackage, duration: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formStartDate">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                placeholder="Enter start date"
                value={currentPackage.start_date}
                onChange={(e) => setCurrentPackage({ ...currentPackage, start_date: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formEndDate">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                placeholder="Enter end date"
                value={currentPackage.end_date}
                onChange={(e) => setCurrentPackage({ ...currentPackage, end_date: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formBasePrice">
              <Form.Label>Base Price</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter base price"
                step="0.01"
                value={currentPackage.base_price}
                onChange={(e) => setCurrentPackage({ ...currentPackage, base_price: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formCurrency">
              <Form.Label>Currency</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter currency"
                value={currentPackage.currency}
                onChange={(e) => setCurrentPackage({ ...currentPackage, currency: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
          <Button variant="primary" onClick={handleSavePackage}>{currentPackage.package_id ? 'Save Changes' : 'Add Package'}</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default PackageManager;