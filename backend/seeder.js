import mongoose from 'mongoose';
import users from './data/users.js';
import products from './data/products.js';
import User from './models/userModel.js';
import Product from './models/productModel.js';
import Order from './models/orderModel.js';
import Transaction from './models/transactionModel.js';
import Notification from './models/notificationModel.js';
import connectDB from './config/db.js';
import colors from 'colors';
import 'dotenv/config';

const importData = async () => {
  try {
    await connectDB();
    await Order.deleteMany();
    await User.deleteMany();
    await Product.deleteMany();
    await Transaction.deleteMany();
    await Notification.deleteMany();

    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers[0]._id;
    const sellerUser = createdUsers[1]._id;
    const buyer1 = createdUsers[2];
    const buyer2 = createdUsers[3];

    const now = Date.now();

    // Map sample products into realistic live auctions with bids and countdowns
    const sampleAuctions = products.map((product, index) => {
      const startingPrice = Math.round(product.price * 0.6);
      const isCompleted = index === products.length - 1; // Last one completed
      const isEndingSoon = index === 0; // First one ending in 2 hours

      // Duration & End times
      let endTime;
      let status = 'active';

      if (isCompleted) {
        status = 'completed';
        endTime = new Date(now - 3600 * 1000 * 2); // Ended 2 hours ago
      } else if (isEndingSoon) {
        endTime = new Date(now + 3600 * 1000 * 2.5); // Ending in 2.5 hours
      } else {
        endTime = new Date(now + 3600 * 1000 * (12 + index * 12)); // 12h, 24h, 36h...
      }

      // Generate realistic bidding history
      const bid1Amount = startingPrice + 500;
      const bid2Amount = startingPrice + 1500;
      const bid3Amount = startingPrice + 2800;

      const bids = [
        {
          bidder: buyer1._id,
          bidderName: buyer1.name,
          amount: bid3Amount,
          timestamp: new Date(now - 1000 * 60 * 15)
        },
        {
          bidder: buyer2._id,
          bidderName: buyer2.name,
          amount: bid2Amount,
          timestamp: new Date(now - 1000 * 60 * 45)
        },
        {
          bidder: buyer1._id,
          bidderName: buyer1.name,
          amount: bid1Amount,
          timestamp: new Date(now - 1000 * 60 * 90)
        }
      ];

      return {
        ...product,
        user: index % 2 === 0 ? sellerUser : adminUser,
        startingPrice,
        price: bid3Amount,
        currentHighestBid: bid3Amount,
        currentWinner: buyer1._id,
        bids,
        totalBids: bids.length,
        startTime: new Date(now - 3600 * 1000 * 24),
        endTime,
        durationHours: 24,
        status,
        views: 45 + index * 18,
        countInStock: 1
      };
    });

    const createdAuctions = await Product.insertMany(sampleAuctions);

    // Create a transaction for the completed auction
    const completedAuction = createdAuctions.find(a => a.status === 'completed');
    if (completedAuction) {
      await Transaction.create({
        auction: completedAuction._id,
        auctionTitle: completedAuction.name,
        seller: completedAuction.user,
        winner: completedAuction.currentWinner,
        finalPrice: completedAuction.currentHighestBid,
        status: 'paid'
      });
    }

    // Create a welcome notification
    await Notification.create({
      user: buyer1._id,
      type: 'bid_received',
      message: 'Welcome to SmartBid! You are currently the highest bidder on Acer Nitro V Gaming Laptop.',
      auction: createdAuctions[0]._id
    });

    console.log('SmartBid Data Successfully Seeded!'.green.inverse);
    process.exit();
  } catch (error) {
    console.log(`Error: ${error.message}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await Order.deleteMany();
    await User.deleteMany();
    await Product.deleteMany();
    await Transaction.deleteMany();
    await Notification.deleteMany();

    console.log('SmartBid Data Destroyed!'.red.inverse);
    process.exit();
  } catch (error) {
    console.log(`Error: ${error.message}`.red.inverse);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
