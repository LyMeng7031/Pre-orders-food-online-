// Test script to verify Create Product API works
const testCreateProduct = async () => {
  try {
    // First login as owner to get token
    const loginResponse = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "owner@test.com",
        password: "password123",
      }),
    });

    if (!loginResponse.ok) {
      console.error("Login failed:", await loginResponse.json());
      return;
    }

    const { token } = await loginResponse.json();
    console.log("✅ Login successful");

    // Test create product
    const productData = {
      name: "Test Burger",
      description: "A delicious test burger",
      price: 9.99,
      category: "MAIN_COURSE",
      preparationTime: 15,
      spicyLevel: 1,
      ingredients: ["Beef", "Lettuce", "Tomato"],
      allergens: ["Gluten"],
      image: "",
    };

    const createResponse = await fetch("http://localhost:3000/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });

    if (createResponse.ok) {
      const product = await createResponse.json();
      console.log("✅ Product created successfully:", product);
    } else {
      console.error("❌ Product creation failed:", await createResponse.json());
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
};

// Run test
testCreateProduct();
