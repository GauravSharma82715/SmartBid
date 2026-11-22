import React from 'react';
import { Link } from 'react-router-dom';
import { Carousel, Image, Badge } from 'react-bootstrap';
import { useGetTopProductsQuery } from '../slices/productsApiSlice';
import { addCurrency } from '../utils/addCurrency';
import { FaFire } from 'react-icons/fa';
import CountdownTimer from './CountdownTimer';

const ProductCarousel = () => {
  const { data: products } = useGetTopProductsQuery();

  if (!products || products.length === 0) return null;

  return (
    <Carousel fade className='text-center bg-dark rounded-4 overflow-hidden mb-5 shadow-lg'>
      {products.map(product => {
        const currentBid = product.currentHighestBid > 0 ? product.currentHighestBid : product.startingPrice || product.price;

        return (
          <Carousel.Item key={product._id} interval={4500}>
            <Link to={`/product/${product._id}`} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  height: '420px',
                  backgroundColor: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px'
                }}
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  style={{
                    maxHeight: '360px',
                    maxWidth: '80%',
                    objectFit: 'contain'
                  }}
                />
              </div>
              <Carousel.Caption className='p-4 text-start rounded-top-3' style={{ background: 'rgba(15, 23, 42, 0.85)' }}>
                <div className='d-flex align-items-center gap-2 mb-2'>
                  <Badge bg='danger' className='d-flex align-items-center gap-1 px-2 py-1'>
                    <span className='live-dot'></span> FEATURED LIVE AUCTION
                  </Badge>
                  {product.totalBids > 0 && (
                    <Badge bg='warning' text='dark' className='px-2 py-1'>
                      <FaFire className='text-danger me-1' /> {product.totalBids} Bids Placed
                    </Badge>
                  )}
                </div>
                <h4 className='fw-bold text-white mb-2' style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                  {product.name}
                </h4>
                <div className='d-flex align-items-center justify-content-between flex-wrap gap-2'>
                  <div>
                    <small className='text-muted d-block text-uppercase' style={{ fontSize: '0.75rem' }}>
                      Current Highest Bid
                    </small>
                    <span className='fs-3 fw-bold text-warning'>
                      {addCurrency(currentBid)}
                    </span>
                  </div>
                  <div className='bg-dark px-3 py-1 rounded border border-secondary'>
                    <small className='text-muted d-block text-uppercase' style={{ fontSize: '0.7rem' }}>
                      Closing In
                    </small>
                    <CountdownTimer endTime={product.endTime} isCompact={true} />
                  </div>
                </div>
              </Carousel.Caption>
            </Link>
          </Carousel.Item>
        );
      })}
    </Carousel>
  );
};

export default ProductCarousel;
