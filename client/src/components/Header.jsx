/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { NavDropdown, Navbar, Container } from 'react-bootstrap';
import './styles/headerStyle.css';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-toastify';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Destructure user and logout from context
  const [isOpen, setIsOpen] = useState(false); // State to manage menu toggle

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      logout(); // Call logout to clear the user's session
      navigate('/login'); // Redirect to login page after logout
      toast.success('Logout Successfully');
    }
  };

  const handleLinkClick = () => {
    setIsOpen(false); // Close the menu when a link is clicked
  };

  return (
    <>
      <Navbar
        expand="lg"
         className="custom-navbar "
        fixed="top"
        
      >
        <Container fluid>
          {/* Logo */}
          <NavLink className="navbar-brand fw-bold" to="/expenses">
            <span style={{ color: '#3498db', letterSpacing: '3px' }}>Apna</span>
            <span style={{ color: '#2ecc71', letterSpacing: '3px' }}>
              Khata
            </span>
          </NavLink>

          {/* Toggler */}
          <Navbar.Toggle
            aria-controls="navbarNav"
            onClick={() => setIsOpen(!isOpen)}
            style={{
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
            }}
          >
            {isOpen ? '✖' : '☰'}
          </Navbar.Toggle>

          {/* Navbar Collapse */}
          <Navbar.Collapse
            id="navbarNav"
            in={isOpen}
            className={`justify-content-center ${isOpen ? 'show' : ''}`}
          >
            <ul className="navbar-nav">
              {!user ? (
                <>
                  {/* Guest Links */}
                  <li className="nav-item">
                    <NavLink
                      className="nav-link text-light"
                      to="/"
                      end
                      onClick={handleLinkClick}
                    >
                      Home
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      className="nav-link text-light"
                      to="/register"
                      onClick={handleLinkClick}
                    >
                      Register
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      className="nav-link text-light"
                      to="/login"
                      onClick={handleLinkClick}
                    >
                      Login
                    </NavLink>
                  </li>
                </>
              ) : (
                <>
                  {/* Authenticated Links */}
                  <li className="nav-item">
                    <NavLink
                      className="nav-link text-light"
                      to="/"
                      end
                      onClick={handleLinkClick}
                    >
                      Home
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      className="nav-link text-light"
                      to="/create"
                      onClick={handleLinkClick}
                    >
                      Create
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      className="nav-link text-light"
                      to="/expenses"
                      onClick={handleLinkClick}
                    >
                      Expenses
                    </NavLink>
                  </li>
                  {/* Dropdown for User Menu */}
                  <li className="nav-item">
                    <NavDropdown
                      title={
                        <span className="username">
                          👤 {user.name || 'User'}
                        </span>
                      }
                      id="basic-nav-dropdown"
                    >
                      {/* <NavDropdown.Item
                        as={NavLink}
                        to="/profile"
                        onClick={handleLinkClick}
                      >
                        Profile
                      </NavDropdown.Item>
                      <NavDropdown.Divider /> */}
                      <NavDropdown.Item onClick={handleLogout}>
                        Logout
                      </NavDropdown.Item>
                    </NavDropdown>
                  </li>
                </>
              )}
            </ul>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Padding to avoid content overlapping */}
      <div style={{ paddingBottom: '3.5rem'}}></div>
    </>
  );
};

export default Header;
