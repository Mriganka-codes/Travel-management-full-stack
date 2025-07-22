import React from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function AppNavbar() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Brand href="/">Traviante Admin</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <LinkContainer to="/">
            <Nav.Link>Dashboard</Nav.Link>
          </LinkContainer>
          <LinkContainer to="/destinations">
            <Nav.Link>Destination Manager</Nav.Link>
          </LinkContainer>
          <LinkContainer to="/manage-users">
            <Nav.Link>Manage Users</Nav.Link>
          </LinkContainer>
          <LinkContainer to="/packages">
            <Nav.Link>Package Manager</Nav.Link>
          </LinkContainer>
          <LinkContainer to="/accommodations">
            <Nav.Link>Accommodation Manager</Nav.Link>
          </LinkContainer>
          <LinkContainer to="/itineraries">
            <Nav.Link>Itinerary Manager</Nav.Link>
          </LinkContainer>
          <LinkContainer to="/discounts">
            <Nav.Link>Discount Manager</Nav.Link>
          </LinkContainer>
          <LinkContainer to="/transportations">
            <Nav.Link>Transportation Manager</Nav.Link>
          </LinkContainer>
        </Nav>
        {token && (
          <Nav className="ml-auto">
            <Button variant="outline-light" onClick={handleLogout}>
              Logout
            </Button>
          </Nav>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
}

export default AppNavbar;