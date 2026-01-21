#!/bin/bash

# AI Support Dashboard - Setup Script
# This script automates the initial setup of the project with Docker

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  AI Support Dashboard - Setup Script      ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo ""

# Check if Docker is installed
echo -e "${YELLOW}[1/7]${NC} Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed!${NC}"
    echo ""
    echo "Please install Docker Desktop first:"
    echo "👉 https://www.docker.com/products/docker-desktop"
    echo ""
    echo "After installing, run this script again."
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running!${NC}"
    echo ""
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed and running${NC}"
echo ""

# Check if .env exists
echo -e "${YELLOW}[2/7]${NC} Checking environment configuration..."
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file${NC}"
    echo -e "${BLUE}ℹ️  You can customize branding values in .env later${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi
echo ""

# Install dependencies
echo -e "${YELLOW}[3/7]${NC} Installing npm dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi
echo ""

# Start Docker containers
echo -e "${YELLOW}[4/7]${NC} Starting Docker containers..."
docker-compose up -d
echo -e "${GREEN}✓ Database container started${NC}"
echo ""

# Wait for database to be ready
echo -e "${YELLOW}[5/7]${NC} Waiting for database to be ready..."
echo -e "${BLUE}ℹ️  This may take 10-15 seconds...${NC}"
sleep 5

# Retry logic for database connection
max_retries=6
retry_count=0
while [ $retry_count -lt $max_retries ]; do
    if docker exec ai-support-db pg_isready -U postgres > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Database is ready${NC}"
        break
    fi
    retry_count=$((retry_count + 1))
    if [ $retry_count -eq $max_retries ]; then
        echo -e "${RED}❌ Database failed to start${NC}"
        echo "Try running: docker logs ai-support-db"
        exit 1
    fi
    echo -n "."
    sleep 2
done
echo ""

# Run migrations
echo -e "${YELLOW}[6/7]${NC} Running database migrations..."
npm run db:migrate -- --name init
echo -e "${GREEN}✓ Database schema created${NC}"
echo ""

# Seed database
echo -e "${YELLOW}[7/7]${NC} Seeding database with sample data..."
npm run db:seed
echo -e "${GREEN}✓ Sample data added${NC}"
echo ""

# Success message
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         🎉 Setup Complete! 🎉              ║${NC}"
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo ""
echo -e "  1️⃣  Start the development server:"
echo -e "     ${YELLOW}npm run dev${NC}"
echo ""
echo -e "  2️⃣  Open your browser:"
echo -e "     ${YELLOW}http://localhost:3000${NC}"
echo ""
echo -e "  3️⃣  (Optional) View database in Prisma Studio:"
echo -e "     ${YELLOW}npm run db:studio${NC}"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo -e "  • Stop database:    ${YELLOW}docker-compose down${NC}"
echo -e "  • View logs:        ${YELLOW}docker logs ai-support-db${NC}"
echo -e "  • Reset database:   ${YELLOW}docker-compose down -v${NC} (deletes data)"
echo ""
echo -e "${BLUE}📚 For more info, read:${NC} DOCKER_GUIDE.md"
echo ""
