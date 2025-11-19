# greatForce

A modern, next-generation CRM that actually doesn't suck. Built with the latest web technologies for a smooth, intuitive experience.

## Features

### 📊 Dashboard
- Real-time statistics overview
- Recent contacts and deals
- Upcoming activities with overdue tracking
- Quick access to all modules

### 👥 Contacts
- Beautiful card-based grid layout
- Quick add/edit with modal forms
- Search and filter functionality
- Company associations
- Tags and notes support
- Avatar initials

### 🏢 Companies
- Company profiles with industry and size
- Contact and deal tracking
- Website links
- Search functionality

### 💰 Deals Pipeline
- Visual Kanban board with 6 stages
- Drag-and-drop to move deals between stages
- Deal value tracking with probability
- Expected close dates
- Contact and company associations

### ✅ Activities
- Task management with multiple types
- Due date tracking with overdue alerts
- Complete/incomplete toggle
- Filter by All, Upcoming, or Overdue
- Associate with contacts and deals

## Tech Stack

- **Next.js 15** - App Router with server components
- **TypeScript** - Full type safety
- **Prisma** - Type-safe database ORM
- **tRPC** - End-to-end typesafe APIs
- **SQLite** - Local database (can easily switch to PostgreSQL)
- **shadcn/ui** - Beautiful, accessible component library
- **Tailwind CSS v4** - Modern utility-first styling
- **@dnd-kit** - Smooth drag-and-drop
- **Lucide React** - Modern icon set

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Set up the database:
\`\`\`bash
npm run db:push
\`\`\`

3. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000)

## Database

The project uses SQLite by default. To switch to PostgreSQL:

1. Update `prisma/schema.prisma`:
\`\`\`prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
\`\`\`

2. Update your `.env` file with PostgreSQL connection string

3. Run migrations:
\`\`\`bash
npm run db:push
\`\`\`

## Project Structure

src/
├── app/                    # Next.js app directory
│   ├── activities/        # Activities page
│   ├── companies/         # Companies page
│   ├── contacts/          # Contacts page
│   ├── deals/             # Deals pipeline page
│   └── page.tsx           # Dashboard
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── app-layout.tsx    # Main layout wrapper
│   └── sidebar.tsx       # Navigation sidebar
├── server/               # Backend
│   └── api/
│       ├── routers/      # tRPC routers
│       └── trpc.ts       # tRPC setup
└── styles/               # Global styles


## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run typecheck` - Run TypeScript checks
- `npm run db:push` - Push database schema
- `npm run db:studio` - Open Prisma Studio
- `npm run test:e2e` - Run E2E tests with Playwright
- `npm run test:e2e:ui` - Run E2E tests in UI mode
- `npm run test:e2e:debug` - Run E2E tests in debug mode

## Testing

The application includes comprehensive E2E tests using Playwright covering:
- Dashboard functionality and navigation
- Contacts CRUD operations and search
- Companies management
- Deals pipeline with drag-and-drop
- Activities/Tasks management
- All navigation flows

Run tests with `npm run test:e2e`. See [E2E_TESTING_SUMMARY.md](./E2E_TESTING_SUMMARY.md) for details.

## Why greatForce?

Unlike Salesforce and other legacy CRMs:
- ⚡️ Fast and responsive
- 🎨 Modern, clean UI
- 🖱️ Intuitive drag-and-drop
- 🔍 Built-in search
- 📱 Mobile-friendly
- 🎯 Simple and practical
- 💰 Free and open source

## License

MIT
