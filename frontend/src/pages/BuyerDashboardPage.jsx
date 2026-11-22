import React, { useState } from 'react';
import { Row, Col, Card, Tab, Nav, Table, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useGetBuyerBidsQuery } from '../slices/productsApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Meta from '../components/Meta';
import CountdownTimer from '../components/CountdownTimer';
import { addCurrency } from '../utils/addCurrency';
import {
  FaTrophy,
  FaGavel,
  FaHistory,
  FaCheckCircle,
  FaExclamationCircle,
  FaArrowRight
} from 'react-icons/fa';

const BuyerDashboardPage = () => {
  const { data, isLoading, error } = useGetBuyerBidsQuery();
  const [activeTab, setActiveTab] = useState('active');

  if (isLoading) return <Loader />;
  if (error) return <Message variant='danger'>{error?.data?.message || error.error}</Message>;

  const activeBids = data?.activeBids || [];
  const wonAuctions = data?.wonAuctions || [];
  const allBidsHistory = data?.allBidsHistory || [];

  return (
    <>
      <Meta title='My Bids & Won Auctions | SmartBid' />

      <div className='mb-4'>
        <h2 className='fw-bold mb-1'>My Bids & Won Auctions</h2>
        <p className='text-muted'>Track your live bidding competitions, won items, and bid history</p>
      </div>

      <Tab.Container activeKey={activeTab} onSelect={k => setActiveTab(k)}>
        <Nav variant='pills' className='mb-4 bg-light p-2 rounded-3 border d-inline-flex'>
          <Nav.Item>
            <Nav.Link eventKey='active' className='fw-bold d-flex align-items-center gap-2'>
              <FaGavel /> Active Bids ({activeBids.length})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey='won' className='fw-bold d-flex align-items-center gap-2'>
              <FaTrophy className='text-warning' /> Won Auctions ({wonAuctions.length})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey='history' className='fw-bold d-flex align-items-center gap-2'>
              <FaHistory /> Bid History ({allBidsHistory.length})
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          {/* TAB 1: ACTIVE BIDS */}
          <Tab.Pane eventKey='active'>
            {activeBids.length === 0 ? (
              <Card className='border-0 shadow-sm rounded-4 p-5 text-center text-muted'>
                <FaGavel className='fs-1 mb-3' />
                <h5>You have no active bids at the moment</h5>
                <p>Browse our live auctions and place a bid to start competing.</p>
                <div>
                  <Link to='/'>
                    <Button variant='warning' className='fw-bold'>Explore Live Auctions</Button>
                  </Link>
                </div>
              </Card>
            ) : (
              <Row className='g-3'>
                {activeBids.map(({ auction, isHighestBidder, userMaxBid, currentHighestBid }) => (
                  <Col key={auction._id} md={6} lg={4}>
                    <Card className='border-0 shadow-sm rounded-4 overflow-hidden h-100'>
                      <div className='position-relative bg-light p-3 text-center'>
                        <img
                          src={auction.image}
                          alt={auction.name}
                          style={{ height: '140px', objectFit: 'contain' }}
                        />
                        <div className='position-absolute top-0 start-0 m-2'>
                          {isHighestBidder ? (
                            <Badge bg='success' className='px-2 py-1 shadow-sm'>
                              <FaCheckCircle className='me-1' /> Winning
                            </Badge>
                          ) : (
                            <Badge bg='danger' className='px-2 py-1 shadow-sm'>
                              <FaExclamationCircle className='me-1' /> Outbid
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Card.Body className='p-3 d-flex flex-column'>
                        <h6 className='fw-bold mb-2' style={{ minHeight: '2.5rem' }}>
                          {auction.name}
                        </h6>

                        <div className='bg-light p-2 rounded mb-3'>
                          <div className='d-flex justify-content-between small text-muted mb-1'>
                            <span>Your Max Bid:</span>
                            <strong className='text-dark'>{addCurrency(userMaxBid)}</strong>
                          </div>
                          <div className='d-flex justify-content-between small text-muted'>
                            <span>Current Highest:</span>
                            <strong className={isHighestBidder ? 'text-success' : 'text-danger'}>
                              {addCurrency(currentHighestBid)}
                            </strong>
                          </div>
                        </div>

                        <div className='d-flex justify-content-between align-items-center mb-3'>
                          <small className='text-muted'>Closes in:</small>
                          <CountdownTimer endTime={auction.endTime} isCompact={true} />
                        </div>

                        <div className='mt-auto'>
                          <Link to={`/product/${auction._id}`} className='text-decoration-none'>
                            <Button
                              variant={isHighestBidder ? 'outline-primary' : 'danger'}
                              size='sm'
                              className='w-100 fw-bold'
                            >
                              {isHighestBidder ? 'View Auction' : '⚡ Bid Again Now'}
                            </Button>
                          </Link>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Tab.Pane>

          {/* TAB 2: WON AUCTIONS */}
          <Tab.Pane eventKey='won'>
            {wonAuctions.length === 0 ? (
              <Card className='border-0 shadow-sm rounded-4 p-5 text-center text-muted'>
                <FaTrophy className='fs-1 mb-3 text-warning' />
                <h5>No won auctions yet</h5>
                <p>When you win an auction as the highest bidder, it will appear here with seller and order details.</p>
                <div>
                  <Link to='/'>
                    <Button variant='primary' className='fw-bold'>Browse Live Auctions</Button>
                  </Link>
                </div>
              </Card>
            ) : (
              <div className='table-responsive bg-white rounded-4 shadow-sm border'>
                <Table hover className='align-middle mb-0'>
                  <thead className='table-light'>
                    <tr>
                      <th className='ps-4'>Item</th>
                      <th>Category</th>
                      <th>Final Winning Price</th>
                      <th>Seller</th>
                      <th>Status</th>
                      <th className='pe-4 text-end'>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wonAuctions.map(({ auction, finalPrice, seller }) => (
                      <tr key={auction._id}>
                        <td className='ps-4'>
                          <div className='d-flex align-items-center gap-3'>
                            <img
                              src={auction.image}
                              alt={auction.name}
                              style={{ width: '45px', height: '45px', objectFit: 'contain' }}
                              className='rounded border p-1 bg-light'
                            />
                            <div>
                              <strong className='d-block'>{auction.name}</strong>
                              <small className='text-muted'>Auction Won</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge bg='light' text='dark' className='border'>{auction.category}</Badge>
                        </td>
                        <td className='fw-bold text-success fs-6'>{addCurrency(finalPrice)}</td>
                        <td>{seller?.name || 'Verified Seller'}</td>
                        <td>
                          <Badge bg='success' className='px-2 py-1'>
                            <FaCheckCircle className='me-1' /> Order Confirmed
                          </Badge>
                        </td>
                        <td className='pe-4 text-end'>
                          <Link to={`/product/${auction._id}`}>
                            <Button variant='outline-primary' size='sm' className='fw-semibold'>
                              View Receipt / Details
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Tab.Pane>

          {/* TAB 3: BID HISTORY */}
          <Tab.Pane eventKey='history'>
            {allBidsHistory.length === 0 ? (
              <Card className='border-0 shadow-sm rounded-4 p-5 text-center text-muted'>
                <FaHistory className='fs-1 mb-3' />
                <h5>No bid history found</h5>
              </Card>
            ) : (
              <div className='table-responsive bg-white rounded-4 shadow-sm border'>
                <Table hover className='align-middle mb-0'>
                  <thead className='table-light'>
                    <tr>
                      <th className='ps-4'>Auction Item</th>
                      <th>Bid Amount</th>
                      <th>Date & Time</th>
                      <th>Auction Status</th>
                      <th className='pe-4 text-end'>Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allBidsHistory.map((item, idx) => (
                      <tr key={idx}>
                        <td className='ps-4'>
                          <div className='d-flex align-items-center gap-2'>
                            <img
                              src={item.image}
                              alt={item.auctionTitle}
                              style={{ width: '36px', height: '36px', objectFit: 'contain' }}
                              className='rounded border p-1'
                            />
                            <span className='fw-semibold'>{item.auctionTitle}</span>
                          </div>
                        </td>
                        <td className='fw-bold text-success'>{addCurrency(item.amount)}</td>
                        <td className='text-muted small'>
                          {new Date(item.timestamp).toLocaleString()}
                        </td>
                        <td>
                          <Badge bg={item.status === 'active' ? 'success' : 'secondary'}>
                            {item.status ? item.status.toUpperCase() : 'ACTIVE'}
                          </Badge>
                        </td>
                        <td className='pe-4 text-end'>
                          <Link to={`/product/${item.auctionId}`} className='btn btn-outline-secondary btn-sm'>
                            View <FaArrowRight />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </>
  );
};

export default BuyerDashboardPage;
