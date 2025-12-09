#!/bin/bash

echo "📱 Twilio Setup Helper"
echo "====================="
echo ""
echo "Steps to fix messaging:"
echo ""
echo "1. Go to: https://console.twilio.com"
echo "2. Click 'Show auth token' button"
echo "3. Copy your auth token"
echo ""
read -p "Paste your Twilio auth token here: " AUTH_TOKEN

if [ -z "$AUTH_TOKEN" ]; then
    echo "❌ No token provided"
    exit 1
fi

# Update .env.local
sed -i.bak "s/TWILIO_AUTH_TOKEN=.*/TWILIO_AUTH_TOKEN=$AUTH_TOKEN/" .env.local

echo ""
echo "✅ Updated .env.local with your auth token!"
echo ""
echo "Now restart your dev server:"
echo "1. Press Ctrl+C to stop the current server"
echo "2. Run: npm run dev"
echo ""
echo "Then try sending a message again!"