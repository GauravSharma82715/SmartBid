import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import Transaction from '../models/transactionModel.js';
import Notification from '../models/notificationModel.js';
import { deleteFile } from '../utils/file.js';

// Helper to check and mark expired auctions
const checkAuctionExpiry = async (product) => {
  if (product && product.status === 'active' && new Date() >= new Date(product.endTime)) {
    product.status = 'completed';
    await product.save();

    // If there was a winning bidder, create a Transaction record and notify
    if (product.currentWinner && product.totalBids > 0) {
      try {
        const existingTx = await Transaction.findOne({ auction: product._id });
        if (!existingTx) {
          await Transaction.create({
            auction: product._id,
            auctionTitle: product.name,
            seller: product.user,
            winner: product.currentWinner,
            finalPrice: product.currentHighestBid,
            status: 'pending'
          });

          // Increment winner's won count
          await User.findByIdAndUpdate(product.currentWinner, { $inc: { wonCount: 1 } });
          // Increment seller's total sales
          await User.findByIdAndUpdate(product.user, { $inc: { totalSales: product.currentHighestBid } });

          // Notification for Winner
          await Notification.create({
            user: product.currentWinner,
            type: 'won',
            message: `Congratulations! You won the auction for "${product.name}" with a final bid of ₹${product.currentHighestBid}.`,
            auction: product._id
          });

          // Notification for Seller
          await Notification.create({
            user: product.user,
            type: 'auction_ended',
            message: `Your auction for "${product.name}" has completed! Final selling price: ₹${product.currentHighestBid}.`,
            auction: product._id
          });
        }
      } catch (err) {
        console.error('Error creating transaction on auction completion:', err);
      }
    }
  }
  return product;
};

// @desc     Fetch all auctions with filters, search and sorting
// @method   GET
// @endpoint /api/v1/products
// @access   Public
const getProducts = async (req, res, next) => {
  try {
    const maxLimit = Number(process.env.PAGINATION_MAX_LIMIT) || 12;
    const limit = Number(req.query.limit) || maxLimit;
    const skip = Number(req.query.skip) || 0;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const status = req.query.status || '';
    const sort = req.query.sort || '';

    // Build search & filter query
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'All' && category !== 'all') {
      query.category = { $regex: category, $options: 'i' };
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    // Determine sorting order
    let sortOptions = { createdAt: -1 };
    if (sort === 'endingSoon') {
      sortOptions = { endTime: 1 };
    } else if (sort === 'highestBid') {
      sortOptions = { currentHighestBid: -1 };
    } else if (sort === 'lowestPrice') {
      sortOptions = { startingPrice: 1 };
    } else if (sort === 'popular') {
      sortOptions = { totalBids: -1 };
    } else if (sort === 'newest') {
      sortOptions = { createdAt: -1 };
    }

    const total = await Product.countDocuments(query);
    const maxSkip = total === 0 ? 0 : total - 1;

    let products = await Product.find(query)
      .populate('user', 'name email avgRating')
      .populate('currentWinner', 'name')
      .sort(sortOptions)
      .limit(limit)
      .skip(skip);

    // Auto-check expiry for returned products
    for (const p of products) {
      await checkAuctionExpiry(p);
    }

    res.status(200).json({
      products,
      total,
      maxLimit,
      maxSkip
    });
  } catch (error) {
    next(error);
  }
};

// @desc     Fetch top featured/active auctions for carousel
// @method   GET
// @endpoint /api/v1/products/top
// @access   Public
const getTopProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ status: 'active' })
      .sort({ totalBids: -1, currentHighestBid: -1 })
      .limit(4);

    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

