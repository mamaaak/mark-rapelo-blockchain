#!/bin/bash

# API Testing Script
# Make executable with: chmod +x test_api.sh

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚀 Testing Ethereum Wallet API"
echo "================================"
echo ""

# Test 1: Health Check
echo "${YELLOW}Test 1: Health Check${NC}"
echo "GET $BASE_URL/api/health"
echo ""
curl -s "$BASE_URL/api/health" | jq '.'
echo ""
echo "---"
echo ""

# Test 2: Valid Address (Vitalik's address)
echo "${YELLOW}Test 2: Valid Address (Vitalik.eth)${NC}"
echo "GET $BASE_URL/api/wallet/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
echo ""
curl -s "$BASE_URL/api/wallet/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" | jq '.'
echo ""
echo "---"
echo ""

# Test 3: Another Valid Address
echo "${YELLOW}Test 3: Another Valid Address${NC}"
echo "GET $BASE_URL/api/wallet/0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
echo ""
curl -s "$BASE_URL/api/wallet/0x742d35Cc6634C0532925a3b844Bc454e4438f44e" | jq '.'
echo ""
echo "---"
echo ""

# Test 4: Invalid Address
echo "${YELLOW}Test 4: Invalid Address (Should return 400)${NC}"
echo "GET $BASE_URL/api/wallet/invalid-address"
echo ""
curl -s "$BASE_URL/api/wallet/invalid-address" | jq '.'
echo ""
echo "---"
echo ""

# Test 5: Cache Test - Two Rapid Requests
echo "${YELLOW}Test 5: Cache Performance Test${NC}"
echo "Making first request..."
echo ""
time curl -s "$BASE_URL/api/wallet/0x742d35Cc6634C0532925a3b844Bc454e4438f44e" > /dev/null
echo ""
echo "Making second request immediately (should be faster - cached)..."
echo ""
time curl -s "$BASE_URL/api/wallet/0x742d35Cc6634C0532925a3b844Bc454e4438f44e" > /dev/null
echo ""
echo "---"
echo ""

echo "${GREEN}✅ All tests complete!${NC}"
echo ""
echo "Check your server logs to see cache behavior:"
echo "  - Look for: '🔍 Fetching fresh block number...'"
echo "  - Look for: '⛽ Fetching fresh gas price...'"
echo "  - These should appear only once every 10-30 seconds"
