# Customer Order System

A complete customer ordering system for restaurants with QR code access, mobile-first design, and seamless checkout experience.

## 🚀 Features

### 📱 Menu Display

- **Product Cards**: Clean, mobile-friendly product display
- **Product Information**: Image, name, price, description
- **Availability Status**: Only shows available products
- **Responsive Design**: Works perfectly on all devices

### 🛒 Cart System

- **Add to Cart**: One-click product addition
- **Quantity Management**: Increase/decrease quantities
- **Remove Items**: Easy item removal
- **Live Updates**: Real-time cart total calculation
- **Sticky Cart Button**: Always visible cart summary

### 📋 Customer Information

- **Name Collection**: Customer name input
- **Phone Number**: Contact information
- **Pickup Time**: Date/time selection with validation
- **Form Validation**: Required field checking

### ⏰ Pickup Time Management

- **Minimum Time**: 30 minutes from current time
- **DateTime Picker**: Native mobile datetime input
- **Time Validation**: Prevents invalid time selection

### 📤 Order Placement

- **API Integration**: POST to `/api/orders`
- **Order Number**: Auto-generated unique order ID
- **Success Page**: Order confirmation with details
- **Error Handling**: Comprehensive error management

## 📁 File Structure

```
app/
├── menu/[restaurantId]/page.tsx          # Main menu page
├── api/
│   ├── restaurants/[id]/products/route.ts # Products API
│   └── orders/route.ts                   # Orders API (existing)
contexts/
└── CartContext.tsx                       # Cart state management
utils/
└── orderUtils.ts                         # Order utilities
```

## 🎯 Core Components

### MenuPage (`/app/menu/[restaurantId]/page.tsx`)

Main customer-facing component with:

- Product fetching and display
- Cart management
- Checkout modal
- Order placement
- Success/error handling

### CartContext (`/contexts/CartContext.tsx`)

Global cart state management providing:

- Cart operations (add, update, remove)
- Total calculations
- Customer information storage

### Products API (`/app/api/restaurants/[id]/products/route.ts`)

Backend API for:

- Fetching restaurant products
- Filtering available items
- Restaurant validation

## 🔧 Technical Implementation

### State Management

- **React Context**: Global cart state
- **Local State**: UI-specific states
- **Form State**: Customer information

### API Integration

```typescript
// Fetch products
GET /api/restaurants/:id/products

// Place order
POST /api/orders
{
  "restaurant_id": "123",
  "customer_name": "John",
  "customer_phone": "012345678",
  "items": [
    {
      "product_id": "1",
      "quantity": 2,
      "price": 5
    }
  ],
  "total_price": 10,
  "pickup_time": "2026-03-30T14:00:00"
}
```

### Cart Operations

```typescript
// Add to cart
addToCart(product: Product)

// Update quantity
updateQuantity(productId: string, quantity: number)

// Remove from cart
removeFromCart(productId: string)

// Clear cart
clearCart()

// Get totals
getTotalPrice(): number
getTotalItems(): number
```

## 🎨 UI/UX Features

### Mobile-First Design

- **Responsive Layout**: Optimized for mobile devices
- **Touch-Friendly**: Large tap targets
- **Bottom Navigation**: Sticky cart button
- **Modal Checkout**: Slide-up checkout modal

### User Experience

- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages
- **Success Feedback**: Order confirmation page
- **Form Validation**: Real-time validation feedback

### Accessibility

- **Semantic HTML**: Proper HTML structure
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **High Contrast**: Clear visual hierarchy

## 🔄 User Flow

1. **QR Code Scan**: Customer scans restaurant QR code
2. **Menu Loading**: System loads restaurant menu
3. **Product Selection**: Customer adds items to cart
4. **Cart Review**: Customer reviews cart items
5. **Checkout**: Customer fills information
6. **Order Placement**: System processes order
7. **Confirmation**: Success page with order details

## 🛡️ Validation & Error Handling

### Form Validation

- **Required Fields**: All customer info required
- **Phone Format**: Basic phone number validation
- **Pickup Time**: Minimum 30 minutes from now
- **Cart Empty**: Prevents empty order submission

### Error Handling

- **API Errors**: User-friendly error messages
- **Network Issues**: Retry mechanisms
- **Validation Errors**: Clear error feedback
- **Loading States**: Prevents duplicate submissions

## 🎯 Bonus Features Implemented

✅ **Auto-calculate total price** - Real-time price updates
✅ **Prevent empty order submission** - Cart validation
✅ **Show validation errors** - Form error feedback
✅ **Add loading spinner** - Order placement loading
✅ **Mobile-first design** - Responsive layout
✅ **Sticky cart button** - Always accessible cart
✅ **Clean product cards** - Professional UI
✅ **Simple checkout modal** - Streamlined process

## 🚀 Getting Started

1. **Navigate to Menu**: `/menu/[restaurantId]`
2. **Browse Products**: View available items
3. **Add to Cart**: Select desired items
4. **View Cart**: Click cart button
5. **Fill Information**: Enter customer details
6. **Select Pickup Time**: Choose pickup time
7. **Place Order**: Submit order
8. **Get Confirmation**: View order success page

## 📱 Mobile Experience

The system is optimized for mobile devices with:

- **Touch-Friendly Interface**: Large buttons and tap targets
- **Bottom Navigation**: Easy thumb reach
- **Slide-Up Modals**: Native mobile feel
- **Responsive Images**: Optimized image display
- **Fast Performance**: Optimized for mobile networks

## 🔧 Customization

### Styling

- **Tailwind CSS**: Easy customization
- **Component-Based**: Reusable components
- **Theme Support**: Simple theme changes

### Business Logic

- **Cart Context**: Easy to modify cart behavior
- **API Integration**: Flexible backend integration
- **Validation Logic**: Customizable validation rules

This Customer Order System provides a complete, production-ready solution for restaurant ordering with excellent user experience and robust functionality.
