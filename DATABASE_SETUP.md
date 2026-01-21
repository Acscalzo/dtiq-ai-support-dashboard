# Database Setup Guide

This project uses Prisma 7 with PostgreSQL for data management.

## Prerequisites

- PostgreSQL 12 or higher
- Node.js 18 or higher

## Setup Steps

### 1. Configure Database Connection

Create a `.env` file in the root directory (or copy from `.env.example`):

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/ai_support_dashboard"
```

Replace the values with your actual database credentials:
- `username`: Your PostgreSQL username
- `password`: Your PostgreSQL password
- `localhost:5432`: Your database host and port
- `ai_support_dashboard`: Your database name

### 2. Create the Database

Connect to PostgreSQL and create the database:

```bash
psql -U postgres
CREATE DATABASE ai_support_dashboard;
\q
```

Or use a GUI tool like pgAdmin or TablePlus.

### 3. Run Migrations

Generate and apply the database schema:

```bash
npm run db:migrate
```

This will:
- Create all tables and relationships
- Set up indexes for optimal query performance
- Generate the Prisma Client for type-safe database access

### 4. Seed Sample Data (Optional)

To populate the database with sample data for testing:

```bash
npm run db:seed
```

This will create:
- 3 support agents
- 3 customers
- 10 tickets with various statuses
- Interactions, insights, documentation, and settings

### 5. Explore the Database

Use Prisma Studio to view and edit data in a GUI:

```bash
npm run db:studio
```

This opens a browser interface at `http://localhost:5555`

## Database Schema Overview

### Core Models

- **Ticket**: Support tickets with status, priority, and AI resolution tracking
- **Customer**: Customer information and contact details
- **Agent**: Support agent profiles with performance metrics
- **Interaction**: All customer-agent communications (chat, email, call)
- **Documentation**: Knowledge base articles for AI-assisted support
- **Insight**: AI-generated insights (upsells, training needs, recurring issues)
- **Setting**: Application configuration stored as key-value pairs

### Key Features

- No multi-tenancy: Single company per deployment
- Cascading deletes for data integrity
- Indexes for common query patterns
- Support for AI sentiment analysis and quality scoring
- Flexible JSON metadata fields for extensibility

## Useful Commands

```bash
# Generate Prisma Client after schema changes
npm run db:generate

# Push schema changes without creating migrations (for rapid prototyping)
npm run db:push

# Create a new migration
npm run db:migrate

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# View database in browser
npm run db:studio
```

## Troubleshooting

### Connection Issues

If you see "Can't reach database server":
1. Verify PostgreSQL is running: `pg_isready`
2. Check your DATABASE_URL in .env
3. Ensure the database exists
4. Verify network connectivity and firewall settings

### Migration Errors

If migrations fail:
1. Check database permissions
2. Ensure no conflicting schema changes
3. Try `npx prisma migrate reset` (WARNING: destroys data)
4. Review migration files in `prisma/migrations/`

### Prisma Client Issues

If you see "PrismaClient is not configured":
1. Run `npm run db:generate`
2. Restart your development server
3. Check that @prisma/client is installed

## Production Deployment

For production deployments:

1. Use a managed PostgreSQL service (AWS RDS, DigitalOcean, Supabase, etc.)
2. Set DATABASE_URL in your hosting environment
3. Run migrations as part of your deployment pipeline:
   ```bash
   npx prisma migrate deploy
   ```
4. Never commit `.env` files - use environment variables
5. Enable connection pooling for better performance
6. Set up automated backups

## Prisma 7 Notes

This project uses Prisma 7, which has some changes from previous versions:

- Database URL is configured in `prisma.config.ts` instead of `schema.prisma`
- The `url` property in the datasource block is no longer used
- Improved performance and type safety
- Better support for edge deployments
