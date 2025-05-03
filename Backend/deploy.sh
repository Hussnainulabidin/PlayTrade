#!/bin/bash

# Deployment script for PlayTrade Backend

echo "Preparing to deploy PlayTrade backend..."

# Pull latest changes
echo "Pulling latest changes..."
git pull

# Install dependencies
echo "Installing dependencies..."
npm install

# Make sure environment variables are set
echo "Checking environment variables..."
if [ ! -f "./config.env" ]; then
  echo "Error: config.env file not found!"
  exit 1
fi

# Start or restart the application
echo "Restarting the application..."
if command -v pm2 &> /dev/null; then
  pm2 restart app.js || pm2 start app.js
else
  echo "PM2 not found. You may need to install it globally: npm install -g pm2"
  echo "Alternatively, you can use: node server.js"
  node server.js
fi

echo "Deployment completed!"
echo "CORS has been configured to allow requests from:"
echo "- http://localhost:3000"
echo "- http://localhost:5173"
echo "- https://playtrade-production.up.railway.app"
echo "- https://playtrade.com" 