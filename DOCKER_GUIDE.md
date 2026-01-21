# Docker Setup Guide for Beginners

## What is Docker? (In Simple Terms)

Think of Docker as a **magic box** that runs software in an isolated environment on your computer.

Instead of installing PostgreSQL directly on your Mac/Windows (which can be messy and complicated), Docker runs it in a **container** - a lightweight, isolated environment that:
- Starts/stops with one command
- Doesn't mess with your system
- Works the same on everyone's computer
- Can be deleted without leaving a trace

**Analogy:** It's like running PostgreSQL in a virtual machine, but much faster and lighter.

## Step 1: Install Docker Desktop

### For macOS:
1. Go to [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
2. Download "Docker Desktop for Mac"
3. Open the `.dmg` file and drag Docker to Applications
4. Open Docker Desktop from Applications
5. Wait for the whale icon to appear in your menu bar (top-right)
6. When the whale icon is steady (not animated), Docker is ready!

### For Windows:
1. Go to [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
2. Download "Docker Desktop for Windows"
3. Run the installer
4. Restart your computer if prompted
5. Open Docker Desktop
6. Wait for Docker to start (you'll see the icon in your system tray)

### Verify Docker is Installed:
```bash
docker --version
```
You should see something like: `Docker version 24.x.x`

```bash
docker-compose --version
```
You should see: `Docker Compose version v2.x.x`

## Step 2: Start the Database

Navigate to your project folder and run:

```bash
docker-compose up -d
```

**What does this do?**
- `docker-compose up` = Start the services defined in `docker-compose.yml`
- `-d` = "Detached mode" (runs in background, you get your terminal back)

**What's happening behind the scenes:**
1. Docker downloads PostgreSQL (first time only, ~80MB)
2. Creates a container named `ai-support-db`
3. Starts PostgreSQL on port 5432
4. Creates a database called `ai_support_dashboard`

**You should see:**
```
[+] Running 2/2
 ✔ Network ai-support-dashboard_default    Created
 ✔ Container ai-support-db                 Started
```

## Step 3: Verify Database is Running

Check if the container is running:

```bash
docker ps
```

You should see something like:
```
CONTAINER ID   IMAGE                COMMAND                  STATUS         PORTS                    NAMES
abc123def456   postgres:15-alpine   "docker-entrypoint.s…"   Up 10 seconds  0.0.0.0:5432->5432/tcp   ai-support-db
```

If you see this, your database is running! 🎉

## Step 4: Set Up Your Environment Variables

Create a `.env` file (or update it) with:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_support_dashboard"
```

**Breaking down this URL:**
- `postgresql://` = Database type
- `postgres:postgres` = username:password (from docker-compose.yml)
- `@localhost:5432` = Where the database is running
- `/ai_support_dashboard` = Database name

## Step 5: Run Migrations and Seed Data

Now your database is running, let's create tables and add sample data:

```bash
# Create all database tables
npm run db:migrate

# Add sample data (agents, customers, tickets, etc.)
npm run db:seed
```

**What's happening:**
- Prisma connects to your Docker database
- Creates all tables from your schema
- Fills them with sample data

## Step 6: Start Your Next.js App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## Useful Docker Commands

### View Running Containers
```bash
docker ps
```

### View All Containers (including stopped)
```bash
docker ps -a
```

### Stop the Database
```bash
docker-compose down
```
This stops and removes the container, but **keeps your data** (it's stored in a Docker volume).

### Stop AND Delete All Data
```bash
docker-compose down -v
```
⚠️ **Warning:** This deletes everything! Use when you want a fresh start.

### View Database Logs
```bash
docker logs ai-support-db
```

### View Live Logs (follows new logs)
```bash
docker logs -f ai-support-db
```
Press `Ctrl+C` to stop following.

### Restart the Database
```bash
docker-compose restart
```

### Access PostgreSQL CLI Inside Container
```bash
docker exec -it ai-support-db psql -U postgres -d ai_support_dashboard
```
Now you're inside PostgreSQL! Try:
```sql
\dt                    -- List all tables
SELECT * FROM "Ticket" LIMIT 5;  -- View tickets
\q                     -- Quit
```

## Complete Workflow (All Steps Together)

```bash
# 1. Start database
docker-compose up -d

# 2. Create tables
npm run db:migrate

# 3. Add sample data
npm run db:seed

# 4. Start Next.js
npm run dev

# 5. (Optional) Open Prisma Studio to view data
npm run db:studio
```

## Troubleshooting

### Problem: "Cannot connect to the Docker daemon"
**Solution:** Make sure Docker Desktop is running. You should see the whale icon in your menu bar/system tray.

### Problem: "Port 5432 is already allocated"
**Solution:** You have another PostgreSQL running. Either:
1. Stop it: `brew services stop postgresql` (macOS) or stop the Windows service
2. Change the port in `docker-compose.yml` from `"5432:5432"` to `"5433:5432"` and update your `DATABASE_URL` to use port 5433

### Problem: "docker-compose: command not found"
**Solution:**
- Try `docker compose` (without the hyphen) - newer Docker versions use this
- Update your Docker Desktop to the latest version

### Problem: Database connection fails after migration
**Solution:**
```bash
# Stop everything
docker-compose down

# Start fresh
docker-compose up -d

# Wait 10 seconds for database to fully start
sleep 10

# Try migration again
npm run db:migrate
```

### Problem: "Error: P1001 Can't reach database server"
**Solution:**
1. Check if container is running: `docker ps`
2. Check logs: `docker logs ai-support-db`
3. Verify your DATABASE_URL in `.env`
4. Try restarting: `docker-compose restart`

## What Happens When You Restart Your Computer?

Docker containers **do not auto-start** by default. After a restart:

1. Open Docker Desktop (wait for it to start)
2. Run `docker-compose up -d` again
3. Your data is still there! (stored in a Docker volume)

Or set auto-start in Docker Desktop settings:
- Open Docker Desktop
- Go to Settings → General
- Check "Start Docker Desktop when you log in"

## Cleaning Up (When You're Done with the Project)

### Just stop the database
```bash
docker-compose down
```
(You can start it again later, data is preserved)

### Remove everything (database + data)
```bash
docker-compose down -v
docker rmi postgres:15-alpine
```

## Optional: Add pgAdmin (Visual Database Tool)

If you want a GUI to explore your database:

1. Uncomment the `pgadmin` section in `docker-compose.yml`
2. Restart: `docker-compose down && docker-compose up -d`
3. Open [http://localhost:5050](http://localhost:5050)
4. Login:
   - Email: `admin@admin.com`
   - Password: `admin`
5. Add server:
   - Right-click "Servers" → Register → Server
   - General tab: Name = "Local Database"
   - Connection tab:
     - Host: `postgres` (the service name from docker-compose.yml)
     - Port: `5432`
     - Database: `ai_support_dashboard`
     - Username: `postgres`
     - Password: `postgres`

## Next Steps

Once everything is running:
- View data in Prisma Studio: `npm run db:studio`
- Start building your dashboard pages
- Create API routes that use Prisma
- Customize the branding with environment variables

## Quick Reference Card

```bash
# Daily workflow
docker-compose up -d          # Start database
npm run dev                   # Start Next.js
npm run db:studio             # View data (optional)

# When done for the day
docker-compose down           # Stop database
# (or just leave it running, it uses minimal resources)

# Reset everything
docker-compose down -v        # Delete all data
npm run db:migrate            # Recreate tables
npm run db:seed               # Re-add sample data
```

## Need Help?

If you get stuck:
1. Check the error message carefully
2. Look in the Troubleshooting section above
3. Check Docker Desktop logs (click the whale icon → "Troubleshoot")
4. Make sure Docker Desktop is running and shows a green status

Docker seems complicated at first, but you'll only need these few commands! 🚀
