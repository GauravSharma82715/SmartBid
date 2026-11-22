import React from 'react';
import { Row, Col, Card, Table, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  useGetSellerAuctionsQuery,
  useGetSellerAnalyticsQuery,
  useDeleteProductMutation,
  useCloseAuctionMutation
} from '../slices/productsApiSlice';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Meta from '../components/Meta';
import { addCurrency } from '../utils/addCurrency';
import { toast } from 'react-toastify';
import {
  FaPlus,
  FaGavel,
  FaEye,
  FaCheckCircle,
  FaTrash,
  FaChartBar,
  FaCoins
} from 'react-icons/fa';

const SellerDashboardPage = () => {
  const {
    data: auctions,
    isLoading: isAuctionsLoading,
    error: auctionsError,
    refetch: refetchAuctions
  } = useGetSellerAuctionsQuery();

  const {
    data: analytics,
    isLoading: isAnalyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics
  } = useGetSellerAnalyticsQuery();

  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [closeAuction, { isLoading: isClosing }] = useCloseAuctionMutation();

  const handleDelete = async id => {
    if (window.confirm('Are you sure you want to delete this auction?')) {
      try {
        await deleteProduct(id).unwrap();
        toast.success('Auction deleted');
        refetchAuctions();
        refetchAnalytics();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const handleClose = async id => {
    if (window.confirm('Conclude this auction and finalize highest bidder as winner?')) {
      try {
        await closeAuction(id).unwrap();
        toast.success('Auction concluded successfully');
        refetchAuctions();
        refetchAnalytics();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  if (isAuctionsLoading || isAnalyticsLoading) return <Loader />;
  if (auctionsError || analyticsError) {
    return (
      <Message variant='danger'>
        {auctionsError?.data?.message || analyticsError?.data?.message || 'Error loading dashboard'}
      </Message>
    );
  }

  return (
    <>
      <Meta title='Seller Hub & Analytics | SmartBid' />

      <div className='d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2'>
        <div>
          <h2 className='fw-bold mb-0'>Seller Dashboard & Analytics</h2>
          <p className='text-muted mb-0'>Monitor your live auctions, buyer bids, and sales revenue</p>
        </div>
        <Link to='/seller/create-auction'>
          <Button variant='warning' className='fw-bold d-flex align-items-center gap-2 shadow-sm text-dark'>
            <FaPlus /> Create New Auction
          </Button>
        </Link>
      </div>

      {/* KPI Cards Row */}
      <Row className='g-3 mb-4'>
        <Col sm={6} lg={3}>
          <Card className='border-0 shadow-sm rounded-4 p-3 h-100 bg-white'>
            <div className='d-flex align-items-center justify-content-between'>
              <div>
                <small className='text-muted text-uppercase fw-bold' style={{ fontSize: '0.7rem' }}>
                  Active Auctions
                </small>
                <h3 className='fw-bold text-primary mb-0 mt-1'>{analytics?.activeCount || 0}</h3>
              </div>
              <div className='p-3 bg-primary bg-opacity-10 text-primary rounded-circle fs-4'>
                <FaGavel />
              </div>
            </div>
          </Card>
        </Col>

        <Col sm={6} lg={3}>
          <Card className='border-0 shadow-sm rounded-4 p-3 h-100 bg-white'>
            <div className='d-flex align-items-center justify-content-between'>
              <div>
                <small className='text-muted text-uppercase fw-bold' style={{ fontSize: '0.7rem' }}>
                  Total Bids Received
                </small>
                <h3 className='fw-bold text-warning mb-0 mt-1'>{analytics?.totalBids || 0}</h3>
              </div>
              <div className='p-3 bg-warning bg-opacity-10 text-warning rounded-circle fs-4'>
                <FaChartBar />
              </div>
            </div>
          </Card>
        </Col>

        <Col sm={6} lg={3}>
          <Card className='border-0 shadow-sm rounded-4 p-3 h-100 bg-white'>
            <div className='d-flex align-items-center justify-content-between'>
              <div>
                <small className='text-muted text-uppercase fw-bold' style={{ fontSize: '0.7rem' }}>
                  Listing Views
                </small>
                <h3 className='fw-bold text-info mb-0 mt-1'>{analytics?.totalViews || 0}</h3>
              </div>
              <div className='p-3 bg-info bg-opacity-10 text-info rounded-circle fs-4'>
                <FaEye />
              </div>
            </div>
          </Card>
        </Col>

        <Col sm={6} lg={3}>
          <Card className='border-0 shadow-sm rounded-4 p-3 h-100 bg-white'>
            <div className='d-flex align-items-center justify-content-between'>
              <div>
                <small className='text-muted text-uppercase fw-bold' style={{ fontSize: '0.7rem' }}>
                  Completed Revenue
                </small>
                <h3 className='fw-bold text-success mb-0 mt-1'>
                  {addCurrency(analytics?.totalRevenue || 0)}
                </h3>
              </div>
              <div className='p-3 bg-success bg-opacity-10 text-success rounded-circle fs-4'>
                <FaCoins />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Analytics Charts Row */}
      {analytics?.bidsChartData?.length > 0 && (
        <Row className='g-4 mb-4'>
          <Col lg={7}>
            <Card className='border-0 shadow-sm rounded-4 p-4 h-100'>
              <h5 className='fw-bold mb-3'>Bids Received Per Auction</h5>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={analytics.bidsChartData}>
                    <XAxis dataKey='name' tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey='bids' fill='#3b82f6' radius={[4, 4, 0, 0]} name='Total Bids' />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>

          <Col lg={5}>
            <Card className='border-0 shadow-sm rounded-4 p-4 h-100'>
              <h5 className='fw-bold mb-3'>Audience Views per Listing</h5>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <AreaChart data={analytics.viewsChartData}>
                    <XAxis dataKey='name' tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Area type='monotone' dataKey='views' stroke='#10b981' fill='#d1fae5' name='Views' />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Seller's Listings Table */}
      <Card className='border-0 shadow-sm rounded-4 overflow-hidden mb-4'>
        <div className='p-4 bg-white border-bottom d-flex align-items-center justify-content-between'>
          <h5 className='fw-bold mb-0'>My Auction Listings ({auctions?.length || 0})</h5>
        </div>
        {auctions?.length === 0 ? (
          <div className='p-5 text-center text-muted'>
            <FaGavel className='fs-1 mb-3' />
            <h5>You haven't listed any auctions yet</h5>
            <p>Start selling by creating your first live auction listing today.</p>
            <Link to='/seller/create-auction'>
              <Button variant='warning' className='fw-bold'>Create First Auction</Button>
            </Link>
          </div>
        ) : (
          <div className='table-responsive'>
            <Table hover className='align-middle mb-0'>
              <thead className='table-light'>
                <tr>
                  <th className='text-start ps-4'>Item</th>
                  <th>Category</th>
                  <th>Starting Price</th>
                  <th>Current Highest Bid</th>
                  <th>Total Bids</th>
                  <th>Status</th>
                  <th>Closing Time</th>
                  <th className='text-end pe-4'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {auctions.map(item => {
                  const isItemEnded = item.status === 'completed' || new Date() >= new Date(item.endTime);
                  return (
                    <tr key={item._id}>
                      <td className='text-start ps-4'>
                        <div className='d-flex align-items-center gap-3'>
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                            className='rounded border p-1 bg-light'
                          />
                          <div>
                            <Link to={`/product/${item._id}`} className='fw-bold text-dark text-decoration-none'>
                              {item.name}
                            </Link>
                            <small className='text-muted d-block'>
                              ID: {item._id.substring(item._id.length - 8)}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge bg='light' text='dark' className='border'>{item.category}</Badge>
                      </td>
                      <td className='fw-semibold'>{addCurrency(item.startingPrice)}</td>
                      <td className='fw-bold text-success'>
                        {addCurrency(item.currentHighestBid || item.startingPrice)}
                      </td>
                      <td>
                        <Badge bg='warning' text='dark'>{item.totalBids || 0} bids</Badge>
                      </td>
                      <td>
                        {!isItemEnded ? (
                          <Badge bg='success'>● Live Active</Badge>
                        ) : (
                          <Badge bg='secondary'>Completed</Badge>
                        )}
                      </td>
                      <td className='text-muted small'>
                        {new Date(item.endTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className='text-end pe-4'>
                        <div className='d-flex justify-content-end gap-1'>
                          <Link to={`/product/${item._id}`}>
                            <Button variant='outline-primary' size='sm' title='View Auction'>
                              <FaEye />
                            </Button>
                          </Link>
                          {!isItemEnded && (
                            <Button
                              variant='outline-success'
                              size='sm'
                              title='Conclude Auction Now'
                              onClick={() => handleClose(item._id)}
                              disabled={isClosing}
                            >
                              <FaCheckCircle />
                            </Button>
                          )}
                          <Button
                            variant='outline-danger'
                            size='sm'
                            title='Delete Auction'
                            onClick={() => handleDelete(item._id)}
                            disabled={isDeleting}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Card>
    </>
  );
};

export default SellerDashboardPage;
