import { Container, Row, Col } from "react-bootstrap";

const Footer = () => {
  return (
    <footer style={{backgroundColor: '#000', color: '#fff' }} className=" text-dark py-4 mb-0 w-100 bottom-0">
      <Container>
        <Row className="justify-content-center text-center">
          <Col lg={4} md={6} sm={12} className="mb-3">
            {/* <h5>SK</h5> */}
            </Col>
            </Row>
        <Row>
          <Col className="text-center text-white">
            <p>&copy; {new Date().getFullYear()} SK Relationships. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
