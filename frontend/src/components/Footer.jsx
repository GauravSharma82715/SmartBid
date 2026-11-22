import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaGavel, FaShieldAlt } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className='bg-dark text-light py-4 mt-5 border-top border-secondary'>
      <Container>
        <Row className='align-items-center g-3'>
          <Col md={6} className='text-center text-md-start'>
            <div className='d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-1'>
              <FaGavel className='text-warning' />
              <strong className='fs-5'>SmartBid Platform</strong>
            </div>
            <small className='text-muted d-block'>
              Real-time transparent online auctions powered by MERN &amp; WebSocket technology.
            </small>
          </Col>
          <Col md={6} className='text-center text-md-end'>
            <small className='text-muted d-flex align-items-center justify-content-center justify-content-md-end gap-2'>
              <FaShieldAlt className='text-success' /> 100% Escrow Protected &bull; SmartBid &copy; {currentYear}
            </small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
