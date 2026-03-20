#!/bin/bash
echo "Installing dependencies..."
cd /home/hort-lymeng/Documents44/Final-project/System-sell-food-owner/food-booking-system
node /usr/local/bin/npm install
echo "Dependencies installed successfully!"
echo "Starting development server..."
npm run dev
