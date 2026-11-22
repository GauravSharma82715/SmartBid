import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import compression from 'compression';
import 'dotenv/config';

import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const port = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Make io accessible to controllers via req.app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
  // Join a specific auction room for live bid updates
  socket.on('joinAuction', (auctionId) => {
    if (auctionId) {
      socket.join(auctionId);
    }
  });

  socket.on('leaveAuction', (auctionId) => {
    if (auctionId) {
      socket.leave(auctionId);
    }
  });

  socket.on('disconnect', () => {
  });
});

app.use(cors());
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/v1/products', productRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/payment', paymentRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('SmartBid API running...');
  });
}

app.use(notFound);
app.use(errorHandler);

server.listen(port, () => {
  console.log(`SmartBid Server running at http://localhost:${port}/`);
});
