import React, { useState } from 'react';
import {
  Form,
  Button,
  Row,
  Col,
  Card,
  InputGroup,
  Badge,
  Spinner
} from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import {
  useCreateProductMutation,
  useUploadProductImageMutation
} from '../slices/productsApiSlice';
import { toast } from 'react-toastify';
import Meta from '../components/Meta';
import {
  FaGavel,
  FaCloudUploadAlt,
  FaUpload,
  FaCheckCircle
} from 'react-icons/fa';

const CreateAuctionPage = () => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [brand, setBrand] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [durationHours, setDurationHours] = useState('24');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [fileName, setFileName] = useState('');

  const navigate = useNavigate();

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadProductImageMutation();

  const handleFileUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await uploadImage(formData).unwrap();
      const uploadedPath = res.image || res.imageUrl;
      setImage(uploadedPath);
      toast.success(`Image "${file.name}" uploaded successfully from your computer!`);
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'Failed to upload image from computer');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!image) {
      toast.error('Please upload an image from your computer first.');
      return;
    }

    try {
      const res = await createProduct({
        name,
        category,
        brand: brand || 'SmartBid',
        startingPrice: Number(startingPrice),
        durationHours: Number(durationHours),
        description,
        image
      }).unwrap();

      toast.success('🎉 Auction created successfully!');
      navigate(`/product/${res.createdProduct._id}`);
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'Failed to create auction');
    }
  };

  const categories = [
    'Electronics',
    'Gaming & Consoles',
    'Laptops & Computers',
    'Collectibles & Antiques',
    'Watches & Jewelry',
    'Vehicles & Automotives',
    'Art & Memorabilia',
    'Fashion & Sneakers'
  ];

  return (
    <>
      <Meta title='List New Auction | SmartBid' />
      <div className='mb-3'>
        <Link to='/seller/dashboard' className='btn btn-outline-secondary btn-sm'>
          &larr; Back to Seller Hub
        </Link>
      </div>

      <Row className='justify-content-center'>
        <Col lg={8}>
          <Card className='border-0 shadow-sm rounded-4 p-4 p-md-5'>
            <div className='d-flex align-items-center gap-3 mb-4'>
              <div className='p-3 bg-warning bg-opacity-10 text-warning rounded-circle fs-3 text-dark'>
                <FaGavel />
              </div>
              <div>
                <h3 className='fw-bold mb-0'>Create New Auction</h3>
                <p className='text-muted mb-0'>List your item for live bidding across the SmartBid platform</p>
              </div>
            </div>

            <Form onSubmit={handleSubmit}>
              {/* Title */}
              <Form.Group className='mb-3' controlId='name'>
                <Form.Label className='fw-semibold'>Auction Title / Product Name</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='e.g., Apple MacBook Pro 16" M3 Max (36GB / 1TB SSD)'
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </Form.Group>

              {/* Category & Brand Row */}
              <Row className='g-3 mb-3'>
                <Col md={6}>
                  <Form.Group controlId='category'>
                    <Form.Label className='fw-semibold'>Category</Form.Label>
                    <Form.Select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId='brand'>
                    <Form.Label className='fw-semibold'>Brand / Manufacturer</Form.Label>
                    <Form.Control
                      type='text'
                      placeholder='e.g., Apple, Sony, Nike'
                      value={brand}
                      onChange={e => setBrand(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Pricing & Duration Row */}
              <Row className='g-3 mb-3'>
                <Col md={6}>
                  <Form.Group controlId='startingPrice'>
                    <Form.Label className='fw-semibold'>Starting Price (₹)</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className='fw-bold'>₹</InputGroup.Text>
                      <Form.Control
                        type='number'
                        placeholder='e.g., 5000'
                        value={startingPrice}
                        onChange={e => setStartingPrice(e.target.value)}
                        min='1'
                        required
                        className='fw-bold'
                      />
                    </InputGroup>
                    <Form.Text className='text-muted'>
                      Bidding will start from this base reserve price.
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId='durationHours'>
                    <Form.Label className='fw-semibold'>Auction Duration</Form.Label>
                    <Form.Select
                      value={durationHours}
                      onChange={e => setDurationHours(e.target.value)}
                      required
                    >
                      <option value='2'>⚡ Flash Auction (2 Hours)</option>
                      <option value='6'>⏱️ Short (6 Hours)</option>
                      <option value='12'>⏱️ Half Day (12 Hours)</option>
                      <option value='24'>📅 1 Full Day (24 Hours)</option>
                      <option value='72'>📅 3 Days (72 Hours)</option>
                      <option value='168'>📅 1 Week (7 Days)</option>
                    </Form.Select>
                    <Form.Text className='text-muted'>
                      Countdown timer will start immediately upon listing.
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              {/* Local Computer Image Upload Only - No URL Required */}
              <Form.Group className='mb-4' controlId='imageUpload'>
                <Form.Label className='fw-semibold d-flex align-items-center justify-content-between'>
                  <span>Product Image (Local Computer Upload)</span>
                  {image && (
                    <Badge bg='success' className='fw-normal py-1 px-2'>
                      <FaCheckCircle className='me-1' /> Ready to Post
                    </Badge>
                  )}
                </Form.Label>

                <div
                  className={`p-4 rounded-4 text-center ${
                    image ? 'border border-success bg-light' : 'border border-2 border-secondary-subtle bg-light'
                  }`}
                  style={{ borderStyle: image ? 'solid' : 'dashed' }}
                >
                  {image ? (
                    <div className='d-flex flex-column align-items-center'>
                      <img
                        src={image}
                        alt='Uploaded product'
                        className='rounded-3 shadow-sm mb-3 bg-white p-2 border'
                        style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'contain' }}
                      />
                      <div className='d-flex align-items-center gap-2 mb-3'>
                        <Badge bg='dark' className='py-2 px-3'>
                          <FaCheckCircle className='text-success me-1' /> File: {fileName || 'Uploaded Image'}
                        </Badge>
                      </div>
                      <label className='btn btn-outline-primary btn-sm fw-bold cursor-pointer mb-0'>
                        <FaCloudUploadAlt className='me-1' /> Choose Different Image
                        <input
                          type='file'
                          accept='image/jpeg,image/png,image/jpg,image/webp'
                          onChange={handleFileUpload}
                          style={{ display: 'none' }}
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                  ) : (
                    <div>
                      <div className='mb-3 text-primary'>
                        <FaCloudUploadAlt style={{ fontSize: '3.2rem' }} />
                      </div>
                      <h6 className='fw-bold mb-1'>Upload Product Image from Your Computer</h6>
                      <p className='text-muted small mb-3'>
                        Select any JPG, PNG, or WEBP image file directly from your local drive
                      </p>
                      <label className='btn btn-primary fw-bold px-4 py-2 cursor-pointer shadow-sm mb-0'>
                        {isUploading ? (
                          <>
                            <Spinner animation='border' size='sm' className='me-2' />
                            Uploading Image...
                          </>
                        ) : (
                          <>
                            <FaUpload className='me-2' /> Browse Local Computer
                          </>
                        )}
                        <input
                          type='file'
                          accept='image/jpeg,image/png,image/jpg,image/webp'
                          onChange={handleFileUpload}
                          style={{ display: 'none' }}
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                  )}
                </div>
                {!image && (
                  <Form.Text className='text-muted small d-block mt-1'>
                    * Click "Browse Local Computer" to select a file from your hard drive. No image URL needed.
                  </Form.Text>
                )}
              </Form.Group>

              {/* Description */}
              <Form.Group className='mb-4' controlId='description'>
                <Form.Label className='fw-semibold'>Detailed Description</Form.Label>
                <Form.Control
                  as='textarea'
                  rows={4}
                  placeholder='Describe the product condition, specifications, warranty, and provenance...'
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                />
              </Form.Group>

              <Button
                variant='warning'
                type='submit'
                size='lg'
                className='w-100 fw-bold shadow py-3 text-dark'
                disabled={isCreating || isUploading || !image}
              >
                {isCreating ? 'Listing Auction...' : '🚀 Publish Live Auction'}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default CreateAuctionPage;
