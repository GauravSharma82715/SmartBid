import mongoose from 'mongoose';

// Review schema for seller / product reviews
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    name: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true
    },
    comment: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

// Individual Bid schema
const bidSchema = new mongoose.Schema(
  {
    bidder: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    bidderName: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// SmartBid Auction / Product schema
const productSchema = new mongoose.Schema(
  {
    // Seller who listed the auction
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    name: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    brand: {
      type: String,
      default: 'SmartBid'
    },
    category: {
      type: String,
      required: true
    },
    startingPrice: {
      type: Number,
      required: true,
      default: 0
    },
    // Maintained for backward compatibility with existing code
    price: {
      type: Number,
      default: 0
    },
    currentHighestBid: {
      type: Number,
      default: 0
    },
    currentWinner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    bids: [bidSchema],
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: {
      type: Date,
      required: true
    },
    durationHours: {
      type: Number,
      default: 24
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active'
    },
    views: {
      type: Number,
      default: 0
    },
    totalBids: {
      type: Number,
      default: 0
    },
    countInStock: {
      type: Number,
      default: 1
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      default: 0
    },
    numReviews: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Pre-save hook: sync price to startingPrice or currentHighestBid
productSchema.pre('save', function (next) {
  if (!this.price || this.price === 0) {
    this.price = this.currentHighestBid > 0 ? this.currentHighestBid : this.startingPrice;
  }
  next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;
