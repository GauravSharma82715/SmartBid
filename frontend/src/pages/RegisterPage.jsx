import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Form, Button, Row, Col, InputGroup, Card } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useRegisterMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaGavel, FaShoppingCart } from 'react-icons/fa';
import FormContainer from '../components/FormContainer';
import Meta from '../components/Meta';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('buyer'); // 'buyer' or 'seller'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setConfirmShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [register, { isLoading }] = useRegisterMutation();
  const { userInfo } = useSelector(state => state.auth);

  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const redirect = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [userInfo, redirect, navigate]);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setConfirmShowPassword(!showConfirmPassword);

  const submitHandler = async e => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    try {
      const res = await register({ name, email, password, role }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate(redirect);
      toast.success(`Welcome to SmartBid as a ${role === 'seller' ? 'Seller' : 'Buyer'}!`);
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  };

  return (
    <FormContainer>
      <Meta title={'Sign Up | SmartBid'} />
      <div className='text-center mb-4'>
        <div className='d-inline-flex p-3 bg-primary bg-opacity-10 text-primary rounded-circle mb-2 fs-3'>
          <FaGavel />
        </div>
        <h2 className='fw-bold'>Join SmartBid</h2>
        <p className='text-muted'>Create an account to participate in real-time auctions</p>
      </div>

      <Form onSubmit={submitHandler}>
        {/* Account Type Selector */}
        <div className='mb-4'>
          <Form.Label className='fw-bold small text-uppercase text-muted'>Select Account Type</Form.Label>
          <Row className='g-2'>
            <Col xs={6}>
              <Card
                className={`p-3 text-center cursor-pointer border ${
                  role === 'buyer' ? 'border-primary bg-primary bg-opacity-10 text-primary' : 'bg-light'
                }`}
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => setRole('buyer')}
              >
                <FaShoppingCart className='fs-3 mb-1 mx-auto' />
                <strong className='d-block'>Buyer</strong>
                <small className='text-muted' style={{ fontSize: '0.7rem' }}>Bid & Win Items</small>
              </Card>
            </Col>
            <Col xs={6}>
              <Card
                className={`p-3 text-center cursor-pointer border ${
                  role === 'seller' ? 'border-warning bg-warning bg-opacity-10 text-warning text-dark' : 'bg-light'
                }`}
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => setRole('seller')}
              >
                <FaGavel className='fs-3 mb-1 mx-auto' />
                <strong className='d-block'>Seller</strong>
                <small className='text-muted' style={{ fontSize: '0.7rem' }}>List & Manage Auctions</small>
              </Card>
            </Col>
          </Row>
        </div>

        <Form.Group className='mb-3' controlId='name'>
          <Form.Label className='fw-semibold'>Full Name</Form.Label>
          <Form.Control
            value={name}
            type='text'
            placeholder='Enter full name'
            required
            onChange={e => setName(e.target.value)}
          />
        </Form.Group>

        <Form.Group className='mb-3' controlId='email'>
          <Form.Label className='fw-semibold'>Email address</Form.Label>
          <Form.Control
            value={email}
            type='email'
            placeholder='Enter email'
            required
            onChange={e => setEmail(e.target.value)}
          />
        </Form.Group>

        <Form.Group className='mb-3' controlId='password'>
          <Form.Label className='fw-semibold'>Password</Form.Label>
          <InputGroup>
            <Form.Control
              type={showPassword ? 'text' : 'password'}
              value={password}
              placeholder='Enter password (min 6 characters)'
              required
              minLength={6}
              onChange={e => setPassword(e.target.value)}
            />
            <InputGroup.Text
              onClick={togglePasswordVisibility}
              style={{ cursor: 'pointer' }}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </InputGroup.Text>
          </InputGroup>
        </Form.Group>

        <Form.Group className='mb-4' controlId='confirmPassword'>
          <Form.Label className='fw-semibold'>Confirm Password</Form.Label>
          <InputGroup>
            <Form.Control
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              placeholder='Confirm password'
              required
              onChange={e => setConfirmPassword(e.target.value)}
            />
            <InputGroup.Text
              onClick={toggleConfirmPasswordVisibility}
              style={{ cursor: 'pointer' }}
            >
              {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
            </InputGroup.Text>
          </InputGroup>
        </Form.Group>

        <Button
          className='w-100 py-2 fw-bold shadow-sm'
          variant='warning'
          type='submit'
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : `Register as ${role === 'seller' ? 'Seller' : 'Buyer'}`}
        </Button>
      </Form>

      <div className='text-center mt-4 pt-3 border-top'>
        <span className='text-muted'>Already have an account?</span>{' '}
        <Link
          to={redirect ? `/login?redirect=${redirect}` : '/login'}
          className='fw-bold text-decoration-none'
        >
          Sign In
        </Link>
      </div>
    </FormContainer>
  );
};

export default RegisterPage;
