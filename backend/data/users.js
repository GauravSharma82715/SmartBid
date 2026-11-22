import bcrypt from 'bcryptjs';

const users = [
  {
    name: 'Admin User',
    email: 'admin@admin.com',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    isAdmin: true,
    avgRating: 5.0,
    totalSales: 0
  },
  {
    name: 'Sarah Seller',
    email: 'seller@smartbid.com',
    password: bcrypt.hashSync('seller123', 10),
    role: 'seller',
    isAdmin: false,
    avgRating: 4.9,
    totalSales: 245000
  },
  {
    name: 'John Buyer',
    email: 'buyer@smartbid.com',
    password: bcrypt.hashSync('buyer123', 10),
    role: 'buyer',
    isAdmin: false,
    wonCount: 2
  },
  {
    name: 'Alice Smith',
    email: 'alice@email.com',
    password: bcrypt.hashSync('alice123', 10),
    role: 'buyer',
    isAdmin: false,
    wonCount: 1
  },
  {
    name: 'David Miller',
    email: 'david@email.com',
    password: bcrypt.hashSync('david123', 10),
    role: 'seller',
    isAdmin: false,
    avgRating: 4.7,
    totalSales: 89000
  }
];

export default users;
