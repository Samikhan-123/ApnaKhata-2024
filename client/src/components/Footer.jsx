import { Container, Row, Col } from "react-bootstrap";
import { FaHeart, FaEnvelope } from "react-icons/fa";
import "../components/styles/Footer.css"
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <Container>
        <Row className="align-items-center">
          <Col lg={6} className="text-center text-lg-start mb-3 mb-lg-0">
            <div className="footer-brand">
              <img
                src="./ApnaKhata.png"
                alt="Logo"
                style={{ height: "66px", width: "66px", paddingBottom: "10px" }}
              />
              <span className="text-gradient">Apna</span>
              <span className="text-light">Khata</span>
            </div>
            <p className="footer-tagline mb-0 ">
              Smart expense tracking for everyone
            </p>
          </Col>

          <Col lg={6} className="text-center text-lg-end">
            <div className="footer-links">
              <a
                href="mailto:heyjhonyelbow@gmail.com"
                className="footer-link "
                aria-label="Email us"
              >
                <FaEnvelope className="me-2" />
                heyjhonyelbow@gmail.com
              </a>
            </div>
          </Col>
        </Row>

        <Row>
          <Col className="text-center">
            <div className="footer-bottom">
              <p className="mb-0">
                Made with <FaHeart className="text-danger" /> · © {currentYear}{" "}
                ApnaKhata. All rights reserved.
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
