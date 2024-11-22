import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Alert, Button, Container } from 'react-bootstrap';
import { FaRegListAlt } from 'react-icons/fa'; // FontAwesome icon
import Layout from '../components/Layout';

function Home() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAlert, setShowAlert] = useState(false); // For login alert

  useEffect(() => {
    // Replace this with your authentication logic
    const userToken = localStorage.getItem('token');
    if (userToken) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleDetailsClick = () => {
    if (isLoggedIn) {
      navigate('/expenses'); // Navigate to expenses if logged in
    } else {
      setShowAlert(true); // Show alert if not logged in
    }
  };

  return (
    <Layout title="Home - ApnaKhata">
      <div
        className="home-container d-flex flex-column align-items-center justify-content-center text-center"
        style={{
          height: '100vh',
          backgroundColor: '#3498db',
          color: '#fff',
       
        }}
      >
        <Container className="p-5">
          <h1 className="display-3 fw-bold mb-3">Welcome to Apna Khata</h1>
          <p className="lead mb-4">
            Manage your expenses with ease and track your financial records
            seamlessly.
          </p>

          {showAlert && (
            <Alert
              variant="danger"
              onClose={() => setShowAlert(false)}
              dismissible
              className="mb-4"
            >
              Please
              <NavLink className="p-2" to="/login">
                {' '}
                log in{' '}
              </NavLink>
              first to view your expenses.
            </Alert>
          )}

          <Button
            onClick={handleDetailsClick}
            className="btn-lg btn-light text-primary shadow-sm"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <FaRegListAlt className="me-2" /> See Details
          </Button>
        </Container>
      </div>
    </Layout>
  );
}

export default Home;
