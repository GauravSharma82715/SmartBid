import React from 'react';
import { Button, Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { addCurrency } from '../utils/addCurrency';
import CountdownTimer from './CountdownTimer';
import { FaGavel, FaFire, FaEye } from 'react-icons/fa';

const Product = ({ product }) => {
  const isCompleted = product.status === 'completed' || new Date() >= new Date(product.endTime);
  const currentBid = product.currentHighestBid > 0 ? product.currentHighestBid : product.startingPrice || product.price;

  return (
    <Card className='my-3 rounded shadow-sm auction-card border-0 overflow-hidden h-100'>
      {/* Status Banner */}
      <div className='position-relative'>
        <Link to={`/product/${product._id}`}>
          <Card.Img
            variant='top'
            src={product.image}
            alt={product.name}
            style={{
              height: '210px',
              objectFit: 'contain',
              padding: '16px',
              backgroundColor: '#f8fafc',
              transition: 'transform 0.3s ease'
            }}
          />
        </Link>
        <div className='position-absolute top-0 start-0 m-2 d-flex gap-1'>
          {!isCompleted ? (
            <Badge bg='success' className='d-flex align-items-center gap-1 shadow-sm px-2 py-1'>
              <span className='live-dot'></span> LIVE AUCTION
            </Badge>
          ) : (
            <Badge bg='secondary' className='px-2 py-1'>
              ENDED
            </Badge>
          )}
          {product.category && (
            <Badge bg='light' text='dark' className='border px-2 py-1'>
              {product.category}
            </Badge>
          )}
        </div>
        {product.views > 0 && (
          <div className='position-absolute top-0 end-0 m-2'>
            <Badge bg='dark' className='opacity-75 px-2 py-1'>
              <FaEye className='me-1' /> {product.views}
            </Badge>
          </div>
        )}
      </div>

      <Card.Body className='d-flex flex-column p-3'>
        {/* Title */}
        <Link
          to={`/product/${product._id}`}
          style={{ textDecoration: 'none', color: '#1e293b' }}
        >
          <Card.Title
            as='h6'
            className='fw-bold mb-2'
            style={{
              height: '2.8rem',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: '1.4'
            }}
            title={product.name}
          >
            {product.name}
          </Card.Title>
        </Link>

        {/* Live Timer */}
        <div className='my-2 py-1 px-2 rounded bg-light border d-flex justify-content-between align-items-center'>
          <small className='text-muted' style={{ fontSize: '0.75rem' }}>TIME LEFT:</small>
          <CountdownTimer endTime={product.endTime} isCompact={true} />
        </div>

        {/* Pricing Info */}
        <div className='mt-2 mb-3'>
          <div className='d-flex justify-content-between align-items-end'>
            <div>
              <small className='text-muted d-block' style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                {product.totalBids > 0 ? 'Current Bid' : 'Starting Price'}
              </small>
              <span className='fs-5 fw-bold text-success'>
                {addCurrency(currentBid)}
              </span>
            </div>
            <div className='text-end'>
              <Badge bg='warning' text='dark' className='d-flex align-items-center gap-1 px-2 py-1'>
                <FaFire className='text-danger' /> {product.totalBids || 0} bids
              </Badge>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className='mt-auto'>
          <Link to={`/product/${product._id}`} className='text-decoration-none'>
            <Button
              variant={isCompleted ? 'outline-secondary' : 'primary'}
              className='w-100 fw-bold d-flex align-items-center justify-content-center gap-2 py-2'
            >
              <FaGavel /> {isCompleted ? 'View Result' : 'Place Bid Now'}
            </Button>
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Product;
