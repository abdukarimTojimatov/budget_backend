import mongoose from "mongoose";
import ExpenseCategory from "../models/expenseCategory.model.js";

// Initial expense categories from the old static enum
const initialCategories = [
  { name: 'Laminad' },
  { name: 'Mashina xarajatlari' },
  { name: 'Soliq' },
  { name: 'Elektr' },
  { name: 'Abduzunnun' }
];

// Function to seed expense categories if none exist
const seedExpenseCategories = async () => {
  try {
    // Check if there are already categories in the database
    const existingCategoriesCount = await ExpenseCategory.countDocuments();
    
    if (existingCategoriesCount > 0) {
      console.log('Expense categories already exist in the database.');
      return;
    }
    
    // Create initial categories
    await ExpenseCategory.insertMany(initialCategories);
    console.log('Initial expense categories seeded successfully');
  } catch (error) {
    console.error(`Error seeding expense categories: ${error.message}`);
  }
};

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed initial data
    await seedExpenseCategories();
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};
