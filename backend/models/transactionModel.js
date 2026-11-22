import mongoose from 'mongoose';

// SmartBid Transaction Schema (created upon auction completion)
const transactionSchema = new mongoose.Schema(
  {
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product'
    },
    auctionTitle: {
      type: String,
      required: true
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    finalPrice: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
