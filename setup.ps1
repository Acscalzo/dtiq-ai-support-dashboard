# AI Support Dashboard - Setup Script (Windows PowerShell)
# This script automates the initial setup of the project with Docker

$ErrorActionPreference = "Stop"

Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║  AI Support Dashboard - Setup Script      ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

# Check if Docker is installed
Write-Host "[1/7] Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    docker info | Out-Null
    Write-Host "✓ Docker is installed and running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed or not running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Docker Desktop first:" -ForegroundColor White
    Write-Host "👉 https://www.docker.com/products/docker-desktop" -ForegroundColor White
    Write-Host ""
    Write-Host "After installing, run this script again." -ForegroundColor White
    exit 1
}
Write-Host ""

# Check if .env exists
Write-Host "[2/7] Checking environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path .env)) {
    Write-Host "⚠️  .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✓ Created .env file" -ForegroundColor Green
    Write-Host "ℹ️  You can customize branding values in .env later" -ForegroundColor Blue
} else {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
}
Write-Host ""

# Install dependencies
Write-Host "[3/7] Installing npm dependencies..." -ForegroundColor Yellow
if (-not (Test-Path node_modules)) {
    npm install
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✓ Dependencies already installed" -ForegroundColor Green
}
Write-Host ""

# Start Docker containers
Write-Host "[4/7] Starting Docker containers..." -ForegroundColor Yellow
docker-compose up -d
Write-Host "✓ Database container started" -ForegroundColor Green
Write-Host ""

# Wait for database to be ready
Write-Host "[5/7] Waiting for database to be ready..." -ForegroundColor Yellow
Write-Host "ℹ️  This may take 10-15 seconds..." -ForegroundColor Blue
Start-Sleep -Seconds 5

$maxRetries = 6
$retryCount = 0
$databaseReady = $false

while ($retryCount -lt $maxRetries) {
    try {
        docker exec ai-support-db pg_isready -U postgres | Out-Null
        $databaseReady = $true
        Write-Host "✓ Database is ready" -ForegroundColor Green
        break
    } catch {
        $retryCount++
        if ($retryCount -eq $maxRetries) {
            Write-Host "❌ Database failed to start" -ForegroundColor Red
            Write-Host "Try running: docker logs ai-support-db" -ForegroundColor White
            exit 1
        }
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
    }
}
Write-Host ""

# Run migrations
Write-Host "[6/7] Running database migrations..." -ForegroundColor Yellow
npm run db:migrate -- --name init
Write-Host "✓ Database schema created" -ForegroundColor Green
Write-Host ""

# Seed database
Write-Host "[7/7] Seeding database with sample data..." -ForegroundColor Yellow
npm run db:seed
Write-Host "✓ Sample data added" -ForegroundColor Green
Write-Host ""

# Success message
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║         🎉 Setup Complete! 🎉              ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Blue
Write-Host ""
Write-Host "  1️⃣  Start the development server:"
Write-Host "     npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "  2️⃣  Open your browser:"
Write-Host "     http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "  3️⃣  (Optional) View database in Prisma Studio:"
Write-Host "     npm run db:studio" -ForegroundColor Yellow
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Blue
Write-Host "  • Stop database:    docker-compose down" -ForegroundColor Yellow
Write-Host "  • View logs:        docker logs ai-support-db" -ForegroundColor Yellow
Write-Host "  • Reset database:   docker-compose down -v (deletes data)" -ForegroundColor Yellow
Write-Host ""
Write-Host "📚 For more info, read: DOCKER_GUIDE.md" -ForegroundColor Blue
Write-Host ""
