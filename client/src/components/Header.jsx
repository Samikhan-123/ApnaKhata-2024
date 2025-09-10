import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { NavDropdown, Navbar, Container, Button, Nav } from "react-bootstrap";
import { useAuth } from "../auth/AuthContext";
import { toast } from "react-toastify";
import {
  FaHome,
  FaPlusCircle,
  FaMoneyBillWave,
  FaUserCircle,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaTasks,
} from "react-icons/fa";
import "../components/styles/Header.css";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      logout();
      navigate("/login");
      // close mobile menu
      setIsOpen(false);
    }
  };

  const handleLinkClick = () => setIsOpen(false);

  return (
    <>
      <Navbar
        expand="lg"
        className="custom-navbar mb-"
        fixed="top"
        variant="dark"
      >
        <Container fluid>
          {/* Logo/Brand */}
          <NavLink className="navbar-brand" to="/" onClick={handleLinkClick}>
            <div className="logo-container">
              <img
                src="./ApnaKhata.png"
                alt="Logo"
                style={{ height: "66px", width: "66px", paddingBottom: "10px" }}
              />
              <span className="logo-text">
                <span className="text-gradient">Apna</span>
                <span className="text-light">Khata</span>
              </span>
            </div>
          </NavLink>

          {/* Mobile Toggle Button */}
          <Navbar.Toggle
            aria-controls="navbarNav"
            onClick={() => setIsOpen(!isOpen)}
            className="border-0"
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </Navbar.Toggle>

          {/* Navigation Menu */}
          <Navbar.Collapse in={isOpen} className="navbar-collapse-custom">
            <Nav className="ms-auto">
              {user ? (
                // Authenticated User Menu
                <>
                  {/* Desktop Navigation */}
                  <div className="d-none d-lg-flex align-items-center gap-3">
                    <Nav.Link as={NavLink} to="/" end onClick={handleLinkClick}>
                      <FaHome className="me-2" />
                      Home
                    </Nav.Link>
                    <Nav.Link
                      as={NavLink}
                      to="/create"
                      onClick={handleLinkClick}
                    >
                      <FaPlusCircle className="me-2" />
                      Create
                    </Nav.Link>
                    <Nav.Link
                      as={NavLink}
                      to="/expenses"
                      onClick={handleLinkClick}
                    >
                      <FaMoneyBillWave className="me-2" />
                      Expenses
                    </Nav.Link>
                    <Nav.Link
                      as={NavLink}
                      to="/tasks"
                      onClick={handleLinkClick}
                    >
                      <FaTasks className="me-2" />
                      Tasks
                    </Nav.Link>

                    <NavDropdown
                      title={
                        <div className="d-flex align-items-center">
                          <FaUserCircle className="me-2" />
                          <span>{user.name || "User"}</span>
                        </div>
                      }
                      className="no-caret"
                      id="user-dropdown"
                      align="end"
                    >
                      <NavDropdown.Item
                        onClick={handleLogout}
                        className="text-danger"
                      >
                        <FaSignOutAlt className="me-2" />
                        Logout
                      </NavDropdown.Item>
                    </NavDropdown>
                  </div>

                  {/* Mobile Navigation */}
                  <div className="d-lg-none mobile-nav-content">
                    <Nav.Link
                      as={NavLink}
                      to="/"
                      end
                      onClick={handleLinkClick}
                      className="mobile-nav-item"
                    >
                      <FaHome className="me-2" />
                      Home
                    </Nav.Link>
                    <Nav.Link
                      as={NavLink}
                      to="/create"
                      onClick={handleLinkClick}
                      className="mobile-nav-item"
                    >
                      <FaPlusCircle className="me-2" />
                      Create Expense
                    </Nav.Link>

                    <Nav.Link
                      as={NavLink}
                      to="/expenses"
                      onClick={handleLinkClick}
                      className="mobile-nav-item"
                    >
                      <FaMoneyBillWave className="me-2" />
                      Expenses
                    </Nav.Link>
                    <Nav.Link
                      as={NavLink}
                      to="/tasks"
                      onClick={handleLinkClick}
                      className="mobile-nav-item"
                    >
                      <FaTasks className="me-2" />
                      Tasks
                    </Nav.Link>

                    <div className="mobile-user-section">
                      <div className="user-info">
                        <FaUserCircle size={20} />
                        <div>
                          <h6>{user.name || "User"}</h6>
                          <small>{user.email}</small>
                        </div>
                      </div>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={handleLogout}
                        className="logout-btn"
                      >
                        <FaSignOutAlt className="me-2" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                // Guest User Menu
                <>
                  {/* Desktop Navigation */}
                  <div className="d-none d-lg-flex align-items-center gap-2">
                    <Nav.Link as={NavLink} to="/" end onClick={handleLinkClick}>
                      Home
                    </Nav.Link>
                    <Button
                      variant="outline-light"
                      size="sm"
                      as={NavLink}
                      to="/login"
                    >
                      Login
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      as={NavLink}
                      to="/register"
                    >
                      Register
                    </Button>
                  </div>

                  {/* Mobile Navigation */}
                  <div className="d-lg-none mobile-nav-content">
                    <Nav.Link
                      as={NavLink}
                      to="/"
                      end
                      onClick={handleLinkClick}
                      className="mobile-nav-item"
                    >
                      <FaHome className="me-2" />
                      Home
                    </Nav.Link>
                    <Nav.Link
                      as={NavLink}
                      to="/login"
                      onClick={handleLinkClick}
                      className="mobile-nav-item"
                    >
                      <FaSignOutAlt className="me-2" />
                      Login
                    </Nav.Link>
                    <Nav.Link
                      as={NavLink}
                      to="/register"
                      onClick={handleLinkClick}
                      className="mobile-nav-item"
                    >
                      <FaUserCircle className="me-2" />
                      Register
                    </Nav.Link>
                  </div>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Content padding */}
      <div style={{ paddingTop: "76px" }}></div>
    </>
  );
};

export default Header;
