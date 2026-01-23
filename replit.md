# WindSand Asset Market

## Overview

WindSand Asset Market is a premium 3D asset marketplace platform designed for game developers and digital artists. The platform specializes in showcasing and selling game assets compatible with Unity and similar game engines. It features real-time 3D model previews using Three.js, a dark-first design optimized for asset visualization, and a streamlined shopping experience. The application draws design inspiration from Sketchfab, Unity Asset Store, Unreal Marketplace, and Linear's refined UI patterns.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Major Updates (October 2025)

- **3D Asset Previews**: All asset cards now display live ThreeScene 3D previews instead of static thumbnails, providing an immersive browsing experience
- **Hero Section**: Optimized layout with reduced spacing for better viewport fit, parallax effects, and functional "Discover" scroll button
- **Browse Page Redesign**: Modern glassmorphic sidebar with color-coded category filters, parallax header effects, enhanced search with gradient glow, and staggered card animations
- **Loading States**: Unified Loading component across all pages for consistent user experience
- **404 Page**: Polished error page with WindSand branding and ThreeScene background
- **Mobile Optimization**: Improved Header responsiveness with hidden search on mobile devices
- **WindSand Branding**: Custom logo implemented throughout the application and as favicon

## System Architecture

### Frontend Architecture

**Technology Stack**: React with TypeScript, using Vite as the build tool and development server. The application follows a single-page application (SPA) pattern with client-side routing via Wouter.

**Component Library**: Radix UI primitives with shadcn/ui components styled using Tailwind CSS. The design system implements a dark-first color palette with custom CSS variables for theming, featuring WindSand purple (HSL 280 85% 62%) as the primary brand color.

**State Management**: TanStack Query (React Query) for server state management, with optimistic updates and automatic cache invalidation. Local component state handled with React hooks.

**3D Rendering**: Three.js integrated for interactive 3D model previews. Custom React components wrap Three.js functionality:
- `ThreeScene` - General purpose 3D renderer with multiple animation types (cube, sphere, torus)
- `ThreeSceneHero` - Hero section background with particle effects and animation
- `ThreeSceneBackground` - Decorative background for various pages (browse, cart variants)
- `AssetViewer` - Interactive 3D asset viewer with camera controls
- `FullScreenViewer` - Modal full-screen 3D viewer

**Key Components**:
- `Header` - Sticky navigation with WindSand logo, search (hidden on mobile), cart counter, and route indicators
- `Hero` - Interactive hero section with parallax effects, 3D background, search functionality, and clickable "Discover" scroll button
- `AssetCard` - Asset display with live ThreeScene 3D preview, hover tilt effects, price, category badge, and add-to-cart functionality
- `CategoryGrid` - Dynamic category display with icons and descriptions, fetches from API
- `Loading` - Reusable loading spinner component with size variants and full-screen mode

**Routing Strategy**: File-based page organization under `client/src/pages/` with Wouter handling navigation:
- `/` - Home page with Hero, CategoryGrid, and featured assets
- `/browse` - Browse page with filters, search, and category navigation
- `/browse?categoryId=X` - Filtered browse by category
- `/browse?subcategoryId=Y` - Filtered browse by subcategory
- `/asset/:id` - Asset detail page with 3D viewer and specifications
- `/cart` - Shopping cart with order summary
- `*` - 404 page with WindSand branding

**Design System**: Custom Tailwind configuration with extended color palette, custom border radii, and utility classes for elevation effects (hover-elevate, active-elevate-2). Typography uses Inter font family throughout. Dark-first design with ThemeProvider supporting light/dark modes.

**Visual Effects**:
- Parallax scrolling on Browse page header
- Hover tilt effects on asset cards using requestAnimationFrame throttling
- Staggered fade-in animations for asset grids
- Gradient glow effects on search inputs
- 3D transform effects on Hero content

### Backend Architecture

**Framework**: Express.js server with TypeScript, using ES modules. The server handles API routes and serves the Vite-built frontend in production.

