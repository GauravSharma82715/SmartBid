import mongoose from 'mongoose';

// Define the schema for SmartBid users
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['buyer', 'seller', 'admin'],
      default: 'buyer'
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false
    },
    wonCount: {
      type: Number,
      default: 0
    },
    avgRating: {
      type: Number,
      default: 5.0
    },
    totalSales: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
