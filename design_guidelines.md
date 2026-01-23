# WindSand Asset Market - Design Guidelines

## Design Approach

**Reference-Based Strategy**: Drawing inspiration from **Sketchfab, Unity Asset Store, and Unreal Marketplace** for 3D asset presentation, combined with **Linear's** refined typography and clean UI patterns. This creates a professional, tech-forward marketplace optimized for 3D content discovery.

**Core Principle**: Dark-first design that showcases 3D assets without distraction, balanced with vibrant brand accents for navigation and CTAs.

---

## Color Palette

### Dark Mode (Primary Interface)
- **Background**: 220 15% 8% (deep charcoal)
- **Surface**: 220 12% 12% (elevated panels)
- **Surface Elevated**: 220 10% 16% (cards, modals)
- **Border**: 220 8% 22% (subtle separation)

### Brand Colors
- **Primary (WindSand Purple)**: 280 85% 62% (vibrant magenta-purple for CTAs, links)
- **Primary Hover**: 280 85% 72% (lighter on interaction)
- **Secondary**: 195 85% 58% (cyan accent for info, secondary actions)

### Text
- **Primary Text**: 220 8% 95% (high contrast)
- **Secondary Text**: 220 6% 70% (metadata, descriptions)
- **Muted Text**: 220 5% 50% (labels, hints)

### Semantic
- **Success**: 142 71% 45% (purchase confirmation)
- **Warning**: 38 92% 50% (cart reminders)
- **Error**: 0 84% 60% (form validation)

---

## Typography

**Font Families**: 
- **Headings**: 'Inter', system-ui (weight: 600-800)
- **Body**: 'Inter', system-ui (weight: 400-500)
- **UI Elements**: 'Inter', system-ui (weight: 500)

**Scale**:
- Hero Display: text-6xl/text-7xl (60-72px), font-bold, tracking-tight
- Page Titles: text-4xl/text-5xl (36-48px), font-semibold
- Section Headers: text-2xl/text-3xl (24-30px), font-semibold
- Card Titles: text-lg (18px), font-medium
- Body: text-base (16px), font-normal
- Metadata: text-sm (14px), text-secondary
- Labels: text-xs (12px), uppercase, tracking-wider

---

## Layout System

**Spacing Primitives**: Use Tailwind units **2, 4, 6, 8, 12, 16, 20** for consistent rhythm
- Component padding: p-6 to p-8
- Section spacing: py-16 to py-24
- Card gaps: gap-6 to gap-8
- Micro-spacing: space-y-2 to space-y-4

**Grid Systems**:
- Asset Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
- Feature Sections: grid-cols-1 lg:grid-cols-2
- Container: max-w-7xl mx-auto px-6

---

## Component Library

### Navigation
- **Header**: Sticky dark header (bg-surface) with WindSand logo, category dropdowns, search bar, cart icon with badge, user menu
- **Height**: h-16, backdrop-blur for transparency over 3D scenes
- **Cart Badge**: Absolute positioned circle with count, primary brand color

### Asset Cards
- **Container**: Dark surface card with rounded-xl, border-subtle, hover:border-primary transition
- **3D Thumbnail**: Embedded Three.js canvas (aspect-video) with subtle glow effect on hover
- **Content**: Asset title (font-medium), creator name (text-secondary, text-sm), price (text-lg, brand color), category badge
- **Interaction**: Scale transform on hover (hover:scale-[1.02]), subtle shadow lift

### 3D Viewer (Asset Detail)
- **Layout**: Sidebar layout - 2/3 viewer, 1/3 details on desktop; stacked on mobile
- **Viewer Panel**: Full-height Three.js canvas with floating control UI (orbit controls, wireframe toggle, lighting presets)
- **Controls**: Semi-transparent dark panels with blur, positioned bottom-left
- **Details Panel**: Sticky sidebar with title, description, specs table, pricing, CTA buttons

### Shopping Cart
- **Cart Items**: List layout with 3D thumbnail (square, smaller), title, quantity selector, price, remove button
- **Summary**: Sticky bottom card on mobile, right column on desktop with subtotal, fees, total, checkout button
- **Empty State**: Centered illustration with "Browse Assets" CTA

### Forms (Upload/Checkout)
- **Input Fields**: Dark backgrounds (surface-elevated), border-subtle, focus:border-primary, rounded-lg
- **File Upload**: Drag-drop zone with dashed border, hover state, upload progress bar
- **Buttons**: Primary (bg-primary, rounded-lg, px-6, py-3), Secondary (variant-outline with blur on images)

### Browse/Catalog Page
- **Filters**: Left sidebar (1/4 width) with collapsible category sections, price range slider, tag checkboxes
- **View Toggle**: Grid/List view switcher in toolbar
- **Toolbar**: Flex row with sort dropdown, view toggle, result count
- **Pagination**: Number buttons with prev/next, primary color for active page

---

## Page Layouts

### Homepage
1. **Hero Section**: Full viewport (h-screen) with animated Three.js WindSand logo + particle system, heading "Discover Premium Game Assets", search bar, CTA "Browse Marketplace"
2. **Featured Assets**: Grid of 6-8 hero asset cards with 3D previews
3. **Categories**: Icon grid (6 categories) with hover effects
4. **Stats Section**: 4-column metric display (Assets, Creators, Downloads, Revenue) with animated counters
5. **Creator Spotlight**: 2-column layout with creator profile + featured work
6. **CTA Footer**: Purple gradient background with "Start Selling" call-to-action

### Browse/Marketplace
- Full-width layout with filter sidebar (collapsible on mobile)
- Asset grid with infinite scroll or pagination
- Floating "Back to Top" button

### Asset Detail
- Immersive 3D viewer dominates the page
- Tabbed content below viewer: Description, Specs, Reviews, Related Assets
- Sticky "Add to Cart" button on mobile

---

## Images

**Hero Image**: No static hero image - use **animated Three.js scene** with WindSand 3D logo and particle effects for dynamic, tech-forward first impression

**Asset Thumbnails**: 3D WebGL previews rendered in real-time within cards (fallback to static renders)

**Creator Avatars**: Circular profile images (w-12 h-12 for cards, w-20 h-20 for profiles)

**Category Icons**: Use **Heroicons** via CDN for category representations (cube, sparkles, building, etc.)

---

## Interactions & Motion

**Transitions**: Use Tailwind transitions (transition-all duration-200) sparingly
- Card hover states
- Button interactions
- Filter panel expand/collapse

**3D Viewer Animations**: Smooth camera movements, auto-rotate on idle (user can disable)

**Loading States**: Skeleton screens for asset grids, spinner for 3D model loading

**Micro-interactions**: 
- Cart badge bounce on add
- Success checkmark animation on purchase
- Smooth scroll to sections

---

## Accessibility

- High contrast text on dark backgrounds (WCAG AA minimum)
- Focus visible states for keyboard navigation (ring-2 ring-primary)
- ARIA labels for 3D viewer controls
- Alt text for all thumbnails/images
- Consistent dark mode across all form inputs

---

**Design Philosophy**: Clean, distraction-free interface that lets 3D assets shine, with thoughtful purple/magenta accents guiding user actions. Professional marketplace aesthetics meeting gaming industry expectations.