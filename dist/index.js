var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";

// server/db.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  assets: () => assets,
  cartItemSchema: () => cartItemSchema,
  cartItemWithAssetSchema: () => cartItemWithAssetSchema,
  cartItems: () => cartItems,
  categories: () => categories,
  insertAssetSchema: () => insertAssetSchema,
  insertCategorySchema: () => insertCategorySchema,
  insertSubcategorySchema: () => insertSubcategorySchema,
  insertUserSchema: () => insertUserSchema,
  subcategories: () => subcategories,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  icon: text("icon"),
  slug: text("slug").notNull().unique()
});
var insertCategorySchema = createInsertSchema(categories).omit({
  id: true
});
var subcategories = pgTable("subcategories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  slug: text("slug").notNull()
});
var insertSubcategorySchema = createInsertSchema(subcategories).omit({
  id: true
});
var assets = pgTable("assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  categoryId: varchar("category_id").notNull(),
  subcategoryId: varchar("subcategory_id"),
  tags: text("tags").array().notNull().default(sql`ARRAY[]::text[]`),
  modelUrl: text("model_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  polyCount: integer("poly_count"),
  textureResolution: text("texture_resolution"),
  fileFormat: text("file_format").notNull().default("GLTF/GLB"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  sellerId: varchar("seller_id"),
  featured: boolean("featured").notNull().default(false)
});
var insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
  createdAt: true,
  featured: true
});
var cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull(),
  assetId: varchar("asset_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var cartItemSchema = z.object({
  assetId: z.string(),
  quantity: z.number().int().positive().default(1)
});
var cartItemWithAssetSchema = cartItemSchema.extend({
  asset: z.object({
    id: z.string(),
    title: z.string(),
    price: z.string(),
    thumbnailUrl: z.string().nullable(),
    categoryId: z.string(),
    subcategoryId: z.string().nullable()
  })
});
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});

// server/db.ts
var databaseUrl = process.env.DATABASE_URL;
var db = null;
function getDb() {
  if (!databaseUrl) {
    console.warn("DATABASE_URL not set, using in-memory storage");
    return null;
  }
  if (!db) {
    const sql2 = neon(databaseUrl);
    db = drizzle(sql2, { schema: schema_exports });
  }
  return db;
}

