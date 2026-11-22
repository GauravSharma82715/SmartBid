import mongoose from 'mongoose';

// SmartBid User Notification Schema
const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['outbid', 'won', 'auction_ended', 'bid_received'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
