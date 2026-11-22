import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Button,
  Image,
  Card,
  Form,
  Badge,
  Table,
  Alert
} from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  useGetProductDetailsQuery,
  usePlaceBidMutation,
  useCreateProductReviewMutation,
  useCloseAuctionMutation
} from '../slices/productsApiSlice';
import { toast } from 'react-toastify';
import Rating from '../components/Rating';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Meta from '../components/Meta';
import CountdownTimer from '../components/CountdownTimer';
import { addCurrency } from '../utils/addCurrency';
import socket from '../utils/socket';
import audioService from '../utils/audioService';
import {
  FaGavel,
  FaFire,
  FaShieldAlt,
  FaUserCircle,
  FaHistory,
  FaCheckCircle,
  FaExclamationCircle,
  FaBolt,
  FaVolumeUp,
  FaVolumeMute
} from 'react-icons/fa';

const ProductPage = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector(state => state.auth);

  const {
    data: initialProduct,
    isLoading,
    error,
    refetch
  } = useGetProductDetailsQuery(productId);

  const [product, setProduct] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidFlashed, setBidFlashed] = useState(false);
  const [isMuted, setIsMuted] = useState(audioService.isMuted);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const [placeBidMutation, { isLoading: isBidding }] = usePlaceBidMutation();
  const [closeAuctionMutation, { isLoading: isClosing }] = useCloseAuctionMutation();
  const [createProductReview, { isLoading: isReviewing }] = useCreateProductReviewMutation();

  // Keep local state in sync with query data
  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
    }
  }, [initialProduct]);

  // Socket.io Real-Time Room Subscription
  useEffect(() => {
    if (productId) {
      socket.emit('joinAuction', productId);

      // Listen for real-time bids
      socket.on('bidUpdated', data => {
        if (data.auctionId === productId) {
          setProduct(prev => {
            if (!prev) return prev;

            const wasUserWinning = userInfo && prev.currentWinner && (
              (typeof prev.currentWinner === 'object' ? prev.currentWinner._id : prev.currentWinner) === userInfo._id
            );

            // Audio Feedback
            if (userInfo && data.newBid?.bidder !== userInfo._id) {
              if (wasUserWinning) {
                // Outbid alert sound!
                audioService.playOutbidChime();
                toast.error(`⚠️ YOU HAVE BEEN OUTBID! New highest bid: ₹${data.currentHighestBid.toLocaleString()}`);
              } else {
                // Gavel sound for spectator
                audioService.playGavelStrike();
                toast.info(`🔔 New bid placed: ₹${data.currentHighestBid.toLocaleString()}`);
              }
            } else {
              audioService.playGavelStrike();
            }

            return {
              ...prev,
              currentHighestBid: data.currentHighestBid,
              totalBids: data.totalBids,
              currentWinner: data.currentWinner,
              bids: data.bids
            };
          });

          // Trigger visual flash animation
          setBidFlashed(true);
          setTimeout(() => setBidFlashed(false), 1500);
        }
      });

      // Listen for auction end event
      socket.on('auctionEnded', data => {
        if (data.auctionId === productId) {
          // Play closing triple gavel strike
          audioService.playAuctionClosedSound();
          setProduct(prev => prev ? { ...prev, status: 'completed' } : prev);

          if (userInfo && data.winner && (
            (typeof data.winner === 'object' ? data.winner._id : data.winner) === userInfo._id
          )) {
            setTimeout(() => audioService.playAuctionWonChime(), 900);
            toast.success('🏆 CONGRATULATIONS! You won this auction!');
          } else {
            toast.warning('🏁 This auction has just concluded!');
          }
        }
      });
    }

    return () => {
      socket.emit('leaveAuction', productId);
      socket.off('bidUpdated');
      socket.off('auctionEnded');
    };
  }, [productId, userInfo]);

  if (isLoading) return <Loader />;
  if (error) return <Message variant='danger'>{error?.data?.message || error.error}</Message>;
  if (!product) return null;

  const currentBid = product.currentHighestBid > 0 ? product.currentHighestBid : product.startingPrice || product.price;
  const isCompleted = product.status === 'completed' || new Date() >= new Date(product.endTime);
  const isSeller = userInfo && product.user && (
    (typeof product.user === 'object' ? product.user._id : product.user) === userInfo._id
  );
  const isHighestBidder = userInfo && product.currentWinner && (
    (typeof product.currentWinner === 'object' ? product.currentWinner._id : product.currentWinner) === userInfo._id
  );

  const minNextBid = product.totalBids === 0 ? product.startingPrice : currentBid + 100;

  // Handle placing a bid
  const handleBidSubmit = async e => {
    e.preventDefault();
    if (!userInfo) {
      toast.warning('Please log in to place bids');
      navigate('/login');
      return;
    }

    const amount = Number(bidAmount);
    if (!amount || amount < minNextBid) {
      toast.error(`Bid must be at least ₹${minNextBid.toLocaleString()}`);
      return;
    }

    try {
      await placeBidMutation({ productId, amount }).unwrap();
      audioService.playBidSound();
      toast.success(`🎉 You are now the highest bidder at ₹${amount.toLocaleString()}!`);
      setBidAmount('');
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'Failed to place bid');
    }
  };

  // Quick increment bid helper
  const addIncrement = increment => {
    const base = Number(bidAmount) || currentBid;
    setBidAmount(base + increment);
  };

  // Close auction handler (seller or admin)
  const handleCloseAuction = async () => {
    if (window.confirm('Are you sure you want to conclude this auction now?')) {
      try {
        await closeAuctionMutation(productId).unwrap();
        toast.success('Auction concluded successfully');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  // Submit review
  const handleReviewSubmit = async e => {
    e.preventDefault();
    try {
      await createProductReview({ productId, rating, comment }).unwrap();
      toast.success('Review submitted successfully');
      setComment('');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <Meta title={`${product.name} | SmartBid`} description={product.description} />
      <Link className='btn btn-outline-secondary btn-sm mb-3' to='/'>
        &larr; Back to Live Auctions
      </Link>

      <Row className='g-4'>
        {/* Left Column: Product Image & Details */}
        <Col lg={7}>
          <Card className='border-0 shadow-sm rounded-4 overflow-hidden mb-4'>
            <div
              className='position-relative bg-light d-flex align-items-center justify-content-center p-4'
              style={{ minHeight: '380px' }}
            >
              <Image
                src={product.image}
                alt={product.name}
                fluid
                style={{ maxHeight: '380px', objectFit: 'contain' }}
              />
              <div className='position-absolute top-0 start-0 m-3 d-flex gap-2'>
                {!isCompleted ? (
                  <Badge bg='success' className='px-3 py-2 fs-6 shadow'>
                    <span className='live-dot'></span> LIVE BIDDING
                  </Badge>
                ) : (
                  <Badge bg='secondary' className='px-3 py-2 fs-6 shadow'>
                    AUCTION CONCLUDED
                  </Badge>
                )}
                <Badge bg='dark' className='px-3 py-2 fs-6'>
                  {product.category}
                </Badge>
              </div>
            </div>

            <Card.Body className='p-4'>
              <h2 className='fw-bold mb-3'>{product.name}</h2>
              <div className='d-flex align-items-center gap-3 mb-4'>
                <Rating value={product.rating} text={`(${product.numReviews} seller reviews)`} />
                <span className='text-muted'>•</span>
                <span className='text-muted'>Brand: <strong className='text-dark'>{product.brand}</strong></span>
              </div>

              <h5 className='fw-bold mb-2'>Item Description</h5>
              <p className='text-secondary' style={{ lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                {product.description}
              </p>
            </Card.Body>
          </Card>

          {/* Seller Profile Card */}
          <Card className='border-0 shadow-sm rounded-4 mb-4 p-4'>
            <div className='d-flex align-items-center justify-content-between'>
              <div className='d-flex align-items-center gap-3'>
                <div
                  className='bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fs-2'
                  style={{ width: '56px', height: '56px' }}
                >
                  <FaUserCircle />
                </div>
                <div>
                  <h6 className='fw-bold mb-0'>
                    {product.user?.name || 'Verified Seller'}
                  </h6>
                  <small className='text-muted'>
                    Seller Rating: ⭐ {product.user?.avgRating ? product.user.avgRating.toFixed(1) : '5.0'} / 5.0
                  </small>
                </div>
              </div>
              <Badge bg='success' className='px-3 py-2'>
                <FaShieldAlt className='me-1' /> Verified Seller
              </Badge>
            </div>
          </Card>

          {/* Live Bid History Stream */}
          <Card className='border-0 shadow-sm rounded-4 p-4 mb-4'>
            <div className='d-flex align-items-center justify-content-between mb-3'>
              <h5 className='fw-bold mb-0 d-flex align-items-center gap-2'>
                <FaHistory className='text-primary' /> Real-Time Bid History
              </h5>
              <Badge bg='warning' text='dark' className='px-2 py-1'>
                {product.bids?.length || 0} Total Bids
              </Badge>
            </div>

            {product.bids && product.bids.length > 0 ? (
              <div className='table-responsive'>
                <Table hover className='align-middle mb-0'>
                  <thead className='table-light'>
                    <tr>
                      <th className='text-start'>Bidder</th>
                      <th>Amount</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.bids.map((bid, index) => (
                      <tr key={index} className={index === 0 ? 'table-warning fw-bold' : ''}>
                        <td className='text-start'>
                          {bid.bidderName ? bid.bidderName.replace(/(?<=.).(?=.*@)/g, '*') : 'Anonymous'}
                          {userInfo && bid.bidder === userInfo._id && (
                            <Badge bg='info' text='dark' className='ms-2'>You</Badge>
                          )}
                        </td>
                        <td className='text-success fw-bold'>
                          {addCurrency(bid.amount)}
                        </td>
                        <td className='text-muted small'>
                          {new Date(bid.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td>
                          {index === 0 ? (
                            <Badge bg='success'>Highest Bidder</Badge>
                          ) : (
                            <span className='text-muted small'>Outbid</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <div className='text-center py-4 text-muted'>
                <p className='mb-0'>No bids placed yet. Be the first to bid!</p>
              </div>
            )}
          </Card>
        </Col>

        {/* Right Column: Interactive Bidding Console */}
        <Col lg={5}>
          <div className='position-sticky' style={{ top: '100px' }}>
            <Card
              className={`border-0 shadow-lg rounded-4 overflow-hidden mb-4 ${bidFlashed ? 'bid-flash' : ''
                }`}
            >
              {/* Header Status */}
              <div className='p-4 bg-dark text-white text-center'>
                <div className='d-flex justify-content-between align-items-center mb-2'>
                  <span className='text-muted text-uppercase small fw-bold'>Time Remaining</span>
                  <div className='d-flex align-items-center gap-2'>
                    <button
                      type='button'
                      onClick={() => setIsMuted(audioService.toggleMute())}
                      className='btn btn-outline-light btn-sm py-0 px-2 d-flex align-items-center gap-1'
                      style={{ fontSize: '0.72rem' }}
                      title={isMuted ? 'Audio Muted. Click to Enable Sound Effects' : 'Audio On. Click to Mute'}
                    >
                      {isMuted ? <FaVolumeMute className='text-danger' /> : <FaVolumeUp className='text-warning' />}
                      <span>{isMuted ? 'Sound Off' : 'Audio On'}</span>
                    </button>
                    {!isCompleted && (
                      <Badge bg='danger' className='d-flex align-items-center gap-1'>
                        <span className='live-dot'></span> LIVE
                      </Badge>
                    )}
                  </div>
                </div>
                <div className='d-flex justify-content-center'>
                  <CountdownTimer
                    endTime={product.endTime}
                    onExpire={() => setProduct(prev => prev ? { ...prev, status: 'completed' } : prev)}
                  />
                </div>
              </div>

              {/* Price & Current Winner Display */}
              <Card.Body className='p-4'>
                <div className='p-3 rounded-3 bg-light border mb-4 text-center'>
                  <small className='text-muted text-uppercase fw-semibold d-block mb-1'>
                    {product.totalBids > 0 ? 'Current Highest Bid' : 'Starting Bid Price'}
                  </small>
                  <div className='display-5 fw-bold text-success mb-1'>
                    {addCurrency(currentBid)}
                  </div>
                  {product.totalBids > 0 && product.currentWinner && (
                    <div className='d-flex align-items-center justify-content-center gap-1 text-muted small'>
                      <FaFire className='text-danger' />
                      Leading Bidder: <strong>{typeof product.currentWinner === 'object' ? product.currentWinner.name : 'Active Bidder'}</strong>
                    </div>
                  )}
                </div>

                {/* Status Indicator for Current User */}
                {isHighestBidder && !isCompleted && (
                  <Alert variant='success' className='d-flex align-items-center gap-2 py-2 mb-3'>
                    <FaCheckCircle className='fs-5' />
                    <div>
                      <strong>You are in the lead!</strong> You hold the current highest bid.
                    </div>
                  </Alert>
                )}

                {isSeller && (
                  <Alert variant='info' className='py-2 mb-3 small'>
                    <FaExclamationCircle className='me-1' /> This is your auction listing. Sellers cannot place bids on their own items.
                  </Alert>
                )}

                {/* Bidding Controls (if active and not seller) */}
                {!isCompleted && !isSeller && (
                  <Form onSubmit={handleBidSubmit}>
                    <Form.Group className='mb-3'>
                      <div className='d-flex justify-content-between align-items-center mb-1'>
                        <Form.Label className='fw-bold mb-0'>Enter Your Bid</Form.Label>
                        <small className='text-muted'>
                          Min. Bid: <strong>₹{minNextBid.toLocaleString()}</strong>
                        </small>
                      </div>
                      <div className='input-group input-group-lg'>
                        <span className='input-group-text fw-bold bg-white'>₹</span>
                        <Form.Control
                          type='number'
                          placeholder={`Min. ${minNextBid}`}
                          value={bidAmount}
                          onChange={e => setBidAmount(e.target.value)}
                          min={minNextBid}
                          step='10'
                          required
                          className='fw-bold'
                        />
                      </div>
                    </Form.Group>

                    {/* Quick Increment Buttons */}
                    <div className='mb-4'>
                      <small className='text-muted d-block mb-2 fw-semibold'>Quick Bid Boost:</small>
                      <div className='d-flex gap-2 flex-wrap'>
                        <Button
                          variant='outline-secondary'
                          size='sm'
                          className='flex-grow-1 fw-bold'
                          onClick={() => addIncrement(100)}
                        >
                          +₹100
                        </Button>
                        <Button
                          variant='outline-secondary'
                          size='sm'
                          className='flex-grow-1 fw-bold'
                          onClick={() => addIncrement(500)}
                        >
                          +₹500
                        </Button>
                        <Button
                          variant='outline-secondary'
                          size='sm'
                          className='flex-grow-1 fw-bold'
                          onClick={() => addIncrement(1000)}
                        >
                          +₹1,000
                        </Button>
                        <Button
                          variant='outline-secondary'
                          size='sm'
                          className='flex-grow-1 fw-bold'
                          onClick={() => addIncrement(5000)}
                        >
                          +₹5,000
                        </Button>
                      </div>
                      <div className='d-flex justify-content-between align-items-center mt-2'>
                        <button
                          type='button'
                          onClick={() => audioService.playBidSound()}
                          className='btn btn-link text-muted p-0 small text-decoration-none'
                          style={{ fontSize: '0.74rem' }}
                        >
                          <FaVolumeUp className='text-primary me-1' /> Test Bid Sound
                        </button>
                        <button
                          type='button'
                          onClick={() => audioService.playOutbidChime()}
                          className='btn btn-link text-muted p-0 small text-decoration-none'
                          style={{ fontSize: '0.74rem' }}
                        >
                          🔔 Test Outbid Chime
                        </button>
                      </div>
                    </div>

                    <Button
                      variant='primary'
                      type='submit'
                      size='lg'
                      className='w-100 fw-bold shadow py-3 d-flex align-items-center justify-content-center gap-2'
                      disabled={isBidding}
                    >
                      <FaGavel /> {isBidding ? 'Submitting Bid...' : 'Place Bid Now'}
                    </Button>
                  </Form>
                )}

                {/* If completed */}
                {isCompleted && (
                  <div className='text-center py-3'>
                    <Badge bg='secondary' className='fs-6 py-2 px-3 mb-3'>
                      AUCTION ENDED
                    </Badge>
                    <h5 className='fw-bold'>
                      Winning Bid: <span className='text-success'>{addCurrency(currentBid)}</span>
                    </h5>
                    {product.currentWinner && (
                      <p className='text-muted small'>
                        Winner: <strong>{typeof product.currentWinner === 'object' ? product.currentWinner.name : 'Winning Bidder'}</strong>
                      </p>
                    )}
                  </div>
                )}

                {/* Seller Controls: Force Conclude */}
                {isSeller && !isCompleted && (
                  <div className='mt-3'>
                    <Button
                      variant='outline-danger'
                      size='sm'
                      className='w-100 fw-semibold'
                      onClick={handleCloseAuction}
                      disabled={isClosing}
                    >
                      {isClosing ? 'Closing Auction...' : 'Conclude Auction Early'}
                    </Button>
                  </div>
                )}

                {/* Guarantees list */}
                <div className='mt-4 pt-3 border-top'>
                  <ul className='list-unstyled small text-muted mb-0 d-flex flex-column gap-2'>
                    <li className='d-flex align-items-center gap-2'>
                      <FaShieldAlt className='text-success' /> 100% Escrow Buyer Protection
                    </li>
                    <li className='d-flex align-items-center gap-2'>
                      <FaBolt className='text-warning' /> Instant WebSocket Bid Confirmation
                    </li>
                    <li className='d-flex align-items-center gap-2'>
                      <FaCheckCircle className='text-primary' /> Verified Seller Guarantee
                    </li>
                  </ul>
                </div>
              </Card.Body>
            </Card>

            {/* Seller Review Box */}
            <Card className='border-0 shadow-sm rounded-4 p-4'>
              <h5 className='fw-bold mb-3'>Rate this Seller</h5>
              {userInfo ? (
                <Form onSubmit={handleReviewSubmit}>
                  <Form.Group className='mb-3'>
                    <Form.Label className='small fw-bold'>Rating</Form.Label>
                    <Form.Select
                      value={rating}
                      onChange={e => setRating(e.target.value)}
                      size='sm'
                    >
                      <option value='5'>5 - Outstanding</option>
                      <option value='4'>4 - Very Good</option>
                      <option value='3'>3 - Average</option>
                      <option value='2'>2 - Poor</option>
                      <option value='1'>1 - Terrible</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className='mb-3'>
                    <Form.Label className='small fw-bold'>Feedback / Comment</Form.Label>
                    <Form.Control
                      as='textarea'
                      rows={2}
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder='Write feedback about the seller...'
                      required
                    />
                  </Form.Group>
                  <Button
                    variant='outline-primary'
                    size='sm'
                    type='submit'
                    disabled={isReviewing}
                    className='fw-bold'
                  >
                    Submit Review
                  </Button>
                </Form>
              ) : (
                <p className='text-muted small mb-0'>
                  Please <Link to='/login'>Sign in</Link> to leave a review.
                </p>
              )}
            </Card>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default ProductPage;
