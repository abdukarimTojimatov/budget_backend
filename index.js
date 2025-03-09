import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import passport from 'passport';
import session from 'express-session';
import connectMongo from 'connect-mongodb-session';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import mongoose from 'mongoose';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { buildContext } from 'graphql-passport';
import mergedResolvers from './resolvers/index.js';
import mergedTypeDefs from './typeDefs/index.js';
import { connectDB } from './db/connectDB.js';

// Import Passport config function
import { configurePassport } from './config/passport.js';

dotenv.config();

const __dirname = path.resolve();
const app = express();
const httpServer = http.createServer(app);
const isDevelopment = 'development';

// Ensure the server only runs in development mode
console.log('isDevelopment', process.env.NODE_ENV);
if (!isDevelopment) {
  console.error('❌ Server can only run in development mode.');
  process.exit(1);
}

// Configure session store
const MongoDBStore = connectMongo(session);
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: 'sessions',
  connectionOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
});

store.on('error', (err) => {
  console.error('Session store error:', err);
});

// Configure Passport
configurePassport();

// CORS Middleware - Restrict to development origins
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://92.112.180.30:3000',
      'http://elegro.uz',
    ], // Add frontend origins used in development
    credentials: true, // Enable sending cookies/credentials
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
  })
);

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true, // Allow unauthenticated sessions for development
    store,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 360,
      httpOnly: true,
      secure: false, // No HTTPS in development
      sameSite: 'lax',
    },
  })
);
app.set('trust proxy', 1);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, 'uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueFilename = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueFilename);
  },
});

const fileFilter = (req, file, cb) => {
  // Accept only images
  const validImageTypes = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/gif',
    'image/webp',
  ];
  if (validImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// REST API endpoint for image upload
app.post(
  '/api/upload-order-image/:orderId',
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const orderId = req.params.orderId;
      const imageUrl = `/uploads/${req.file.filename}`;

      // Get Order model and update the order with the new image
      const Order = mongoose.model('Order');
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Add the image URL to the order's images array
      if (!order.images) {
        order.images = [];
      }
      order.images.push(imageUrl);
      await order.save();

      return res.status(200).json({
        message: 'Image uploaded successfully',
        imageUrl,
        order: {
          _id: order._id,
          images: order.images,
        },
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      return res
        .status(500)
        .json({ message: 'Error uploading image', error: error.message });
    }
  }
);

// REST API endpoint for deleting an order image
app.delete(
  '/api/delete-order-image/:orderId/:imageFileName',
  async (req, res) => {
    try {
      const { orderId, imageFileName } = req.params;

      // Get Order model
      const Order = mongoose.model('Order');
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Construct the image path as stored in the database
      const imagePath = `/uploads/${decodeURIComponent(imageFileName)}`;

      // Check if the image exists in the order's images array
      if (!order.images || !order.images.includes(imagePath)) {
        return res.status(404).json({ message: 'Image not found in order' });
      }

      // Construct the full file path
      const fullImagePath = path.join(
        __dirname,
        'uploads',
        decodeURIComponent(imageFileName)
      );

      // Remove image from order's images array
      order.images = order.images.filter((img) => img !== imagePath);
      await order.save();

      // Delete the file from the filesystem if it exists
      if (fs.existsSync(fullImagePath)) {
        fs.unlinkSync(fullImagePath);
      }

      return res.status(200).json({
        message: 'Image deleted successfully',
        order: {
          _id: order._id,
          images: order.images,
        },
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      return res
        .status(500)
        .json({ message: 'Error deleting image', error: error.message });
    }
  }
);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create Apollo Server with introspection and Playground enabled
const server = new ApolloServer({
  typeDefs: mergedTypeDefs,
  resolvers: mergedResolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  introspection: true, // Enable introspection for Playground
  formatError: (error) => {
    console.error('GraphQL Error:', error);
    return { message: error.message }; // Show full error messages in development
  },
});

// Start the server
const startServer = async () => {
  try {
    await server.start();

    // Apply Apollo middleware
    app.use(
      '/graphql',
      express.json(),
      expressMiddleware(server, {
        context: async ({ req, res }) => ({
          ...buildContext({ req, res }),
          req,
          res,
          isDevelopment,
        }),
      })
    );

    // Connect to MongoDB and start the server
    await connectDB();
    await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));

    console.log(`🚀 Server ready at http://localhost:4000/graphql`);
    console.log('Environment: Development');
    console.log('Playground: Enabled');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
