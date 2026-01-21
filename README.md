# DTIQ AI Support Dashboard

AI-powered customer support platform for DTIQ, built with Next.js 14 and Claude AI.

## Features

- Real-time ticket management and tracking
- AI-powered insights and analytics
- Intelligent search across tickets and documentation
- Customer support documentation hub
- Advanced analytics and trend analysis
- Dark mode support
- Firebase authentication
- Responsive dashboard interface

## Technology Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Firebase Auth
- **AI:** Claude API (Anthropic)
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- Firebase project
- Claude API key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Acscalzo/dtiq-ai-support-dashboard.git
   cd dtiq-ai-support-dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```

4. **Edit `.env.local` with your configuration:**
   - Set up Firebase credentials
   - Add your PostgreSQL database URL
   - Add your Claude API key

5. **Set up the database:**
   ```bash
   npm run db:push
   npm run db:seed  # Optional: seed with sample data
   ```

6. **Run the development server:**
   ```bash
   npm run dev
   ```

7. **Open [http://localhost:3000](http://localhost:3000) in your browser**

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio
- `npm run db:push` - Push schema changes to database
- `npm run db:generate` - Generate Prisma client

## Project Structure

```
/dtiq-ai-support-dashboard
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── login/             # Login page
│   │   ├── signup/            # Signup page
│   │   └── ...
│   ├── components/            # React components
│   │   ├── auth/             # Authentication components
│   │   ├── dashboard/        # Dashboard components
│   │   └── ui/              # Reusable UI components
│   ├── contexts/             # React contexts
│   ├── lib/                  # Utility libraries
│   │   ├── api/             # API helpers
│   │   ├── auth/            # Authentication helpers
│   │   └── firebase/        # Firebase configuration
│   ├── types/               # TypeScript types
│   └── config/              # Configuration files
├── prisma/                  # Database schema and migrations
├── public/                  # Static assets
└── ...
```

## Configuration

### Branding

The application branding is configured via environment variables in `.env.local`:

```env
COMPANY_NAME="DTIQ"
NEXT_PUBLIC_COMPANY_NAME="DTIQ"
COMPANY_SLUG="dtiq"
NEXT_PUBLIC_COMPANY_SLUG="dtiq"
COMPANY_PRIMARY_COLOR="#0066CC"
NEXT_PUBLIC_COMPANY_PRIMARY_COLOR="#0066CC"
```

### Database

Configure your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dtiq_support"
```

### Firebase Authentication

Add your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-app.appspot.com"
# ... other Firebase config
```

### Firebase Storage (for User Avatars)

To enable user profile photo uploads:

1. **Enable Firebase Storage** in the Firebase Console:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Navigate to Build > Storage
   - Click "Get Started" and follow the setup wizard

2. **Configure Storage Rules** in the Firebase Console or `storage.rules`:
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       // Allow users to read/write only their own avatar
       match /avatars/{userId}/{allPaths=**} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

3. **Set the Storage Bucket** in your environment variables:
   ```env
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-app.appspot.com"
   ```

   You can find this value in Firebase Console > Project Settings > General > Your apps > Firebase SDK snippet

### Claude AI

Add your Claude API key from [Anthropic Console](https://console.anthropic.com/):

```env
CLAUDE_API_KEY="sk-ant-..."
```

## Deployment

### Vercel (Recommended)

1. Push this repository to GitHub
2. Import the project in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

### Other Platforms

For deployment to AWS, Google Cloud, Azure, or self-hosted environments, follow standard Next.js deployment guides and ensure all environment variables are properly configured.

## Security Notes

- Never commit `.env.local` or any file containing secrets to version control
- Keep Firebase private keys secure
- Rotate API keys regularly
- Use environment-specific configurations for development, staging, and production

## Support

For issues or questions about this project, please contact the development team.

## License

Proprietary - DTIQ Internal Use Only
