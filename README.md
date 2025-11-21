# 🧠 Focus Zone - ADHD Productivity Tracker

A gamified productivity app designed for people with ADHD to track daily routines, manage focus sessions, and build consistent habits.

## ✨ Features

- 📅 **Daily Schedule Management** - Drag-and-drop reorderable time blocks
- ⏱️ **Pomodoro Timer** - Focus sessions with break reminders
- 🎮 **Gamification** - Earn points, level up, and unlock achievements
- 📊 **Progress Tracking** - Calendar view showing your consistency
- 💬 **Motivational Quotes** - Fresh inspiration on every page load
- 🎨 **Multiple Themes** - Light, dark, ocean, sunset, forest, and neon modes
- 🔐 **User Authentication** - Secure login with JWT tokens
- ☁️ **Cloud Sync** - Access your data across all devices
- 📱 **Mobile Friendly** - Responsive design for all screen sizes

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Production Deployment

We provide Docker-based deployment with one command! See [DEPLOYMENT.md](./DEPLOYMENT.md) for full details.

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh YOUR_SERVER_IP YOUR_USERNAME
```

**Windows:**
```batch
deploy.bat YOUR_SERVER_IP YOUR_USERNAME
```

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Complete deployment instructions
- [Backend API](./BACKEND-README.md) - API documentation and database info

## 🛠️ Tech Stack

- **Framework:** Next.js 15 with App Router
- **Styling:** Tailwind CSS
- **Database:** SQLite (local) / PostgreSQL (production)
- **Authentication:** JWT with bcryptjs
- **Deployment:** Docker + Docker Compose

## 🎯 Made For ADHD Brains

This app is specifically designed with ADHD in mind:
- Visual progress indicators
- Instant feedback and rewards
- Simplified interface
- Friendly, encouraging tone
- Consistent structure with flexibility
- Focus on building habits through small wins

## 📦 Project Structure

```
focus-zone/
├── src/
│   ├── app/              # Next.js pages and API routes
│   │   ├── api/          # Backend API endpoints
│   │   │   ├── auth/     # Authentication endpoints
│   │   │   └── data/     # Data sync endpoints
│   │   ├── calendar/     # Calendar page
│   │   └── page.tsx      # Home page
│   ├── components/       # React components
│   ├── contexts/         # React contexts (Auth, Theme)
│   ├── lib/              # Database and auth utilities
│   └── utils/            # Helper functions
├── public/               # Static assets
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose setup
├── deploy.sh             # Deployment script (Linux/Mac)
└── deploy.bat            # Deployment script (Windows)
```

## 🔒 Security

- Passwords hashed with bcrypt
- JWT-based authentication
- Prepared SQL statements (SQL injection protection)
- Environment-based secrets
- Automatic secure token generation

## 🌐 Deployment Options

1. **Docker Deployment** (Recommended) - Use provided scripts
2. **Vercel** - One-click deployment
3. **Railway** - Git-based deployment
4. **Self-hosted** - VPS with PM2 or systemd

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 📝 License

MIT License - feel free to use this for your own projects!

## 🤝 Contributing

Built with ❤️ for the ADHD community. Contributions welcome!

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
