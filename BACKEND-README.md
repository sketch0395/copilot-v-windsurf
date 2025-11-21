# Focus Zone Backend API

## Local Development

1. **Install Dependencies**
```bash
npm install
```

2. **Set Environment Variables**
Copy `.env.example` to `.env.local` and set your JWT secret:
```bash
cp .env.example .env.local
```

Edit `.env.local` and change the JWT_SECRET to a secure random string.

3. **Run Development Server**
```bash
npm run dev
```

The database will be automatically created in the `data/` directory on first run.

## API Endpoints

### Authentication

**POST /api/auth/signup**
- Body: `{ email, password, displayName? }`
- Returns: `{ token, user }`

**POST /api/auth/login**
- Body: `{ email, password }`
- Returns: `{ token, user }`

### Data Sync

**GET /api/data?type={routine|gamification|usage}**
- Headers: `Authorization: Bearer <token>`
- Returns: User data for specific type

**GET /api/data**
- Headers: `Authorization: Bearer <token>`
- Returns: All user data

**POST /api/data**
- Headers: `Authorization: Bearer <token>`
- Body: `{ dataType, data }`
- Returns: Success confirmation

**DELETE /api/data?type={routine|gamification|usage}**
- Headers: `Authorization: Bearer <token>`
- Returns: Success confirmation

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
vercel
```

3. **Set Environment Variables**
In Vercel dashboard, add:
- `JWT_SECRET`: Your secure JWT secret

**Note:** SQLite doesn't persist on Vercel serverless. For production, use:
- Vercel Postgres
- Supabase
- PlanetScale
- Or any other hosted database

### Option 2: Railway

1. Create account at [railway.app](https://railway.app)
2. Connect your GitHub repo
3. Add environment variable: `JWT_SECRET`
4. Deploy automatically on push

### Option 3: Render

1. Create account at [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repo
4. Add environment variable: `JWT_SECRET`
5. Set build command: `npm install && npm run build`
6. Set start command: `npm start`

### Option 4: Self-Hosted (VPS/Docker)

**Using Node.js directly:**
```bash
npm install
npm run build
npm start
```

**Using PM2:**
```bash
npm install -g pm2
npm install
npm run build
pm2 start npm --name "focus-zone" -- start
pm2 save
pm2 startup
```

## Database

The app uses SQLite for local development. For production:

1. **Switch to PostgreSQL:**
   - Install `pg` package
   - Update `src/lib/db.ts` to use PostgreSQL
   - Set `DATABASE_URL` environment variable

2. **Switch to MySQL:**
   - Install `mysql2` package
   - Update `src/lib/db.ts` to use MySQL
   - Set `DATABASE_URL` environment variable

## Security Notes

- Change `JWT_SECRET` in production
- Use HTTPS in production
- Consider adding rate limiting
- Add CORS configuration if needed
- Enable SQL injection protection (prepared statements already used)
- Consider adding refresh tokens for better security

## Monitoring

For production, consider adding:
- Error tracking (Sentry)
- Performance monitoring (New Relic, Datadog)
- Database backups
- Health check endpoint

## Backup

To backup your SQLite database:
```bash
cp data/focus-zone.db data/focus-zone-backup-$(date +%Y%m%d).db
```

## Migration from localStorage

Users with existing local data will need to sign up. Their local data will be preserved in localStorage but won't automatically sync. To migrate:
1. Export local data to JSON
2. Import via API after authentication

## Tech Stack

- **Framework:** Next.js 15
- **Database:** SQLite (local) / PostgreSQL (production)
- **Auth:** JWT with bcryptjs
- **API:** Next.js API Routes
- **Deployment:** Vercel-ready, works on any Node.js host
