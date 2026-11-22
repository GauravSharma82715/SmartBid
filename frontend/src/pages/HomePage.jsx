import React, { useEffect, useState } from 'react';
import { Row, Col, Button, Form, ButtonGroup, Badge } from 'react-bootstrap';
import { useGetProductsQuery } from '../slices/productsApiSlice';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Product from '../components/Product';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Paginate from '../components/Paginate';
import ProductCarousel from '../components/ProductCarousel';
import Meta from '../components/Meta';
import socket from '../utils/socket';
import { FaGavel, FaBolt, FaPlus } from 'react-icons/fa';

const HomePage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [limit] = useState(8);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [sortBy, setSortBy] = useState('endingSoon');

  const { search } = useSelector(state => state.search);
  const { userInfo } = useSelector(state => state.auth);

  const { data, isLoading, error, refetch } = useGetProductsQuery({
    limit,
    skip: (currentPage - 1) * limit,
    search,
    category: selectedCategory === 'All' ? '' : selectedCategory,
    status: selectedStatus === 'all' ? '' : selectedStatus,
    sort: sortBy
  });

  // Listen for real-time auction updates across the platform
  useEffect(() => {
    socket.on('auctionListUpdated', () => {
      refetch();
    });
    socket.on('auctionCreated', () => {
      refetch();
    });

    return () => {
      socket.off('auctionListUpdated');
      socket.off('auctionCreated');
    };
  }, [refetch]);

  useEffect(() => {
    if (data) {
      setTotalPage(Math.ceil(data.total / limit));
    }
  }, [data, limit]);

  const pageHandler = pageNum => {
    if (pageNum >= 1 && pageNum <= totalPage && pageNum !== currentPage) {
      setCurrentPage(pageNum);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const categories = ['All', 'Electronics', 'Collectibles', 'Gaming', 'Laptops', 'Fashion'];

  return (
    <>
      <Meta title='SmartBid | Real-Time Online Auction Platform' />

      {/* Hero Banner (shown when not searching) */}
      {!search && (
        <div className='hero-banner shadow-lg text-center text-md-start mb-4'>
          <Row className='align-items-center g-4'>
            <Col lg={8}>
              <div className='d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-primary bg-opacity-25 border border-primary border-opacity-50 text-warning mb-3'>
                <span className='live-dot'></span>
                <small className='fw-bold text-uppercase' style={{ letterSpacing: '1px' }}>
                  Live Bidding Platform
                </small>
              </div>
              <h1 className='display-5 fw-bold text-white mb-3'>
                Bid Smart, Win Fast in <span className='text-warning'>Real-Time</span>
              </h1>
              <p className='lead text-light opacity-75 mb-4' style={{ maxWidth: '650px' }}>
                Join transparent live auctions powered by instant WebSocket updates. Discover verified products, place competitive bids, and win with confidence.
              </p>
              <div className='d-flex flex-wrap gap-3 justify-content-center justify-content-md-start'>
                <a href='#auctions-section' className='btn btn-warning btn-lg fw-bold px-4 py-2 text-dark shadow'>
                  <FaGavel className='me-2' /> Explore Live Auctions
                </a>
                {userInfo && (userInfo.role === 'seller' || userInfo.role === 'admin') ? (
                  <Link to='/seller/create-auction' className='btn btn-outline-light btn-lg fw-bold px-4 py-2'>
                    <FaPlus className='me-2' /> List an Auction
                  </Link>
                ) : (
                  <Link to='/register' className='btn btn-outline-light btn-lg fw-bold px-4 py-2'>
                    Create Seller Account
                  </Link>
                )}
              </div>
            </Col>
            <Col lg={4} className='d-none d-lg-block'>
              <div className='p-3 rounded-4 bg-white bg-opacity-10 backdrop-blur border border-white border-opacity-20 text-white'>
                <h6 className='fw-bold text-warning mb-3 d-flex align-items-center gap-2'>
                  <FaBolt /> Live Platform Stats
                </h6>
                <div className='d-flex justify-content-between py-2 border-bottom border-white border-opacity-10'>
                  <span className='opacity-75'>Active Auctions</span>
                  <span className='fw-bold text-success'>11 Live</span>
                </div>
                <div className='d-flex justify-content-between py-2 border-bottom border-white border-opacity-10'>
                  <span className='opacity-75'>Bid Synchronization</span>
                  <span className='fw-bold text-info'>Socket.io Real-Time</span>
                </div>
                <div className='d-flex justify-content-between py-2 border-bottom border-white border-opacity-10'>
                  <span className='opacity-75'>Escrow & Protection</span>
                  <span className='fw-bold text-warning'>100% Verified</span>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      )}

      {/* Featured Carousel */}
      {!search && <ProductCarousel />}

      <div id='auctions-section' className='pt-2'>
        {/* Filter and Control Bar */}
        <div className='bg-light p-3 rounded-3 shadow-sm border mb-4'>
          <Row className='g-3 align-items-center'>
            {/* Status Filter */}
            <Col xs={12} md={4}>
              <div className='d-flex align-items-center gap-2'>
                <small className='fw-bold text-muted text-uppercase' style={{ fontSize: '0.75rem' }}>
                  Status:
                </small>
                <ButtonGroup size='sm'>
                  <Button
                    variant={selectedStatus === 'active' ? 'primary' : 'outline-secondary'}
                    onClick={() => { setSelectedStatus('active'); setCurrentPage(1); }}
                    className='fw-bold'
                  >
                    ● Live Active
                  </Button>
                  <Button
                    variant={selectedStatus === 'all' ? 'primary' : 'outline-secondary'}
                    onClick={() => { setSelectedStatus('all'); setCurrentPage(1); }}
                    className='fw-semibold'
                  >
                    All Auctions
                  </Button>
                  <Button
                    variant={selectedStatus === 'completed' ? 'primary' : 'outline-secondary'}
                    onClick={() => { setSelectedStatus('completed'); setCurrentPage(1); }}
                    className='fw-semibold'
                  >
                    Completed
                  </Button>
                </ButtonGroup>
              </div>
            </Col>

            {/* Sort Dropdown */}
            <Col xs={12} md={4}>
              <div className='d-flex align-items-center gap-2'>
                <small className='fw-bold text-muted text-uppercase' style={{ fontSize: '0.75rem' }}>
                  Sort By:
                </small>
                <Form.Select
                  size='sm'
                  value={sortBy}
                  onChange={e => { setSortBy(e.target.value); setCurrentPage(1); }}
                  className='fw-semibold shadow-none'
                >
                  <option value='endingSoon'>⏰ Ending Soonest</option>
                  <option value='highestBid'>💰 Highest Current Bid</option>
                  <option value='popular'>🔥 Most Bids</option>
                  <option value='lowestPrice'>🏷️ Starting Price: Low to High</option>
                  <option value='newest'>✨ Recently Listed</option>
                </Form.Select>
              </div>
            </Col>

            {/* Category Pills */}
            <Col xs={12} md={4} className='d-flex justify-content-md-end'>
              <div className='d-flex gap-1 overflow-auto py-1'>
                {categories.map(cat => (
                  <Badge
                    key={cat}
                    bg={selectedCategory === cat ? 'dark' : 'secondary'}
                    className='py-2 px-3 fw-bold cursor-pointer'
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </Col>
          </Row>
        </div>

        {/* Search Notice */}
        {search && (
          <div className='mb-3 d-flex align-items-center justify-content-between'>
            <h5>Search results for: <span className='text-primary'>"{search}"</span></h5>
            <Link to='/' className='btn btn-outline-secondary btn-sm'>Clear Search</Link>
          </div>
        )}

        {/* Auction Grid */}
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant='danger'>{error?.data?.message || error.error}</Message>
        ) : data?.products?.length === 0 ? (
          <div className='text-center py-5 bg-light rounded-4 border'>
            <FaGavel className='text-muted fs-1 mb-3' />
            <h4>No auctions found matching your criteria</h4>
            <p className='text-muted'>Try adjusting your search query, status filter, or category.</p>
            <Button
              variant='outline-primary'
              onClick={() => { setSelectedCategory('All'); setSelectedStatus('active'); setSortBy('endingSoon'); }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <>
            <div className='d-flex align-items-center justify-content-between mb-3'>
              <h4 className='fw-bold mb-0'>
                {selectedStatus === 'completed' ? 'Concluded Auctions' : 'Live Auctions'}
                <Badge bg='primary' className='ms-2 fs-6'>{data.total}</Badge>
              </h4>
            </div>

            <Row className='g-4'>
              {data.products.map(product => (
                <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                  <Product product={product} />
                </Col>
              ))}
            </Row>

            {totalPage > 1 && (
              <div className='mt-4 d-flex justify-content-center'>
                <Paginate
                  currentPage={currentPage}
                  totalPage={totalPage}
                  pageHandler={pageHandler}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default HomePage;