// @desc     Fetch single auction details
// @method   GET
// @endpoint /api/v1/products/:id
// @access   Public
const getProduct = async (req, res, next) => {
  try {
    const { id: productId } = req.params;
    let product = await Product.findById(productId)
      .populate('user', 'name email avgRating totalSales')
      .populate('currentWinner', 'name email')
      .populate('bids.bidder', 'name email');

    if (!product) {
      res.statusCode = 404;
      throw new Error('Auction not found!');
    }

    // Increment view count
    product.views = (product.views || 0) + 1;
    await product.save();

    // Check expiry
    product = await checkAuctionExpiry(product);

    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc     Create new auction listing
// @method   POST
// @endpoint /api/v1/products
// @access   Private (Seller or Admin)
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      image,
      description,
      brand,
      category,
      price,
      startingPrice,
      durationHours = 24
    } = req.body;

    const baseStartingPrice = Number(startingPrice || price || 0);
    const hours = Number(durationHours) || 24;
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + hours * 60 * 60 * 1000);

    const product = new Product({
      user: req.user._id,
      name,
      image,
      description,
      brand: brand || 'SmartBid',
      category: category || 'General',
      startingPrice: baseStartingPrice,
      price: baseStartingPrice,
      currentHighestBid: baseStartingPrice,
      currentWinner: null,
      startTime,
      endTime,
      durationHours: hours,
      status: 'active',
      countInStock: 1,
      totalBids: 0,
      views: 0
    });

    const createdProduct = await product.save();

    // Broadcast new auction event via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('auctionCreated', createdProduct);
    }

    res.status(201).json({ message: 'Auction created successfully', createdProduct });
  } catch (error) {
    next(error);
  }
};

// @desc     Place a real-time bid on an active auction
// @method   POST
// @endpoint /api/v1/products/:id/bid
// @access   Private (Buyer or Admin)
const placeBid = async (req, res, next) => {
  try {
    const { id: productId } = req.params;
    const { amount } = req.body;
    const bidAmount = Number(amount);

    if (!bidAmount || isNaN(bidAmount) || bidAmount <= 0) {
      res.statusCode = 400;
      throw new Error('Please enter a valid bid amount.');
    }

    const product = await Product.findById(productId);

    if (!product) {
      res.statusCode = 404;
      throw new Error('Auction not found.');
    }

    // Check expiry
    if (new Date() >= new Date(product.endTime) || product.status !== 'active') {
      product.status = 'completed';
      await product.save();
      res.statusCode = 400;
      throw new Error('This auction has already ended. No further bids can be accepted.');
    }

    // Prevent sellers from bidding on their own listings
    if (product.user.toString() === req.user._id.toString()) {
      res.statusCode = 400;
      throw new Error('Sellers cannot place bids on their own auction listings.');
    }

    // Bid validation
    const currentHighest = product.currentHighestBid || 0;
    const startingPrice = product.startingPrice || 0;

    if (product.totalBids === 0) {
      if (bidAmount < startingPrice) {
        res.statusCode = 400;
        throw new Error(`The first bid must be at least the starting price of ₹${startingPrice}.`);
      }
    } else {
      if (bidAmount <= currentHighest) {
        res.statusCode = 400;
        throw new Error(`Your bid must be strictly higher than the current highest bid of ₹${currentHighest}.`);
      }
    }

    const previousWinnerId = product.currentWinner;

    // Create and record the new bid
    const newBid = {
      bidder: req.user._id,
      bidderName: req.user.name,
      amount: bidAmount,
      timestamp: new Date()
    };

    product.bids.unshift(newBid);
    product.currentHighestBid = bidAmount;
    product.price = bidAmount;
    product.currentWinner = req.user._id;
    product.totalBids = product.bids.length;

    await product.save();

    // Send Outbid notification to previous leader
    if (previousWinnerId && previousWinnerId.toString() !== req.user._id.toString()) {
      try {
        await Notification.create({
          user: previousWinnerId,
          type: 'outbid',
          message: `You were outbid on "${product.name}"! The new highest bid is ₹${bidAmount}.`,
          auction: product._id
        });
      } catch (err) {
        console.error('Outbid notification failed:', err);
      }
    }

    // Send Bid Received notification to seller
    try {
      await Notification.create({
        user: product.user,
        type: 'bid_received',
        message: `New highest bid of ₹${bidAmount} placed on your listing "${product.name}" by ${req.user.name}.`,
        auction: product._id
      });
    } catch (err) {
      console.error('Seller notification failed:', err);
    }

    // Real-Time Socket.io Broadcast
    const io = req.app.get('io');
    if (io) {
      const socketPayload = {
        auctionId: product._id,
        currentHighestBid: product.currentHighestBid,
        totalBids: product.totalBids,
        currentWinner: {
          _id: req.user._id,
          name: req.user.name
        },
        newBid,
        bids: product.bids
      };

      // Broadcast to users watching this specific auction room
      io.to(productId.toString()).emit('bidUpdated', socketPayload);
      // Broadcast to main marketplace auction list
      io.emit('auctionListUpdated', socketPayload);
    }

    res.status(200).json({
      message: 'Bid placed successfully!',
      currentHighestBid: product.currentHighestBid,
      totalBids: product.totalBids,
      bids: product.bids
    });
  } catch (error) {
    next(error);
  }
};

