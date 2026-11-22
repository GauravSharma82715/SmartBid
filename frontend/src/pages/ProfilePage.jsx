import React from 'react';
import { Row, Col, Button, Table, Card, Badge } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useGetMyOrdersQuery } from '../slices/ordersApiSlice';
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Meta from '../components/Meta';
import ProfileForm from '../components/ProfileForm';
import { addCurrency } from '../utils/addCurrency';
import { FaGavel, FaTrophy, FaUserCircle } from 'react-icons/fa';

const ProfilePage = () => {
  const { userInfo } = useSelector(state => state.auth);
  const { data: orders, isLoading, error } = useGetMyOrdersQuery();

  const isSeller = userInfo && (userInfo.role === 'seller' || userInfo.role === 'admin' || userInfo.isAdmin);

  return (
    <>
      <Meta title={'My Profile | SmartBid'} />

      <div className='mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2'>
        <div className='d-flex align-items-center gap-3'>
          <div className='p-3 bg-primary bg-opacity-10 text-primary rounded-circle fs-3'>
            <FaUserCircle />
          </div>
          <div>
            <h2 className='fw-bold mb-0'>{userInfo?.name}</h2>
            <div className='d-flex align-items-center gap-2 mt-1'>
              <Badge bg={isSeller ? 'warning' : 'primary'} text={isSeller ? 'dark' : 'white'} className='px-2 py-1'>
                {userInfo?.role ? userInfo.role.toUpperCase() : 'BUYER'}
              </Badge>
              <span className='text-muted small'>{userInfo?.email}</span>
            </div>
          </div>
        </div>

        <div className='d-flex gap-2'>
          {isSeller && (
            <Link to='/seller/dashboard'>
              <Button variant='outline-warning' className='text-dark fw-bold d-flex align-items-center gap-1'>
                <FaGavel /> Seller Hub
              </Button>
            </Link>
          )}
          <Link to='/buyer/bids'>
            <Button variant='outline-primary' className='fw-bold d-flex align-items-center gap-1'>
              <FaTrophy /> My Bids &amp; Wins
            </Button>
          </Link>
        </div>
      </div>

      <Row className='g-4'>
        <Col md={4}>
          <Card className='border-0 shadow-sm rounded-4 p-4'>
            <h5 className='fw-bold mb-3'>Update Profile Credentials</h5>
            <ProfileForm />
          </Card>
        </Col>

        <Col md={8}>
          <Card className='border-0 shadow-sm rounded-4 p-4'>
            <div className='d-flex align-items-center justify-content-between mb-3'>
              <h5 className='fw-bold mb-0'>Checkout Orders History</h5>
              <Badge bg='secondary'>{orders?.length || 0} Orders</Badge>
            </div>

            {isLoading ? (
              <Loader />
            ) : error ? (
              <Message variant='danger'>
                {error?.data?.message || error.error}
              </Message>
            ) : orders && orders.length > 0 ? (
              <div className='table-responsive'>
                <Table hover className='align-middle mb-0'>
                  <thead className='table-light'>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Delivery</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order._id}>
                        <td>{order._id.substring(order._id.length - 8)}</td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className='fw-bold'>{addCurrency(order.totalPrice)}</td>
                        <td>
                          {order.isPaid ? (
                            <Badge bg='success'>Paid</Badge>
                          ) : (
                            <Badge bg='danger'>Unpaid</Badge>
                          )}
                        </td>
                        <td>
                          {order.isDelivered ? (
                            <Badge bg='success'>Delivered</Badge>
                          ) : (
                            <Badge bg='warning' text='dark'>Processing</Badge>
                          )}
                        </td>
                        <td>
                          <LinkContainer to={`/order/${order._id}`}>
                            <Button className='btn-sm' variant='outline-primary'>
                              View
                            </Button>
                          </LinkContainer>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <p className='text-muted py-3 mb-0 text-center'>
                No checkout orders yet. Participated in auctions? Check <Link to='/buyer/bids'>My Bids &amp; Wins</Link>.
              </p>
            )}
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ProfilePage;
