// Quick Admin Creation Script
// Use this to create an admin account via API

const bcrypt = require("bcryptjs");

async function createAdminAccount() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash("admin123", 10);

    console.log("=== ADMIN ACCOUNT CREDENTIALS ===");
    console.log("Email: admin@restaurant.com");
    console.log("Password: admin123");
    console.log("Role: ADMIN");
    console.log("");
    console.log("Hashed Password (for manual database insertion):");
    console.log(hashedPassword);
    console.log("");
    console.log("To create admin account:");
    console.log("1. Connect to your MongoDB database");
    console.log('2. Insert this record into the "users" collection:');
    console.log("");
    console.log(
      JSON.stringify(
        {
          name: "System Administrator",
          email: "admin@restaurant.com",
          password: hashedPassword,
          role: "ADMIN",
          isApproved: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        null,
        2,
      ),
    );
  } catch (error) {
    console.error("Error:", error);
  }
}

createAdminAccount();
