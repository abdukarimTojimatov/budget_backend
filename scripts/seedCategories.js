import mongoose from 'mongoose';
import ExpenseCategory from '../models/expenseCategory.model.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initial expense categories from the old static enum
const initialCategories = [
  { name: 'Laminad' },
  { name: 'Mashina xarajatlari' },
  { name: 'Soliq' },
  { name: 'Elektr' },
  { name: 'Abduzunnun' }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Seed expense categories
const seedCategories = async () => {
  try {
    // Check if there are already categories in the database
    const existingCategoriesCount = await ExpenseCategory.countDocuments();
    
    if (existingCategoriesCount > 0) {
      console.log('Categories already exist in the database. Skipping seed.');
      return;
    }
    
    // Create initial categories
    await ExpenseCategory.insertMany(initialCategories);
    console.log('Expense categories seeded successfully');
  } catch (error) {
    console.error(`Error seeding categories: ${error.message}`);
  }
};

// Run the seed
const runSeed = async () => {
  const conn = await connectDB();
  
  await seedCategories();
  
  // Close the database connection
  mongoose.connection.close();
  console.log('Database connection closed');
  
  process.exit(0);
};

runSeed();
