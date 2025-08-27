#!/bin/bash

# Development startup script for GroverForex with dummy API
# This script starts both the dummy API server and the React Native app

echo "🚀 Starting GroverForex Development Environment"
echo "=" $(printf '=%.0s' {1..50})

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Please run this script from the GroverForex root directory${NC}"
    exit 1
fi

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to start dummy API server
start_dummy_api() {
    echo -e "\n${BLUE}📡 Starting Dummy API Server...${NC}"
    
    if check_port 3001; then
        echo -e "${YELLOW}⚠️  Port 3001 is already in use. Dummy API might already be running.${NC}"
        echo -e "${YELLOW}   You can check with: curl http://localhost:3001/health${NC}"
    else
        echo -e "${GREEN}✅ Starting dummy API server on port 3001${NC}"
        cd server && npm start &
        DUMMY_API_PID=$!
        cd ..
        
        # Wait a moment for the server to start
        sleep 3
        
        # Test if the server started successfully
        if curl -s http://localhost:3001/health > /dev/null; then
            echo -e "${GREEN}✅ Dummy API server is running successfully${NC}"
        else
            echo -e "${RED}❌ Failed to start dummy API server${NC}"
            exit 1
        fi
    fi
}

# Function to check Expo CLI
check_expo() {
    if ! command -v expo &> /dev/null; then
        echo -e "${YELLOW}⚠️  Expo CLI not found. Installing globally...${NC}"
        npm install -g @expo/cli
    fi
}

# Function to start React Native app
start_react_native() {
    echo -e "\n${BLUE}📱 Starting React Native App...${NC}"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing dependencies...${NC}"
        npm install
    fi
    
    echo -e "${GREEN}✅ Starting Expo development server${NC}"
    echo -e "${BLUE}🔧 Configuration: Using dummy API for real-time data${NC}"
    
    npm start
}

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🧹 Cleaning up...${NC}"
    if [ ! -z "$DUMMY_API_PID" ]; then
        kill $DUMMY_API_PID 2>/dev/null
        echo -e "${GREEN}✅ Stopped dummy API server${NC}"
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main execution
echo -e "\n${BLUE}🔧 Pre-flight checks...${NC}"

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js first.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js version: $NODE_VERSION${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found. Please install npm first.${NC}"
    exit 1
fi

# Start services
start_dummy_api
check_expo

echo -e "\n${GREEN}🎉 Development environment is ready!${NC}"
echo -e "${BLUE}📊 Dummy API: http://localhost:3001${NC}"
echo -e "${BLUE}🔌 WebSocket: ws://localhost:3001${NC}"
echo -e "${BLUE}📱 React Native: Starting Expo...${NC}"
echo -e "\n${YELLOW}💡 Tips:${NC}"
echo -e "   • API health: curl http://localhost:3001/health"
echo -e "   • Manual update: curl -X POST http://localhost:3001/trigger_update"
echo -e "   • View real-time data: curl http://localhost:3001/quote"
echo -e "   • Stop everything: Press Ctrl+C"
echo -e "\n" $(printf '=%.0s' {1..50})

start_react_native
