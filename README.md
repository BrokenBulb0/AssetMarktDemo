# WindSand Asset Market

A modern, full-stack 3D asset marketplace built with React, TypeScript, Express, and Three.js.

## Features

### Core Functionality
- 🎨 **3D Asset Marketplace** - Browse and purchase premium game assets
- 🔍 **Advanced Search & Filtering** - Find assets by category, price, format, and keywords
- 🛒 **Shopping Cart** - Add items to cart with session persistence
- 👤 **User Authentication** - Secure login and registration system
- 📱 **Responsive Design** - Optimized for desktop, tablet, and mobile
- 🌙 **Dark Mode** - Beautiful dark-first design with light mode support

### Technical Features
- ⚡ **Code Splitting** - Lazy-loaded routes for optimal performance
- 🎭 **Three.js Integration** - Real-time 3D previews for assets
- 🔒 **Security** - Helmet, CORS, rate limiting, and session management
- 📊 **Pagination** - Efficient data loading with pagination support
- 🎯 **SEO Optimized** - Meta tags and Open Graph support
- 🚀 **Performance** - Optimized Three.js scenes and image loading
- 💾 **Database Ready** - PostgreSQL support with Drizzle ORM
- 🔄 **Error Handling** - Error boundaries and graceful fallbacks

## Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **Three.js** - 3D graphics
- **TanStack Query** - Data fetching
- **Wouter** - Routing

### Backend
- **Express** - Web framework
- **TypeScript** - Type safety
- **Drizzle ORM** - Database ORM
- **Passport.js** - Authentication
- **PostgreSQL** - Database (optional, falls back to in-memory)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL (optional, for production)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd WindMarket
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL=postgresql://user:password@localhost:5432/windsand_market
   SESSION_SECRET=your-secret-key-change-in-production
   ```

4. **Database Setup (Optional)**
   
   If using PostgreSQL:
   ```bash
   # Generate migrations
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed initial data
   npm run db:seed
   ```
   
   If not using PostgreSQL, the app will use in-memory storage.

5. **Start development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5000`

## Project Structure

```
WindMarket/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (Auth, etc.)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and helpers
│   │   ├── pages/         # Page components
│   │   └── App.tsx        # Main app component
│   └── index.html         # HTML entry point
├── server/                # Backend Express application
│   ├── auth.ts           # Authentication logic
│   ├── db.ts             # Database connection
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── seed.ts           # Database seeding
│   ├── storage.ts        # Data access layer
│   └── vite.ts           # Vite integration
├── shared/               # Shared types and schemas
│   └── schema.ts         # Drizzle schema definitions
└── attached_assets/      # Static assets
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Assets
- `GET /api/assets` - List assets (with pagination, search, filters)
- `GET /api/assets/:id` - Get single asset

### Categories
- `GET /api/categories` - List all categories
- `GET /api/categories/:id/subcategories` - Get subcategories

### Cart
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add item to cart
- `DELETE /api/cart/:assetId` - Remove item from cart

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type check with TypeScript
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed database with initial data

### Code Quality

The project uses:
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting (recommended)

## Performance Optimizations

1. **Code Splitting** - Routes are lazy-loaded
2. **Three.js Optimization** - Scenes are properly disposed and throttled
3. **Image Optimization** - Lazy loading and optimized URLs
4. **API Pagination** - Efficient data loading
5. **Caching** - React Query caching strategy
6. **Bundle Optimization** - Vite's optimized builds

## Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting on API endpoints
- Session management with secure cookies
- Password hashing with scrypt
- Input validation with Zod

## Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=your-production-database-url
SESSION_SECRET=strong-random-secret
FRONTEND_URL=https://your-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Build and Deploy

```bash
# Build the application
npm run build

# Start production server
npm run start
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Design inspired by Sketchfab, Unity Asset Store, and Linear
- Icons from Lucide React
- UI components from Radix UI
- 3D rendering powered by Three.js
