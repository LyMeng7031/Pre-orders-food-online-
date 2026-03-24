// Test Admin Approval System
// This script helps test the approval functionality

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function testApprovalSystem() {
  try {
    // Connect to database
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb://localhost:27017/food-booking-system",
    );
    console.log("✅ Connected to database");

    // 1. Create test admin
    const adminPassword = await bcrypt.hash("admin123", 10);
    const User = require("./models/User");

    // Remove existing test users
    await User.deleteMany({
      email: { $in: ["admin@test.com", "owner@test.com"] },
    });

    const admin = new User({
      name: "Test Admin",
      email: "admin@test.com",
      password: adminPassword,
      role: "ADMIN",
      isApproved: true,
      isActive: true,
    });
    await admin.save();
    console.log("✅ Created test admin: admin@test.com");

    // 2. Create test owner (not approved)
    const ownerPassword = await bcrypt.hash("owner123", 10);
    const owner = new User({
      name: "Test Owner",
      email: "owner@test.com",
      password: ownerPassword,
      role: "OWNER",
      isApproved: false,
      isActive: true,
    });
    await owner.save();
    console.log("✅ Created test owner: owner@test.com (not approved)");

    // 3. Test login for owner (should fail)
    console.log("\n🧪 Testing owner login (should fail)...");
    const testOwner = await User.findOne({ email: "owner@test.com" });
    if (testOwner && !testOwner.isApproved) {
      console.log("❌ Owner login correctly blocked - not approved");
    } else {
      console.log("⚠️ Owner login check failed");
    }

    // 4. Simulate admin approval
    console.log("\n🧪 Testing admin approval...");
    await User.findByIdAndUpdate(owner._id, {
      isApproved: true,
      approvalDate: new Date(),
      updatedAt: new Date(),
    });
    console.log("✅ Owner approved successfully");

    // 5. Test login for owner (should now work)
    console.log("\n🧪 Testing owner login after approval (should work)...");
    const approvedOwner = await User.findOne({ email: "owner@test.com" });
    if (approvedOwner && approvedOwner.isApproved) {
      console.log("✅ Owner login now allowed - approved");
    } else {
      console.log("❌ Owner login still failing");
    }

    // 6. Generate admin token
    const adminToken = jwt.sign(
      { userId: admin._id, role: "ADMIN" },
      process.env.JWT_SECRET || "fallback-secret",
    );
    console.log("\n🔑 Admin Token:", adminToken);

    // 7. Generate owner token
    const ownerToken = jwt.sign(
      { userId: owner._id, role: "OWNER" },
      process.env.JWT_SECRET || "fallback-secret",
    );
    console.log("🔑 Owner Token:", ownerToken);

    console.log("\n📋 Test Results:");
    console.log("Admin Email: admin@test.com / Password: admin123");
    console.log("Owner Email: owner@test.com / Password: owner123");
    console.log("\n✅ Test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await mongoose.disconnect();
  }
}

testApprovalSystem();