**API Design**: RESTful endpoints under `/api` prefix:
- `GET /api/assets` - Asset listing with optional `categoryId`, `subcategoryId`, and `featured` query parameters
- `GET /api/assets/:id` - Individual asset details with populated category relation
- `GET /api/categories` - All categories
- `GET /api/categories/:id/subcategories` - Subcategories for a specific category
- `GET /api/cart` - Current cart items for session
- `POST /api/cart` - Add item to cart (body: `{ assetId, quantity }`)
- `DELETE /api/cart/:assetId` - Remove item from cart

**Data Layer**: In-memory storage implementation (MemStorage class) for MVP phase, designed with interface abstraction (IStorage) to allow future database integration. The schema is defined using Drizzle ORM with PostgreSQL dialect configuration.

**Session Management**: Express sessions with MemoryStore for session-based cart tracking (sessionId used as cart identifier).

**Development Setup**: Vite middleware mode integration for HMR during development, with custom logging and error handling middleware.

### Data Storage Solutions

**Current Implementation**: In-memory storage using JavaScript Maps for users, assets, cart items, categories, and subcategories. Mock data includes realistic game assets across Visual, Audio, Animation, Functional, and VFX categories.

**Planned Database**: PostgreSQL with Drizzle ORM configured. Schema defines main tables:
- `categories` - Main asset categories (Visual, Audio, Animation, Functional, VFX)
- `subcategories` - Nested subcategories within each category
- `assets` - Asset catalog with metadata (title, description, price, category, tags, file info, polycount, model URLs)
- `cart_items` - Persistent cart storage with session tracking
- `users` - User table structure defined but not yet implemented

**ORM Configuration**: Drizzle Kit configured with migrations output to `./migrations` directory. Schema uses varchar primary keys with UUID generation via PostgreSQL's `gen_random_uuid()` function.

**Data Validation**: Zod schemas derived from Drizzle tables using `createInsertSchema` for runtime validation of API inputs. Custom types like `AssetWithCategory` and `CartItemWithAsset` for populated relations.

### Authentication and Authorization

**Current State**: No authentication implemented in MVP. User schema exists but unused.

**Design Considerations**: User table schema prepared for future implementation with seller identification support (sellerId field on assets table).

### External Dependencies

**UI Components**: 
- Radix UI headless components (@radix-ui/react-*)
- shadcn/ui component system configured with "new-york" style
- Lucide React for icons

**3D Rendering**:
- Three.js for WebGL-based 3D rendering
- Custom GLTF/GLB model support with orbit controls

**Styling**:
- Tailwind CSS with PostCSS processing
- class-variance-authority for component variant management
- clsx and tailwind-merge for conditional class composition
- Custom Tailwind utilities: hover-elevate, active-elevate-2

**Forms & Validation**:
- React Hook Form with Zod resolvers
- Drizzle-Zod for schema-based validation

**Database (Configured)**:
- @neondatabase/serverless for PostgreSQL connectivity
- Drizzle ORM for type-safe database queries
- connect-pg-simple for session store (configured but not active)

**Development Tools**:
- Replit-specific Vite plugins (cartographer, dev-banner, runtime-error-modal)
- TSX for TypeScript execution in Node.js

**Date Handling**: date-fns library for date formatting and manipulation

**API Client**: TanStack Query with custom fetch wrapper (`apiRequest`) that handles JSON serialization and error responses

**Asset Sources**: Unsplash URLs used for thumbnail placeholders in mock data

## Performance Optimizations

- **WebGL Context Management**: ThreeScene components are rendered for all asset cards to provide immersive 3D preview experience
- **Parallax Throttling**: Mouse movement handlers throttled using requestAnimationFrame to maintain 60fps
- **Memoized Particles**: Hero particle positions calculated once using useMemo to avoid re-renders
- **Lazy Loading**: Component-level code splitting with React.lazy for routes
- **Query Caching**: TanStack Query caching with automatic invalidation on mutations

## Known Limitations

- No user authentication system (planned for future)
- In-memory storage (data resets on server restart)
- Mock 3D models (placeholder URLs until real assets are uploaded)
- No payment processing integration (cart is demonstration only)
- Search functionality basic (client-side filtering only)

## Future Enhancements

- User authentication and seller accounts
- Database persistence with Drizzle migrations
- Real 3D model uploads and storage
- Payment processing integration
- Advanced search with Elasticsearch
- User reviews and ratings system
- Asset licensing and download management
- Seller dashboard and analytics
