#!/bin/bash

# FAST2SMS Setup Verification Script
# Run this to verify your FAST2SMS configuration

echo "🔍 FAST2SMS Configuration Check"
echo "================================"
echo ""

# Check if .env file exists
if [ -f backend/.env ]; then
    echo "✅ .env file found in backend/"
else
    echo "❌ .env file NOT found in backend/"
    echo "   Create: backend/.env"
    exit 1
fi

# Check if FAST2SMS_API_KEY is set
if grep -q "FAST2SMS_API_KEY=" backend/.env; then
    API_KEY=$(grep "FAST2SMS_API_KEY=" backend/.env | cut -d '=' -f 2-)
    if [ -n "$API_KEY" ] && [ "$API_KEY" != "your_api_key_here" ]; then
        KEY_LENGTH=${#API_KEY}
        echo "✅ FAST2SMS_API_KEY is configured"
        echo "   Key length: $KEY_LENGTH characters"
        if [ $KEY_LENGTH -lt 20 ]; then
            echo "   ⚠️  Key seems too short (usually 40+ chars)"
        fi
    else
        echo "❌ FAST2SMS_API_KEY is empty or has placeholder value"
        echo "   Please set the actual API key from FAST2SMS dashboard"
    fi
else
    echo "❌ FAST2SMS_API_KEY not found in .env"
    echo "   Add this line to backend/.env:"
    echo "   FAST2SMS_API_KEY=your_api_key_from_dashboard"
    exit 1
fi

echo ""
echo "Next steps:"
echo "1. Run the debug test:"
echo "   cd backend && npx ts-node src/scripts/test-fast2sms.ts"
echo ""
echo "2. If test passes, restart the backend server:"
echo "   npm run dev"
echo ""
