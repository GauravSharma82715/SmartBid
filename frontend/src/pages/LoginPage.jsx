import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, InputGroup, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaGavel, FaUserCheck } from 'react-icons/fa';
import FormContainer from '../components/FormContainer';
import Meta from '../components/Meta';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();
  const { userInfo } = useSelector(state => state.auth);

  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const redirect = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [userInfo, redirect, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const submitHandler = async e => {
    e.preventDefault();
    try {
      const res = await login({ email, password, remember }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate(redirect);
      toast.success(`Welcome back, ${res.name}!`);
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  };

  // Quick preset demo login helper for convenience
  const fillCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <FormContainer>
      <Meta title={'Sign In | SmartBid'} />
      <div className='text-center mb-4'>
        <div className='d-inline-flex p-3 bg-primary bg-opacity-10 text-primary rounded-circle mb-2 fs-3'>
          <FaGavel />
        </div>
        <h2 className='fw-bold'>Sign In to SmartBid</h2>
        <p className='text-muted'>Access live bidding, manage your listings, and track your wins</p>
      </div>

      <Form onSubmit={submitHandler}>
        <Form.Group className='mb-3' controlId='email'>
          <Form.Label className='fw-semibold'>Email address</Form.Label>
          <Form.Control
            type='email'
            value={email}
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
              placeholder='Enter password'
              required
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

        <Row className='mb-3 align-items-center'>
          <Col>
            <Form.Check
              type='checkbox'
              label='Remember me'
              checked={remember}
              onChange={() => setRemember(!remember)}
            />
          </Col>
          <Col className='text-end'>
            <Link to={'/reset-password'} className='text-muted small text-decoration-none'>
              Forgot password?
            </Link>
          </Col>
        </Row>

        <Button
          className='w-100 py-2 fw-bold shadow-sm'
          variant='warning'
          type='submit'
          disabled={isLoading}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>
      </Form>

      {/* Demo Credentials Quick-Fill Card */}
      <Card className='mt-4 bg-light border-0 p-3 rounded-3'>
        <div className='d-flex align-items-center gap-1 mb-2 text-muted small fw-bold text-uppercase'>
          <FaUserCheck className='text-primary' /> Quick Demo Logins:
        </div>
        <div className='d-flex flex-wrap gap-2'>
          <Button
            variant='outline-secondary'
            size='sm'
            onClick={() => fillCredentials('buyer@smartbid.com', 'buyer123')}
          >
            Buyer (John)
          </Button>
          <Button
            variant='outline-warning'
            size='sm'
            className='text-dark'
            onClick={() => fillCredentials('seller@smartbid.com', 'seller123')}
          >
            Seller (Sarah)
          </Button>
          <Button
            variant='outline-dark'
            size='sm'
            onClick={() => fillCredentials('admin@admin.com', 'admin123')}
          >
            Admin
          </Button>
        </div>
      </Card>

      <div className='text-center mt-4 pt-3 border-top'>
        <span className='text-muted'>Don't have an account yet?</span>{' '}
        <Link
          to={redirect ? `/register?redirect=${redirect}` : '/register'}
          className='fw-bold text-decoration-none'
        >
          Create an Account
        </Link>
      </div>
    </FormContainer>
  );
};

export default LoginPage;
