import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Badge, NavDropdown, Button } from 'react-bootstrap';
import { FaGavel, FaUser, FaPlus, FaChartLine, FaTrophy, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { LinkContainer } from 'react-router-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';
import { toast } from 'react-toastify';
import SearchBox from './SearchBox';
import audioService from '../utils/audioService';

const Header = () => {
  const { userInfo } = useSelector(state => state.auth);
  const [logoutApiCall] = useLogoutMutation();
  const [isMuted, setIsMuted] = useState(audioService.isMuted);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleSound = () => {
    const nextState = audioService.toggleMute();
    setIsMuted(nextState);
    if (!nextState) {
      audioService.playGavelStrike();
      toast.info('🔊 Auction Sound Effects Enabled!');
    } else {
      toast.info('🔇 Sound Effects Muted');
    }
  };

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  };

  const isSeller = userInfo && (userInfo.role === 'seller' || userInfo.role === 'admin' || userInfo.isAdmin);
  const isBuyer = userInfo && (userInfo.role === 'buyer' || !userInfo.role);
  const isAdmin = userInfo && (userInfo.role === 'admin' || userInfo.isAdmin);

  return (
    <Navbar
      bg='dark'
      variant='dark'
      expand='lg'
      collapseOnSelect
      className='fixed-top shadow-sm py-2'
      style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
    >
      <Container>
        {/* Brand Logo */}
        <LinkContainer to='/'>
          <Navbar.Brand className='d-flex align-items-center gap-2 fw-bold fs-4'>
            <span
              className='d-inline-flex align-items-center justify-content-center bg-primary text-white rounded p-1'
              style={{ width: '34px', height: '34px' }}
            >
              <FaGavel />
            </span>
            <span style={{ letterSpacing: '-0.5px' }}>
              Smart<span className='text-warning'>Bid</span>
            </span>
            <Badge bg='danger' className='ms-1 px-2 py-1' style={{ fontSize: '0.65rem', verticalAlign: 'middle' }}>
              LIVE
            </Badge>
          </Navbar.Brand>
        </LinkContainer>

        <Navbar.Toggle aria-controls='smartbid-navbar' />

        <Navbar.Collapse id='smartbid-navbar'>
          {/* Search Box */}
          <div className='my-2 my-lg-0 mx-lg-3 flex-grow-1' style={{ maxWidth: '420px' }}>
            <SearchBox />
          </div>

          <Nav className='ms-auto align-items-lg-center gap-2'>
            <LinkContainer to='/'>
              <Nav.Link className='fw-semibold'>Live Auctions</Nav.Link>
            </LinkContainer>

            {/* Sound Toggle Button */}
            <Button
              variant='outline-secondary'
              size='sm'
              onClick={toggleSound}
              title={isMuted ? 'Sound Muted. Click to Enable Sound Effects' : 'Sound Enabled. Click to Mute'}
              className='text-white border-0 px-2 py-1 d-flex align-items-center gap-1'
            >
              {isMuted ? <FaVolumeMute className='text-danger' /> : <FaVolumeUp className='text-warning' />}
              <span className='d-none d-xl-inline small'>{isMuted ? 'Muted' : 'Audio'}</span>
            </Button>

            {/* Seller Quick Action: Create Auction */}
            {isSeller && (
              <LinkContainer to='/seller/create-auction'>
                <Button variant='outline-warning' size='sm' className='fw-bold d-flex align-items-center gap-1 mx-1'>
                  <FaPlus /> Create Auction
                </Button>
              </LinkContainer>
            )}

            {/* Role Dashboards */}
            {isSeller && (
              <LinkContainer to='/seller/dashboard'>
                <Nav.Link className='d-flex align-items-center gap-1 text-warning fw-semibold'>
                  <FaChartLine /> Seller Hub
                </Nav.Link>
              </LinkContainer>
            )}

            {isBuyer && userInfo && (
              <LinkContainer to='/buyer/bids'>
                <Nav.Link className='d-flex align-items-center gap-1 fw-semibold'>
                  <FaTrophy /> My Bids & Wins
                </Nav.Link>
              </LinkContainer>
            )}

            {isAdmin && (
              <LinkContainer to='/admin/dashboard'>
                <Nav.Link className='fw-semibold text-info'>Admin Panel</Nav.Link>
              </LinkContainer>
            )}

            {/* User Profile / Auth */}
            {userInfo ? (
              <NavDropdown
                title={
                  <span className='d-inline-flex align-items-center gap-1'>
                    <FaUser /> {userInfo.name.split(' ')[0]}
                    <Badge
                      bg={
                        userInfo.role === 'seller'
                          ? 'warning'
                          : userInfo.role === 'admin'
                          ? 'danger'
                          : 'info'
                      }
                      text='dark'
                      className='ms-1'
                      style={{ fontSize: '0.7rem' }}
                    >
                      {userInfo.role ? userInfo.role.toUpperCase() : 'BUYER'}
                    </Badge>
                  </span>
                }
                id='user-menu'
                align='end'
              >
                <LinkContainer to='/profile'>
                  <NavDropdown.Item>My Profile</NavDropdown.Item>
                </LinkContainer>
                {isBuyer && (
                  <LinkContainer to='/buyer/bids'>
                    <NavDropdown.Item>My Bids & Won Auctions</NavDropdown.Item>
                  </LinkContainer>
                )}
                {isSeller && (
                  <>
                    <LinkContainer to='/seller/dashboard'>
                      <NavDropdown.Item>Seller Analytics & Listings</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to='/seller/create-auction'>
                      <NavDropdown.Item>List New Auction</NavDropdown.Item>
                    </LinkContainer>
                  </>
                )}
                {isAdmin && (
                  <>
                    <NavDropdown.Divider />
                    <LinkContainer to='/admin/dashboard'>
                      <NavDropdown.Item>Admin Dashboard</NavDropdown.Item>
                    </LinkContainer>
                  </>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={logoutHandler} className='text-danger'>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <div className='d-flex align-items-center gap-2'>
                <LinkContainer to='/login'>
                  <Button variant='outline-light' size='sm' className='fw-semibold'>
                    Sign In
                  </Button>
                </LinkContainer>
                <LinkContainer to='/register'>
                  <Button variant='warning' size='sm' className='fw-bold text-dark'>
                    Sign Up
                  </Button>
                </LinkContainer>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