// @desc     Manually close / conclude an expired auction
// @method   POST
// @endpoint /api/v1/products/:id/close
// @access   Private (Seller or Admin)
const closeAuction = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.statusCode = 404;
      throw new Error('Auction not found');
    }

    product.status = 'completed';
    await product.save();
    await checkAuctionExpiry(product);

    const io = req.app.get('io');
    if (io) {
      io.to(req.params.id).emit('auctionEnded', {
        auctionId: product._id,
        winner: product.currentWinner,
        finalPrice: product.currentHighestBid
      });
    }

    res.status(200).json({ message: 'Auction concluded successfully', product });
  } catch (error) {
    next(error);
  }
};

// @desc     Get all auctions listed by current seller
// @method   GET
// @endpoint /api/v1/products/seller/my-auctions
// @access   Private (Seller or Admin)
const getSellerAuctions = async (req, res, next) => {
  try {
    const auctions = await Product.find({ user: req.user._id })
      .populate('currentWinner', 'name email')
      .sort({ createdAt: -1 });

    for (const a of auctions) {
      await checkAuctionExpiry(a);
    }

    res.status(200).json(auctions);
  } catch (error) {
    next(error);
  }
};

// @desc     Get analytics for seller dashboard
// @method   GET
// @endpoint /api/v1/products/seller/analytics
// @access   Private (Seller or Admin)
const getSellerAnalytics = async (req, res, next) => {
  try {
    const sellerAuctions = await Product.find({ user: req.user._id });

    let totalBids = 0;
    let totalViews = 0;
    let totalRevenue = 0;
    let activeCount = 0;
    let completedCount = 0;

    const bidsChartData = [];
    const viewsChartData = [];

    sellerAuctions.forEach(auction => {
      totalBids += auction.totalBids || 0;
      totalViews += auction.views || 0;

      if (auction.status === 'active') {
        activeCount++;
      } else if (auction.status === 'completed') {
        completedCount++;
        if (auction.totalBids > 0) {
          totalRevenue += auction.currentHighestBid || 0;
        }
      }

      const shortTitle = auction.name.length > 15 ? auction.name.substring(0, 15) + '...' : auction.name;
      bidsChartData.push({
        name: shortTitle,
        bids: auction.totalBids || 0,
        amount: auction.currentHighestBid || auction.startingPrice
      });

      viewsChartData.push({
        name: shortTitle,
        views: auction.views || 0
      });
    });

    res.status(200).json({
      totalAuctions: sellerAuctions.length,
      activeCount,
      completedCount,
      totalBids,
      totalViews,
      totalRevenue,
      bidsChartData,
      viewsChartData
    });
  } catch (error) {
    next(error);
  }
};