// server/storage.ts
import { eq, desc } from "drizzle-orm";
var MemStorage = class {
  users;
  categories;
  subcategories;
  assets;
  carts;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.categories = /* @__PURE__ */ new Map();
    this.subcategories = /* @__PURE__ */ new Map();
    this.assets = /* @__PURE__ */ new Map();
    this.carts = /* @__PURE__ */ new Map();
    this.initializeMockCategories();
    this.initializeMockSubcategories();
    this.initializeMockAssets();
  }
  // Initialize with mock category data
  initializeMockCategories() {
    const mockCategories = [
      {
        id: "cat-visual",
        name: "Visual",
        description: "2D and 3D visual assets including sprites, textures, models, and environments",
        icon: "Image",
        slug: "visual"
      },
      {
        id: "cat-audio",
        name: "Audio",
        description: "Music, sound effects, and voice-overs for immersive gaming experiences",
        icon: "Music",
        slug: "audio"
      },
      {
        id: "cat-animation",
        name: "Animation",
        description: "Character animations, environmental animations, and motion assets",
        icon: "Film",
        slug: "animation"
      },
      {
        id: "cat-functional",
        name: "Functional",
        description: "Code, scripts, shaders, and development tools",
        icon: "Code",
        slug: "functional"
      },
      {
        id: "cat-vfx",
        name: "VFX",
        description: "Visual effects including particle systems, shaders, and post-processing effects",
        icon: "Sparkles",
        slug: "vfx"
      }
    ];
    mockCategories.forEach((category) => {
      this.categories.set(category.id, category);
    });
  }
  // Initialize with mock subcategory data
  initializeMockSubcategories() {
    const mockSubcategories = [
      // Visual subcategories
      { id: "sub-3d-models", categoryId: "cat-visual", name: "3D Models", description: "Characters, props, and objects", slug: "3d-models" },
      { id: "sub-environments", categoryId: "cat-visual", name: "Environments", description: "Complete scenes and landscapes", slug: "environments" },
      { id: "sub-2d-sprites", categoryId: "cat-visual", name: "2D Sprites", description: "2D art and sprite sheets", slug: "2d-sprites" },
      { id: "sub-textures", categoryId: "cat-visual", name: "Textures & Materials", description: "PBR textures and materials", slug: "textures" },
      { id: "sub-ui-graphics", categoryId: "cat-visual", name: "UI Graphics", description: "User interface elements and icons", slug: "ui-graphics" },
      // Audio subcategories
      { id: "sub-music", categoryId: "cat-audio", name: "Music", description: "Background music and soundtracks", slug: "music" },
      { id: "sub-sfx", categoryId: "cat-audio", name: "Sound Effects", description: "Game sound effects and ambience", slug: "sfx" },
      { id: "sub-voice", categoryId: "cat-audio", name: "Voice-Overs", description: "Character voices and narration", slug: "voice" },
      // Animation subcategories
      { id: "sub-char-anim", categoryId: "cat-animation", name: "Character Animations", description: "Humanoid and creature animations", slug: "character-animations" },
      { id: "sub-env-anim", categoryId: "cat-animation", name: "Environmental", description: "Props and environment animations", slug: "environmental" },
      { id: "sub-ui-anim", categoryId: "cat-animation", name: "UI Animations", description: "Interface transitions and effects", slug: "ui-animations" },
      // Functional subcategories
      { id: "sub-scripts", categoryId: "cat-functional", name: "Scripts & Tools", description: "Gameplay scripts and utilities", slug: "scripts" },
      { id: "sub-shaders", categoryId: "cat-functional", name: "Shaders", description: "Custom shader code", slug: "shaders" },
      { id: "sub-systems", categoryId: "cat-functional", name: "Game Systems", description: "Complete gameplay systems", slug: "systems" },
      // VFX subcategories
      { id: "sub-particles", categoryId: "cat-vfx", name: "Particle Systems", description: "Particle effects and emitters", slug: "particles" },
      { id: "sub-post-fx", categoryId: "cat-vfx", name: "Post-Processing", description: "Screen effects and filters", slug: "post-processing" },
      { id: "sub-magic-fx", categoryId: "cat-vfx", name: "Magic & Fantasy FX", description: "Spell effects and magical visuals", slug: "magic-fx" }
    ];
    mockSubcategories.forEach((subcategory) => {
      this.subcategories.set(subcategory.id, subcategory);
    });
  }
  // Initialize with mock asset data
  initializeMockAssets() {
    const mockAssets = [
      {
        id: "1",
        title: "Sci-Fi Character - Cyber Soldier",
        description: "Premium sci-fi character model featuring a fully armored cyber soldier with cutting-edge design. This AAA-quality asset includes complete PBR textures with metallic and roughness maps, a fully rigged skeleton compatible with standard humanoid rigs, and multiple LOD levels for optimal performance. The character comes with 4 material variations (standard, elite, stealth, and damaged) and includes separated armor pieces for customization. Perfect for first-person shooters, RPGs, strategy games, and VR experiences. The model features detailed normal maps, ambient occlusion, and emissive maps for glowing elements. Bone structure follows industry standards, making it compatible with most animation libraries. Package includes FBX, GLTF, and OBJ formats.",
        price: "49.99",
        categoryId: "cat-visual",
        subcategoryId: "sub-3d-models",
        tags: ["sci-fi", "character", "rigged", "PBR", "soldier", "futuristic", "armor", "AAA"],
        modelUrl: "/models/cyber-soldier.gltf",
        thumbnailUrl: "https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=800&h=600&fit=crop",
        polyCount: 45e3,
        textureResolution: "4K (4096x4096)",
        fileFormat: "GLTF/GLB",
        createdAt: /* @__PURE__ */ new Date("2024-01-15"),
        sellerId: "creator-001",
        featured: true
      },
      {
        id: "2",
        title: "Medieval Fantasy Castle",
        description: "Expansive medieval castle environment featuring a complete modular construction system with over 150 individual pieces. This comprehensive pack includes towering stone walls with battlements, corner towers, gate houses, inner keep, courtyard elements, and decorative architectural details. Each module snaps together seamlessly for easy level design. The pack features hand-painted textures with a stylized aesthetic, optimized UV layouts, and baked ambient occlusion for enhanced depth. Includes both intact and damaged versions of major pieces for dynamic storytelling. All assets are optimized for real-time rendering with proper LODs and collision meshes. Perfect for fantasy RPGs, strategy games, and open-world adventures. The lighting is prebaked but includes separate maps for custom lighting scenarios. Additional props include banners, torches, wooden doors, and defensive structures like barricades and ballistae.",
        price: "79.99",
        categoryId: "cat-visual",
        subcategoryId: "sub-environments",
        tags: ["medieval", "castle", "environment", "modular", "fantasy", "fortress", "architecture"],
        modelUrl: "/models/castle.gltf",
        thumbnailUrl: "https://images.unsplash.com/photo-1560840790-593b28c0b7e2?w=800&h=600&fit=crop",
        polyCount: 125e3,
        textureResolution: "2K (2048x2048)",
        fileFormat: "GLTF/GLB",
        createdAt: /* @__PURE__ */ new Date("2024-01-20"),
        sellerId: "creator-002",
        featured: true
      },
      {
        id: "3",
        title: "Animated Magic Spell Effects",
        description: "Professional VFX collection featuring 20 unique animated particle systems for magical abilities and combat effects. Includes fire spells (fireballs, flame walls, meteor showers), ice magic (frost nova, ice shards, blizzard), lightning effects (chain lightning, thunder strikes, electric fields), healing auras, shield barriers, teleportation effects, and explosive impacts. Each effect is fully customizable with exposed parameters for color tinting, intensity, duration, and scale. Built with modern particle systems and shader effects for stunning visuals while maintaining excellent performance on mobile and VR platforms. All effects include sprite sheets, texture atlases, and alpha masks. Compatible with Unity particle system, Unreal Niagara, and standalone implementations. Includes 4 quality presets (Low, Medium, High, Ultra) for different target platforms. Perfect for RPGs, MOBAs, action games, and fantasy adventures.",
        price: "34.99",
        categoryId: "cat-vfx",
        subcategoryId: "sub-magic-fx",
        tags: ["magic", "particles", "VFX", "animated", "fantasy", "spells", "combat", "shaders"],
        modelUrl: "/models/magic-effects.gltf",
        thumbnailUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop",
        polyCount: 5e3,
        textureResolution: "1K (1024x1024)",
        fileFormat: "GLTF/GLB",
        createdAt: /* @__PURE__ */ new Date("2024-02-01"),
        sellerId: "creator-003",
        featured: false
      },
      {
        id: "4",
        title: "Low Poly Furniture Pack",
        description: "Comprehensive collection of 50+ hand-crafted low poly furniture assets designed for stylized and mobile games. This pack includes complete room furnishing options: 8 chair variations (dining, office, lounge), 6 table types (coffee, dining, work desk), 4 bed styles (single, double, bunk), multiple storage solutions (wardrobes, dressers, shelves, cabinets), and decorative pieces (lamps, plants, books, picture frames). Each model features clean topology, optimized UVs, and a cohesive art style with vibrant, hand-painted textures. Perfect for simulation games, casual mobile titles, and indie projects. All models use a consistent color palette and scale, making scene composition effortless. Includes modular pieces that can be mixed and matched for endless variations. Package contains both individual models and pre-assembled room setups. Extremely mobile-friendly with average 100-200 polygons per item.",
        price: "29.99",
        categoryId: "cat-visual",
        subcategoryId: "sub-3d-models",
        tags: ["low-poly", "furniture", "stylized", "props", "indoor", "mobile", "casual"],
        modelUrl: "/models/furniture.gltf",
        thumbnailUrl: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&h=600&fit=crop",
        polyCount: 8e3,
        textureResolution: "512px (512x512)",
        fileFormat: "GLTF/GLB",
        createdAt: /* @__PURE__ */ new Date("2024-02-10"),
        sellerId: "creator-004",
        featured: false
      },
      {
        id: "5",
        title: "RPG UI Kit - Fantasy Theme",
        description: "Production-ready UI system featuring 100+ high-resolution elements designed specifically for fantasy RPG games. Includes animated health and mana bars with multiple fill styles, detailed inventory system with drag-and-drop slots, skill trees with unlock animations, character equipment panels, quest logs, dialogue boxes, minimap frames, and buff/debuff indicators. The pack contains 50+ beautifully illustrated icons for items, abilities, and stats, all in consistent art style. Features 3 complete color schemes (Golden Royal, Dark Steel, Mystic Purple) with layer-separated PSD source files for easy customization. All elements are vector-based and exported at 4K resolution for crystal-clear display on any screen. Includes button states (normal, hover, pressed, disabled), animated transitions, and particle effects for interactions. Perfect for desktop, mobile, and console RPGs. Compatible with Unity UI, Unreal UMG, and HTML5.",
        price: "24.99",
        categoryId: "cat-visual",
        subcategoryId: "sub-ui-graphics",
        tags: ["UI", "RPG", "fantasy", "interface", "HUD", "menu", "icons"],
        modelUrl: "/models/ui-kit.gltf",
        thumbnailUrl: "https://images.unsplash.com/photo-1551927336-575d71d6f085?w=800&h=600&fit=crop",
        polyCount: 1e3,
        textureResolution: "2K (2048x2048)",
        fileFormat: "GLTF/GLB",
        createdAt: /* @__PURE__ */ new Date("2024-02-15"),
        sellerId: "creator-005",
        featured: true
      },
      {
        id: "6",
        title: "Humanoid Animation Set",
        description: "Professional motion capture library containing 60 meticulously cleaned and polished animations for humanoid characters. This comprehensive set includes: Locomotion (walk forward/backward/strafe, sprint, crouch walk, combat ready walk), Jumps and Mantling (standing jump, running jump, ledge climb, vault), Combat Moves (sword attacks, rifle aim, pistol draw, melee combos, block, dodge roll), Idle Variations (casual stand, combat ready, wounded, exhausted), and Social Emotes (wave, point, celebrate, taunt, sit, kneel). All animations feature smooth transitions, natural movement arcs, and professional timing. Captured at 60fps with full body tracking and finger animations included. Compatible with standard humanoid rigs (Mixamo, UE4/5 Mannequin, Unity Mecanim). Each animation includes root motion and in-place variants. Perfect for action games, RPGs, and multiplayer titles. Files include FBX with embedded animation and separate animation clips.",
        price: "59.99",
        categoryId: "cat-animation",
        subcategoryId: "sub-char-anim",
        tags: ["animation", "mocap", "humanoid", "rigged", "FBX", "combat", "locomotion"],
        modelUrl: "/models/animations.gltf",
        thumbnailUrl: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&h=600&fit=crop",
        polyCount: 0,
        textureResolution: "N/A",
        fileFormat: "FBX",
        createdAt: /* @__PURE__ */ new Date("2024-03-01"),
        sellerId: "creator-006",
        featured: false
      },
      {
        id: "7",
        title: "Cyberpunk Neon City Block",
        description: "Stunning futuristic metropolis environment featuring a complete city block in authentic cyberpunk aesthetic. This massive scene includes towering megastructures with holographic billboards, animated neon signs in multiple languages, bustling street-level shops with volumetric fog, flying vehicle landing pads, and intricate alleyway details. The environment features fully modeled interiors visible through windows, animated holographic displays with customizable content, rain-slicked streets with puddle reflections, and atmospheric particle effects (rain, steam, sparks). Includes 3 complete lighting scenarios: vibrant neon night (primary), rainy night with enhanced reflections, and dystopian day. All neon signs use emissive materials with customizable colors and flicker effects. The pack contains modular building pieces, street props (vending machines, trash, bikes, drones), and background skyline elements. Optimized with proper LODs and occlusion culling. Perfect for open-world exploration, racing games, and narrative experiences.",
        price: "89.99",
        categoryId: "cat-visual",
        subcategoryId: "sub-environments",
        tags: ["cyberpunk", "city", "neon", "sci-fi", "night", "urban", "futuristic"],
        modelUrl: "/models/city-block.gltf",
        thumbnailUrl: "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=800&h=600&fit=crop",
        polyCount: 18e4,
        textureResolution: "4K (4096x4096)",
        fileFormat: "GLTF/GLB",
        createdAt: /* @__PURE__ */ new Date("2024-03-10"),
        sellerId: "creator-002",
        featured: true
      },
      {
        id: "8",
        title: "Warrior Character Pack",
        description: "Epic fantasy warrior collection featuring 3 fully unique characters: a heavily armored knight, an agile dual-wielding rogue, and a tribal berserker. Each character includes both male and female variants with distinct facial features and body proportions. The pack contains extensive customization with 20+ interchangeable armor pieces per character, 15 weapon variations (swords, axes, hammers, daggers), and multiple material presets (battle-worn, pristine, magical). All characters are fully rigged with detailed facial blend shapes for expressions and lip-sync. The skeletons are compatible with standard humanoid animation retargeting. Textures include 4K albedo, normal, metallic, roughness, and ambient occlusion maps. Each character features multiple LOD levels and includes separate high-poly versions for cinematics. Perfect for RPGs, action games, and strategy titles. Accessories include capes, helms, shields, and scabbards with cloth simulation support.",
        price: "64.99",
        categoryId: "cat-visual",
        subcategoryId: "sub-3d-models",
        tags: ["warrior", "character", "rigged", "fantasy", "armor", "knight", "customizable"],
        modelUrl: "/models/warriors.gltf",
        thumbnailUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=600&fit=crop",
        polyCount: 52e3,
        textureResolution: "4K (4096x4096)",
        fileFormat: "GLTF/GLB",
        createdAt: /* @__PURE__ */ new Date("2024-03-15"),
        sellerId: "creator-007",
        featured: false
      },
      {
        id: "9",
        title: "Sci-Fi Weapon Collection",
        description: "Advanced arsenal of 15 futuristic weapons with AAA-quality details and animations. Collection includes: Assault Rifles (pulse rifle, plasma carbine), Sniper Weapons (rail gun, photon sniper), Heavy Weapons (rocket launcher, minigun), Sidearms (laser pistol, energy revolver), Melee (plasma sword, shock baton), and Throwables (EMP grenades, holo-mines). Each weapon features animated moving parts (slides, barrels, magazines, scopes), detailed reload sequences, and spectacular muzzle flash VFX. All weapons include emissive elements with customizable colors, shell ejection systems, and reactive recoil animations. Optimized with 3 LOD levels for excellent performance. Textures include PBR materials with wear and dirt variations. Perfect for FPS games, third-person shooters, and sci-fi titles. Includes separate attachment models (scopes, silencers, grips) for weapon customization systems.",
        price: "44.99",
        categoryId: "cat-visual",
        subcategoryId: "sub-3d-models",
        tags: ["weapons", "sci-fi", "guns", "animated", "props", "FPS", "arsenal"],
        modelUrl: "/models/weapons.gltf",
        thumbnailUrl: "https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=800&h=600&fit=crop",
        polyCount: 15e3,
        textureResolution: "2K (2048x2048)",
        fileFormat: "GLTF/GLB",
        createdAt: /* @__PURE__ */ new Date("2024-03-20"),
        sellerId: "creator-008",
        featured: false
      },
      {
        id: "10",
        title: "Elemental Particle System",
        description: "Master the elements with this comprehensive VFX library featuring 40+ particle effects across all four classical elements. FIRE effects include roaring flames, fire trails, ember clouds, explosion bursts, and lava flows. WATER effects feature cascading waterfalls, splash impacts, rain storms, mist clouds, and bubble streams. EARTH effects showcase dust clouds, rock debris, ground cracks, sandstorms, and crystal formations. AIR effects include wind gusts, tornadoes, air blasts, and floating particle streams. Each element comes with multiple intensity levels and stylistic variations (realistic, stylized, magical). All effects are built with modern GPU particle systems and include fully exposed parameters for color, size, speed, lifetime, and emission rates. Includes ready-to-use prefabs for Unity and Unreal Engine with optimized Blueprint/C# scripts for easy integration. Performance-optimized with 4 quality presets suitable for mobile to high-end PC. Perfect for RPGs, platformers, and action games featuring elemental magic or environmental hazards.",
        price: "39.99",
        categoryId: "cat-vfx",
        subcategoryId: "sub-particles",
        tags: ["particles", "elements", "VFX", "fire", "water", "earth", "air", "nature"],
        modelUrl: "/models/elements.gltf",
        thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop",
        polyCount: 3e3,
        textureResolution: "1K (1024x1024)",
        fileFormat: "GLTF/GLB",
        createdAt: /* @__PURE__ */ new Date("2024-03-25"),
        sellerId: "creator-003",
        featured: false
      }
    ];
    mockAssets.forEach((asset) => {
      this.assets.set(asset.id, asset);
    });
  }
  // User methods
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  // Category methods
  async getAllCategories() {
    return Array.from(this.categories.values());
  }
  async getCategoryById(id) {
    return this.categories.get(id);
  }
  async getCategoryBySlug(slug) {
    return Array.from(this.categories.values()).find((cat) => cat.slug === slug);
  }
  // Subcategory methods
  async getAllSubcategories() {
    return Array.from(this.subcategories.values());
  }
  async getSubcategoriesByCategoryId(categoryId) {
    return Array.from(this.subcategories.values()).filter((sub) => sub.categoryId === categoryId);
  }
  async getSubcategoryById(id) {
    return this.subcategories.get(id);
  }
  // Helper method to populate asset with category/subcategory
  async populateAsset(asset) {
    const category = await this.getCategoryById(asset.categoryId);
    const subcategory = asset.subcategoryId ? await this.getSubcategoryById(asset.subcategoryId) : void 0;
    return {
      ...asset,
      category,
      subcategory
    };
  }
  // Asset methods
  async getAllAssets() {
    const assets2 = Array.from(this.assets.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
    return Promise.all(assets2.map((asset) => this.populateAsset(asset)));
  }
  async getAssetById(id) {
    const asset = this.assets.get(id);
    if (!asset) return void 0;
    return this.populateAsset(asset);
  }
  async getAssetsByCategoryId(categoryId) {
    const assets2 = Array.from(this.assets.values()).filter((asset) => asset.categoryId === categoryId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return Promise.all(assets2.map((asset) => this.populateAsset(asset)));
  }
  async getAssetsBySubcategoryId(subcategoryId) {
    const assets2 = Array.from(this.assets.values()).filter((asset) => asset.subcategoryId === subcategoryId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return Promise.all(assets2.map((asset) => this.populateAsset(asset)));
  }
  // Cart methods
  async getCart(sessionId) {
    return this.carts.get(sessionId) || [];
  }
  async getCartWithAssets(sessionId) {
    const cartItems2 = await this.getCart(sessionId);
    const result = [];
    for (const item of cartItems2) {
      const asset = await this.getAssetById(item.assetId);
      if (asset) {
        result.push({
          ...item,
          asset: {
            id: asset.id,
            title: asset.title,
            price: asset.price,
            thumbnailUrl: asset.thumbnailUrl,
            categoryId: asset.categoryId,
            subcategoryId: asset.subcategoryId
          }
        });
      }
    }
    return result;
  }
  async addToCart(sessionId, item) {
    const cart = await this.getCart(sessionId);
    const existingIndex = cart.findIndex((i) => i.assetId === item.assetId);
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += item.quantity;
    } else {
      cart.push(item);
    }
    this.carts.set(sessionId, cart);
  }
  async removeFromCart(sessionId, assetId) {
    const cart = await this.getCart(sessionId);
    const filtered = cart.filter((item) => item.assetId !== assetId);
    this.carts.set(sessionId, filtered);
  }
  async clearCart(sessionId) {
    this.carts.delete(sessionId);
  }
};
var DbStorage = class {
  db = getDb();
  memoryFallback = new MemStorage();
  // User methods
  async getUser(id) {
    if (!this.db) return this.memoryFallback.getUser(id);
    const result = await this.db.select().from(schema_exports.users).where(eq(schema_exports.users.id, id)).limit(1);
    return result[0];
  }
  async getUserByUsername(username) {
    if (!this.db) return this.memoryFallback.getUserByUsername(username);
    const result = await this.db.select().from(schema_exports.users).where(eq(schema_exports.users.username, username)).limit(1);
    return result[0];
  }
  async createUser(user) {
    if (!this.db) return this.memoryFallback.createUser(user);
    const [newUser] = await this.db.insert(schema_exports.users).values(user).returning();
    return newUser;
  }
  // Category methods
  async getAllCategories() {
    if (!this.db) return this.memoryFallback.getAllCategories();
    return await this.db.select().from(schema_exports.categories);
  }
  async getCategoryById(id) {
    if (!this.db) return this.memoryFallback.getCategoryById(id);
    const result = await this.db.select().from(schema_exports.categories).where(eq(schema_exports.categories.id, id)).limit(1);
    return result[0];
  }
  async getCategoryBySlug(slug) {
    if (!this.db) return this.memoryFallback.getCategoryBySlug(slug);
    const result = await this.db.select().from(schema_exports.categories).where(eq(schema_exports.categories.slug, slug)).limit(1);
    return result[0];
  }
  // Subcategory methods
  async getAllSubcategories() {
    if (!this.db) return this.memoryFallback.getAllSubcategories();
    return await this.db.select().from(schema_exports.subcategories);
  }
  async getSubcategoriesByCategoryId(categoryId) {
    if (!this.db) return this.memoryFallback.getSubcategoriesByCategoryId(categoryId);
    return await this.db.select().from(schema_exports.subcategories).where(eq(schema_exports.subcategories.categoryId, categoryId));
  }
  async getSubcategoryById(id) {
    if (!this.db) return this.memoryFallback.getSubcategoryById(id);
    const result = await this.db.select().from(schema_exports.subcategories).where(eq(schema_exports.subcategories.id, id)).limit(1);
    return result[0];
  }
  // Asset methods
  async getAllAssets() {
    if (!this.db) return this.memoryFallback.getAllAssets();
    const assets2 = await this.db.select().from(schema_exports.assets).orderBy(desc(schema_exports.assets.createdAt));
    return Promise.all(assets2.map((asset) => this.populateAsset(asset)));
  }
  async getAssetById(id) {
    if (!this.db) return this.memoryFallback.getAssetById(id);
    const result = await this.db.select().from(schema_exports.assets).where(eq(schema_exports.assets.id, id)).limit(1);
    if (!result[0]) return void 0;
    return this.populateAsset(result[0]);
  }
  async getAssetsByCategoryId(categoryId) {
    if (!this.db) return this.memoryFallback.getAssetsByCategoryId(categoryId);
    const assets2 = await this.db.select().from(schema_exports.assets).where(eq(schema_exports.assets.categoryId, categoryId)).orderBy(desc(schema_exports.assets.createdAt));
    return Promise.all(assets2.map((asset) => this.populateAsset(asset)));
  }
  async getAssetsBySubcategoryId(subcategoryId) {
    if (!this.db) return this.memoryFallback.getAssetsBySubcategoryId(subcategoryId);
    const assets2 = await this.db.select().from(schema_exports.assets).where(eq(schema_exports.assets.subcategoryId, subcategoryId)).orderBy(desc(schema_exports.assets.createdAt));
    return Promise.all(assets2.map((asset) => this.populateAsset(asset)));
  }
  async populateAsset(asset) {
    const category = await this.getCategoryById(asset.categoryId);
    const subcategory = asset.subcategoryId ? await this.getSubcategoryById(asset.subcategoryId) : void 0;
    return {
      ...asset,
      category,
      subcategory
    };
  }
  // Cart methods (session-based, in-memory)
  carts = /* @__PURE__ */ new Map();
  async getCart(sessionId) {
    return this.carts.get(sessionId) || [];
  }
  async getCartWithAssets(sessionId) {
    const cartItems2 = await this.getCart(sessionId);
    const result = [];
    for (const item of cartItems2) {
      const asset = await this.getAssetById(item.assetId);
      if (asset) {
        result.push({
          ...item,
          asset: {
            id: asset.id,
            title: asset.title,
            price: asset.price,
            thumbnailUrl: asset.thumbnailUrl,
            categoryId: asset.categoryId,
            subcategoryId: asset.subcategoryId
          }
        });
      }
    }
    return result;
  }
  async addToCart(sessionId, item) {
    const cart = await this.getCart(sessionId);
    const existingIndex = cart.findIndex((i) => i.assetId === item.assetId);
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += item.quantity;
    } else {
      cart.push(item);
    }
    this.carts.set(sessionId, cart);
  }
  async removeFromCart(sessionId, assetId) {
    const cart = await this.getCart(sessionId);
    const filtered = cart.filter((item) => item.assetId !== assetId);
    this.carts.set(sessionId, filtered);
  }
  async clearCart(sessionId) {
    this.carts.delete(sessionId);
  }
};
var storage = getDb() ? new DbStorage() : new MemStorage();

