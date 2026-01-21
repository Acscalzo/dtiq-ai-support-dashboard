# Quick Start Guide

Get your AI Support Dashboard running locally in under 5 minutes!

## Prerequisites

1. **Install Docker Desktop** (if you haven't already)
   - macOS: [Download Docker Desktop for Mac](https://www.docker.com/products/docker-desktop)
   - Windows: [Download Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
   - Open Docker Desktop and wait for it to start

2. **Install Node.js** (if you haven't already)
   - [Download Node.js 18 or higher](https://nodejs.org/)

## Automated Setup (Recommended)

We've created setup scripts that do everything for you!

### On macOS/Linux:
```bash
./setup.sh
```

### On Windows (PowerShell):
```powershell
./setup.ps1
```

That's it! The script will:
- ✅ Check Docker installation
- ✅ Create your .env file
- ✅ Install dependencies
- ✅ Start PostgreSQL in Docker
- ✅ Create database tables
- ✅ Add sample data

Then just run:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you're done! 🎉

## Manual Setup

If you prefer to do it step by step:

1. **Copy environment variables:**
   ```bash
   cp .env.example .env
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start Docker database:**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```

5. **Seed sample data:**
   ```bash
   npm run db:seed
   ```

6. **Start the dev server:**
   ```bash
   npm run dev
   ```

7. **Open your browser:**
   ```
   http://localhost:3000
   ```

## What's Inside?

After seeding, your database has:
- 👥 **3 Support Agents** with different roles
- 👤 **3 Customers** from different companies
- 🎫 **10 Tickets** with various statuses (open, in progress, resolved, closed)
- 💬 **Multiple Interactions** (chat, email, call)
- 🤖 **AI Insights** (upsells, training needs, recurring issues)
- 📚 **5 Documentation Articles**
- ⚙️ **System Settings**

## View Your Data

Open Prisma Studio to see all your data in a visual interface:
```bash
npm run db:studio
```

Opens at [http://localhost:5555](http://localhost:5555)

## Customize Branding

Edit `.env` to customize for your company:

```bash
COMPANY_NAME="DTIQ"
NEXT_PUBLIC_COMPANY_NAME="DTIQ"
COMPANY_SLUG="dtiq"
NEXT_PUBLIC_COMPANY_SLUG="dtiq"
COMPANY_PRIMARY_COLOR="#0066CC"
NEXT_PUBLIC_COMPANY_PRIMARY_COLOR="#0066CC"
```

Restart the dev server to see changes.

## Stopping Everything

When you're done for the day:
```bash
docker-compose down
```

Your data is preserved! Just run `docker-compose up -d` to start again.

## Need More Help?

- 🐳 **New to Docker?** Read [DOCKER_GUIDE.md](DOCKER_GUIDE.md)
- 🗄️ **Database questions?** Read [DATABASE_SETUP.md](DATABASE_SETUP.md)
- 🏢 **Deployment?** Read [README.md](README.md)

## Troubleshooting

### "Docker is not running"
Open Docker Desktop and wait for the whale icon to appear.

### "Port 5432 is already in use"
You have PostgreSQL running locally. Either:
- Stop it: `brew services stop postgresql` (macOS)
- Or change the port in `docker-compose.yml` to `5433:5432`

### "Cannot connect to database"
Wait 10-15 seconds after starting Docker, then try again:
```bash
docker-compose down
docker-compose up -d
sleep 10
npm run db:migrate
```

### Database reset (fresh start)
```bash
docker-compose down -v  # ⚠️ Deletes all data
docker-compose up -d
npm run db:migrate
npm run db:seed
```

---

**That's it! You're ready to start building.** 🚀
