// Create Admin User Script
// Run this script once to create an admin account

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

async function createAdmin() {
  try {
    // Connect to your database
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb://localhost:27017/food-booking-system",
    );

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@restaurant.com" });
    if (existingAdmin) {
      console.log("Admin user already exists!");
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = new User({
      name: "System Administrator",
      email: "admin@restaurant.com",
      password: hashedPassword,
      role: "ADMIN",
      isApproved: true, // Admins are auto-approved
      isActive: true,
    });

    await admin.save();
    console.log("Admin user created successfully!");
    console.log("Email: admin@restaurant.com");
    console.log("Password: admin123");
    console.log("\nPlease change the password after first login for security.");
  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
