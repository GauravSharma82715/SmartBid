import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  placeBid,
  closeAuction,
  getSellerAuctions,
  getSellerAnalytics,
  getBuyerBids,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts
} from '../controllers/productController.js';
import { protect, admin, seller } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, seller, createProduct);

router.get('/top', getTopProducts);

// Seller endpoints
router.get('/seller/my-auctions', protect, seller, getSellerAuctions);
router.get('/seller/analytics', protect, seller, getSellerAnalytics);

// Buyer endpoint
router.get('/buyer/my-bids', protect, getBuyerBids);

// Live bidding & reviews
router.post('/:id/bid', protect, placeBid);
router.post('/:id/close', protect, seller, closeAuction);
router.post('/reviews/:id', protect, createProductReview);

router.route('/:id')
  .get(getProduct)
  .put(protect, seller, updateProduct)
  .delete(protect, seller, deleteProduct);

export default router;
