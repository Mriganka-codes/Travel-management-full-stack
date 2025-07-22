import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Table, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

function DiscountManager() {
  const [discounts, setDiscounts] = useState([]);
  const [form, setForm] = useState({ package_id: '', discount_type: '', discount_value: '', start_date: '', end_date: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = () => {
    setLoading(true);
    axios.get('http://localhost:5000/api/admin/discounts', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setDiscounts(response.data.discounts);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching discounts:', error);
        setError('Failed to fetch discounts. Please try again.');
        setLoading(false);
      });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (editingId) {
      axios.put(`http://localhost:5000/api/admin/discounts/${editingId}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(() => {
          fetchDiscounts();
          setForm({ package_id: '', discount_type: '', discount_value: '', start_date: '', end_date: '' });
          setEditingId(null);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error updating discount:', error);
          setError('Failed to update discount. Please try again.');
          setLoading(false);
        });
    } else {
      axios.post('http://localhost:5000/api/admin/discounts', form, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(() => {
          fetchDiscounts();
          setForm({ package_id: '', discount_type: '', discount_value: '', start_date: '', end_date: '' });
          setLoading(false);
        })
        .catch(error => {
          console.error('Error adding discount:', error);
          setError('Failed to add discount. Please try again.');
          setLoading(false);
        });
    }
  };

  const handleEdit = (discount) => {
    setForm(discount);
    setEditingId(discount.discount_id);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this discount?')) {
      setLoading(true);
      axios.delete(`http://localhost:5000/api/admin/discounts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(() => {
          fetchDiscounts();
          setLoading(false);
        })
        .catch(error => {
          console.error('Error deleting discount:', error);
          setError('Failed to delete discount. Please try again.');
          setLoading(false);
        });
    }
  };

  return (
    <Container>
      <h1 className="my-4">Discount Manager</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit} className="mb-4">
        <Row>
          <Col md={2}>
            <Form.Group>
              <Form.Control name="package_id" type="number" value={form.package_id} onChange={handleChange} placeholder="Package ID" required />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Control name="discount_type" value={form.discount_type} onChange={handleChange} placeholder="Discount Type" required />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Control name="discount_value" type="number" step="0.01" value={form.discount_value} onChange={handleChange} placeholder="Discount Value" required />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Control name="start_date" type="date" value={form.start_date} onChange={handleChange} required />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Control name="end_date" type="date" value={form.end_date} onChange={handleChange} required />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Button type="submit" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : (editingId ? 'Update' : 'Add')} Discount
            </Button>
          </Col>
        </Row>
      </Form>
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Package ID</th>
              <th>Discount Type</th>
              <th>Discount Value</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {discounts.map(discount => (
              <tr key={discount.discount_id}>
                <td>{discount.package_id}</td>
                <td>{discount.discount_type}</td>
                <td>{discount.discount_value}</td>
                <td>{new Date(discount.start_date).toLocaleDateString()}</td>
                <td>{new Date(discount.end_date).toLocaleDateString()}</td>
                <td>
                  <Button variant="outline-primary" size="sm" className="mr-2" onClick={() => handleEdit(discount)}>Edit</Button>
                  <Button variant="outline-danger" size="sm" onClick={() => handleDelete(discount.discount_id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default DiscountManager;