// @desc     Get auctions participated in by current buyer
// @method   GET
// @endpoint /api/v1/products/buyer/my-bids
// @access   Private (Buyer)
const getBuyerBids = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();

    // Find all auctions where this user placed at least one bid
    const auctions = await Product.find({ 'bids.bidder': req.user._id })
      .populate('user', 'name email avgRating')
      .populate('currentWinner', 'name')
      .sort({ updatedAt: -1 });

    for (const a of auctions) {
      await checkAuctionExpiry(a);
    }

    const activeBids = [];
    const wonAuctions = [];
    const allBidsHistory = [];

    auctions.forEach(auction => {
      const isWinner = auction.currentWinner && auction.currentWinner._id.toString() === userId;
      const userBids = auction.bids.filter(b => b.bidder.toString() === userId);
      const userMaxBid = Math.max(...userBids.map(b => b.amount), 0);

      userBids.forEach(b => {
        allBidsHistory.push({
          auctionId: auction._id,
          auctionTitle: auction.name,
          image: auction.image,
          amount: b.amount,
          timestamp: b.timestamp,
          status: auction.status
        });
      });

      if (auction.status === 'active') {
        activeBids.push({
          auction,
          isHighestBidder: isWinner,
          userMaxBid,
          currentHighestBid: auction.currentHighestBid
        });
      } else if (auction.status === 'completed' && isWinner) {
        wonAuctions.push({
          auction,
          finalPrice: auction.currentHighestBid,
          seller: auction.user
        });
      }
    });

    res.status(200).json({
      activeBids,
      wonAuctions,
      allBidsHistory: allBidsHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    });
  } catch (error) {
    next(error);
  }
};

// @desc     Update auction listing
// @method   PUT
// @endpoint /api/v1/products/:id
// @access   Private (Seller or Admin)
const updateProduct = async (req, res, next) => {
  try {
    const { name, image, description, category, startingPrice, durationHours } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.statusCode = 404;
      throw new Error('Auction not found!');
    }

    // Only the seller or admin can edit
    if (product.user.toString() !== req.user._id.toString() && !req.user.isAdmin && req.user.role !== 'admin') {
      res.statusCode = 403;
      throw new Error('Not authorized to edit this auction.');
    }

    product.name = name || product.name;
    product.image = image || product.image;
    product.description = description || product.description;
    product.category = category || product.category;

    if (startingPrice && product.totalBids === 0) {
      product.startingPrice = Number(startingPrice);
      product.price = Number(startingPrice);
      product.currentHighestBid = Number(startingPrice);
    }

    if (durationHours) {
      product.durationHours = Number(durationHours);
      product.endTime = new Date(new Date(product.startTime).getTime() + Number(durationHours) * 3600000);
    }

    const updatedProduct = await product.save();
    res.status(200).json({ message: 'Auction updated', updatedProduct });
  } catch (error) {
    next(error);
  }
};

// @desc     Delete auction listing
// @method   DELETE
// @endpoint /api/v1/products/:id
// @access   Private (Seller or Admin)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.statusCode = 404;
      throw new Error('Auction not found!');
    }

    if (product.user.toString() !== req.user._id.toString() && !req.user.isAdmin && req.user.role !== 'admin') {
      res.statusCode = 403;
      throw new Error('Not authorized to delete this auction.');
    }

    await Product.deleteOne({ _id: product._id });
    if (product.image && !product.image.startsWith('http')) {
      deleteFile(product.image);
    }

    res.status(200).json({ message: 'Auction deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc     Create review for seller / auction
// @method   POST
// @endpoint /api/v1/products/reviews/:id
// @access   Private
const createProductReview = async (req, res, next) => {
  try {
    const { id: productId } = req.params;
    const { rating, comment } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      res.statusCode = 404;
      throw new Error('Auction not found!');
    }

    const alreadyReviewed = product.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.statusCode = 400;
      throw new Error('You have already submitted a review for this auction.');
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment
    };

    product.reviews.push(review);
    product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
    product.numReviews = product.reviews.length;

    await product.save();

    // Update seller avgRating
    const seller = await User.findById(product.user);
    if (seller) {
      seller.avgRating = product.rating;
      await seller.save();
    }

    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    next(error);
  }
};

export {
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
};