// server/routes.ts
function getSessionId(req) {
  return req.sessionID || "default-session";
}
async function registerRoutes(app2) {
  app2.get("/api/categories", async (req, res) => {
    try {
      const categories2 = await storage.getAllCategories();
      res.json(categories2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching categories: " + error.message });
    }
  });
  app2.get("/api/categories/:id/subcategories", async (req, res) => {
    try {
      const subcategories2 = await storage.getSubcategoriesByCategoryId(req.params.id);
      res.json(subcategories2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching subcategories: " + error.message });
    }
  });
  app2.get("/api/assets", async (req, res) => {
    try {
      const {
        categoryId,
        subcategoryId,
        featured,
        search,
        page = "1",
        limit = "20",
        sortBy = "createdAt",
        sortOrder = "desc"
      } = req.query;
      let assets2;
      if (subcategoryId && typeof subcategoryId === "string") {
        assets2 = await storage.getAssetsBySubcategoryId(subcategoryId);
      } else if (categoryId && typeof categoryId === "string") {
        assets2 = await storage.getAssetsByCategoryId(categoryId);
      } else {
        assets2 = await storage.getAllAssets();
      }
      if (featured === "true") {
        assets2 = assets2.filter((a) => a.featured);
      }
      if (search && typeof search === "string") {
        const searchLower = search.toLowerCase();
        assets2 = assets2.filter(
          (asset) => asset.title.toLowerCase().includes(searchLower) || asset.description.toLowerCase().includes(searchLower) || asset.tags.some((tag) => tag.toLowerCase().includes(searchLower))
        );
      }
      if (sortBy === "price") {
        assets2.sort((a, b) => {
          const priceA = parseFloat(a.price);
          const priceB = parseFloat(b.price);
          return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
        });
      } else if (sortBy === "title") {
        assets2.sort((a, b) => {
          return sortOrder === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
        });
      }
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedAssets = assets2.slice(startIndex, endIndex);
      res.json({
        assets: paginatedAssets,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: assets2.length,
          totalPages: Math.ceil(assets2.length / limitNum),
          hasMore: endIndex < assets2.length
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching assets: " + error.message });
    }
  });
  app2.get("/api/assets/:id", async (req, res) => {
    try {
      const asset = await storage.getAssetById(req.params.id);
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      res.json(asset);
    } catch (error) {
      res.status(500).json({ message: "Error fetching asset: " + error.message });
    }
  });
  app2.get("/api/cart", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const cartItems2 = await storage.getCartWithAssets(sessionId);
      res.json(cartItems2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching cart: " + error.message });
    }
  });
  app2.post("/api/cart", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const validatedItem = cartItemSchema.parse(req.body);
      const asset = await storage.getAssetById(validatedItem.assetId);
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      await storage.addToCart(sessionId, validatedItem);
      res.status(201).json({ message: "Item added to cart" });
    } catch (error) {
      res.status(400).json({ message: "Error adding to cart: " + error.message });
    }
  });
  app2.delete("/api/cart/:assetId", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      await storage.removeFromCart(sessionId, req.params.assetId);
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      res.status(500).json({ message: "Error removing from cart: " + error.message });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import session from "express-session";
import MemoryStore from "memorystore";

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashedPassword, salt] = stored.split(".");
  const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedPasswordBuf, suppliedBuf);
}
function setupAuth(app2) {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        const isValid = await comparePasswords(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Incorrect password" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  app2.use(passport.initialize());
  app2.use(passport.session());
  app2.post("/api/auth/register", async (req, res, next) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }
      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        password: hashedPassword
      });
      req.login(user, (err) => {
        if (err) return next(err);
        return res.json({
          id: user.id,
          username: user.username
        });
      });
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Login failed" });
      }
      req.login(user, (err2) => {
        if (err2) return next(err2);
        return res.json({
          id: user.id,
          username: user.username
        });
      });
    })(req, res, next);
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  app2.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated() && req.user) {
      const user = req.user;
      return res.json({
        id: user.id,
        username: user.username
      });
    }
    res.status(401).json({ message: "Not authenticated" });
  });
}

// server/index.ts
var app = express2();
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === "production" ? void 0 : false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5000",
  credentials: true
}));
var limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
  // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false
});
app.use("/api/", limiter);
var MemoryStoreSession = MemoryStore(session);
app.use(
  session({
    secret: process.env.SESSION_SECRET || "windsand-dev-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreSession({
      checkPeriod: 864e5
      // prune expired entries every 24h
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1e3 * 60 * 60 * 24 * 7,
      // 1 week
      sameSite: "lax"
    }
  })
);
app.use(express2.json({
  limit: "10mb",
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express2.urlencoded({ extended: false, limit: "10mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  setupAuth(app);
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
