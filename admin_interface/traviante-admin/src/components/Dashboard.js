import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaChartLine, FaUsers, FaMapMarkedAlt } from 'react-icons/fa';

function Dashboard() {
  const navigate = useNavigate();

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Admin Dashboard</h2>
      <p className="text-center">Welcome to the Traviante Admin Dashboard.</p>
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <FaChartLine size={50} className="mb-3" />
              <Card.Title>Analytics</Card.Title>
              <Card.Text>
                View detailed analytics and reports.
              </Card.Text>
              <Button variant="primary">View Analytics</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <FaUsers size={50} className="mb-3" />
              <Card.Title>Users</Card.Title>
              <Card.Text>
                Manage users and their permissions.
              </Card.Text>
              <Button variant="primary" onClick={() => navigate('/manage-users')}>Manage Users</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <FaMapMarkedAlt size={50} className="mb-3" />
              <Card.Title>Destinations</Card.Title>
              <Card.Text>
                Manage travel destinations.
              </Card.Text>
              <Button variant="primary">Manage Destinations</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;