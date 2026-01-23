import { 
  type User, 
  type InsertUser, 
  type Asset, 
  type CartItem, 
  type CartItemWithAsset,
  type Category,
  type Subcategory,
  type AssetWithCategory
} from "@shared/schema";
import { randomUUID } from "crypto";
import { getDb, schema } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Category methods
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  
  // Subcategory methods
  getAllSubcategories(): Promise<Subcategory[]>;
  getSubcategoriesByCategoryId(categoryId: string): Promise<Subcategory[]>;
  getSubcategoryById(id: string): Promise<Subcategory | undefined>;

  // Asset methods
  getAllAssets(): Promise<AssetWithCategory[]>;
  getAssetById(id: string): Promise<AssetWithCategory | undefined>;
  getAssetsByCategoryId(categoryId: string): Promise<AssetWithCategory[]>;
  getAssetsBySubcategoryId(subcategoryId: string): Promise<AssetWithCategory[]>;

  // Cart methods (session-based, not persisted)
  getCart(sessionId: string): Promise<CartItem[]>;
  getCartWithAssets(sessionId: string): Promise<CartItemWithAsset[]>;
  addToCart(sessionId: string, item: CartItem): Promise<void>;
  removeFromCart(sessionId: string, assetId: string): Promise<void>;
  clearCart(sessionId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private categories: Map<string, Category>;
  private subcategories: Map<string, Subcategory>;
  private assets: Map<string, Asset>;
  private carts: Map<string, CartItem[]>;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.subcategories = new Map();
    this.assets = new Map();
    this.carts = new Map();
    this.initializeMockCategories();
    this.initializeMockSubcategories();
    this.initializeMockAssets();
  }

  // Initialize with mock category data
  private initializeMockCategories() {
    const mockCategories: Category[] = [
      {
        id: "cat-visual",
        name: "Visual",
        description: "2D and 3D visual assets including sprites, textures, models, and environments",
        icon: "Image",
        slug: "visual",
      },
      {
        id: "cat-audio",
        name: "Audio",
        description: "Music, sound effects, and voice-overs for immersive gaming experiences",
        icon: "Music",
        slug: "audio",
      },
      {
        id: "cat-animation",
        name: "Animation",
        description: "Character animations, environmental animations, and motion assets",
        icon: "Film",
        slug: "animation",
      },
      {
        id: "cat-functional",
        name: "Functional",
        description: "Code, scripts, shaders, and development tools",
        icon: "Code",
        slug: "functional",
      },
      {
        id: "cat-vfx",
        name: "VFX",
        description: "Visual effects including particle systems, shaders, and post-processing effects",
        icon: "Sparkles",
        slug: "vfx",
      },
    ];

    mockCategories.forEach(category => {
      this.categories.set(category.id, category);
    });
  }

  // Initialize with mock subcategory data
  private initializeMockSubcategories() {
    const mockSubcategories: Subcategory[] = [
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
      { id: "sub-magic-fx", categoryId: "cat-vfx", name: "Magic & Fantasy FX", description: "Spell effects and magical visuals", slug: "magic-fx" },
    ];

    mockSubcategories.forEach(subcategory => {
      this.subcategories.set(subcategory.id, subcategory);
    });
  }

  // Initialize with mock asset data
  private initializeMockAssets() {
    const mockAssets: Asset[] = [
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
        polyCount: 45000,
        textureResolution: "4K (4096x4096)",
        fileFormat: "GLTF/GLB",
        createdAt: new Date("2024-01-15"),
        sellerId: "creator-001",
        featured: true,
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
        polyCount: 125000,
        textureResolution: "2K (2048x2048)",
        fileFormat: "GLTF/GLB",
        createdAt: new Date("2024-01-20"),
        sellerId: "creator-002",
        featured: true,
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
        polyCount: 5000,
        textureResolution: "1K (1024x1024)",
        fileFormat: "GLTF/GLB",
        createdAt: new Date("2024-02-01"),
        sellerId: "creator-003",
        featured: false,
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
        polyCount: 8000,
        textureResolution: "512px (512x512)",
        fileFormat: "GLTF/GLB",
        createdAt: new Date("2024-02-10"),
        sellerId: "creator-004",
        featured: false,
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
        polyCount: 1000,
        textureResolution: "2K (2048x2048)",
        fileFormat: "GLTF/GLB",
        createdAt: new Date("2024-02-15"),
        sellerId: "creator-005",
        featured: true,
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
        createdAt: new Date("2024-03-01"),
        sellerId: "creator-006",
        featured: false,
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
        polyCount: 180000,
        textureResolution: "4K (4096x4096)",
        fileFormat: "GLTF/GLB",
        createdAt: new Date("2024-03-10"),
        sellerId: "creator-002",
        featured: true,
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
        polyCount: 52000,
        textureResolution: "4K (4096x4096)",
        fileFormat: "GLTF/GLB",
        createdAt: new Date("2024-03-15"),
        sellerId: "creator-007",
        featured: false,
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
        polyCount: 15000,
        textureResolution: "2K (2048x2048)",
        fileFormat: "GLTF/GLB",
        createdAt: new Date("2024-03-20"),
        sellerId: "creator-008",
        featured: false,
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
        polyCount: 3000,
        textureResolution: "1K (1024x1024)",
        fileFormat: "GLTF/GLB",
        createdAt: new Date("2024-03-25"),
        sellerId: "creator-003",
        featured: false,
      },
    ];

    mockAssets.forEach(asset => {
      this.assets.set(asset.id, asset);
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(cat => cat.slug === slug);
  }

  // Subcategory methods
  async getAllSubcategories(): Promise<Subcategory[]> {
    return Array.from(this.subcategories.values());
  }

  async getSubcategoriesByCategoryId(categoryId: string): Promise<Subcategory[]> {
    return Array.from(this.subcategories.values())
      .filter(sub => sub.categoryId === categoryId);
  }

  async getSubcategoryById(id: string): Promise<Subcategory | undefined> {
    return this.subcategories.get(id);
  }

  // Helper method to populate asset with category/subcategory
  private async populateAsset(asset: Asset): Promise<AssetWithCategory> {
    const category = await this.getCategoryById(asset.categoryId);
    const subcategory = asset.subcategoryId 
      ? await this.getSubcategoryById(asset.subcategoryId)
      : undefined;
    
    return {
      ...asset,
      category,
      subcategory,
    };
  }

  // Asset methods
  async getAllAssets(): Promise<AssetWithCategory[]> {
    const assets = Array.from(this.assets.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
    return Promise.all(assets.map(asset => this.populateAsset(asset)));
  }

  async getAssetById(id: string): Promise<AssetWithCategory | undefined> {
    const asset = this.assets.get(id);
    if (!asset) return undefined;
    return this.populateAsset(asset);
  }

  async getAssetsByCategoryId(categoryId: string): Promise<AssetWithCategory[]> {
    const assets = Array.from(this.assets.values())
      .filter(asset => asset.categoryId === categoryId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return Promise.all(assets.map(asset => this.populateAsset(asset)));
  }

  async getAssetsBySubcategoryId(subcategoryId: string): Promise<AssetWithCategory[]> {
    const assets = Array.from(this.assets.values())
      .filter(asset => asset.subcategoryId === subcategoryId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return Promise.all(assets.map(asset => this.populateAsset(asset)));
  }

  // Cart methods
  async getCart(sessionId: string): Promise<CartItem[]> {
    return this.carts.get(sessionId) || [];
  }

  async getCartWithAssets(sessionId: string): Promise<CartItemWithAsset[]> {
    const cartItems = await this.getCart(sessionId);
    const result: CartItemWithAsset[] = [];

    for (const item of cartItems) {
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
            subcategoryId: asset.subcategoryId,
          },
        });
      }
    }

    return result;
  }

  async addToCart(sessionId: string, item: CartItem): Promise<void> {
    const cart = await this.getCart(sessionId);
    const existingIndex = cart.findIndex(i => i.assetId === item.assetId);

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += item.quantity;
    } else {
      cart.push(item);
    }

    this.carts.set(sessionId, cart);
  }

  async removeFromCart(sessionId: string, assetId: string): Promise<void> {
    const cart = await this.getCart(sessionId);
    const filtered = cart.filter(item => item.assetId !== assetId);
    this.carts.set(sessionId, filtered);
  }

  async clearCart(sessionId: string): Promise<void> {
    this.carts.delete(sessionId);
  }
}

// Database-backed storage implementation
export class DbStorage implements IStorage {
  private db = getDb();
  private memoryFallback = new MemStorage();

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    if (!this.db) return this.memoryFallback.getUser(id);
    const result = await this.db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!this.db) return this.memoryFallback.getUserByUsername(username);
    const result = await this.db.select().from(schema.users).where(eq(schema.users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    if (!this.db) return this.memoryFallback.createUser(user);
    const [newUser] = await this.db.insert(schema.users).values(user).returning();
    return newUser;
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    if (!this.db) return this.memoryFallback.getAllCategories();
    return await this.db.select().from(schema.categories);
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    if (!this.db) return this.memoryFallback.getCategoryById(id);
    const result = await this.db.select().from(schema.categories).where(eq(schema.categories.id, id)).limit(1);
    return result[0];
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    if (!this.db) return this.memoryFallback.getCategoryBySlug(slug);
    const result = await this.db.select().from(schema.categories).where(eq(schema.categories.slug, slug)).limit(1);
    return result[0];
  }

  // Subcategory methods
  async getAllSubcategories(): Promise<Subcategory[]> {
    if (!this.db) return this.memoryFallback.getAllSubcategories();
    return await this.db.select().from(schema.subcategories);
  }

  async getSubcategoriesByCategoryId(categoryId: string): Promise<Subcategory[]> {
    if (!this.db) return this.memoryFallback.getSubcategoriesByCategoryId(categoryId);
    return await this.db.select().from(schema.subcategories).where(eq(schema.subcategories.categoryId, categoryId));
  }

  async getSubcategoryById(id: string): Promise<Subcategory | undefined> {
    if (!this.db) return this.memoryFallback.getSubcategoryById(id);
    const result = await this.db.select().from(schema.subcategories).where(eq(schema.subcategories.id, id)).limit(1);
    return result[0];
  }

  // Asset methods
  async getAllAssets(): Promise<AssetWithCategory[]> {
    if (!this.db) return this.memoryFallback.getAllAssets();
    const assets = await this.db.select().from(schema.assets).orderBy(desc(schema.assets.createdAt));
    return Promise.all(assets.map(asset => this.populateAsset(asset)));
  }

  async getAssetById(id: string): Promise<AssetWithCategory | undefined> {
    if (!this.db) return this.memoryFallback.getAssetById(id);
    const result = await this.db.select().from(schema.assets).where(eq(schema.assets.id, id)).limit(1);
    if (!result[0]) return undefined;
    return this.populateAsset(result[0]);
  }

  async getAssetsByCategoryId(categoryId: string): Promise<AssetWithCategory[]> {
    if (!this.db) return this.memoryFallback.getAssetsByCategoryId(categoryId);
    const assets = await this.db.select().from(schema.assets)
      .where(eq(schema.assets.categoryId, categoryId))
      .orderBy(desc(schema.assets.createdAt));
    return Promise.all(assets.map(asset => this.populateAsset(asset)));
  }

  async getAssetsBySubcategoryId(subcategoryId: string): Promise<AssetWithCategory[]> {
    if (!this.db) return this.memoryFallback.getAssetsBySubcategoryId(subcategoryId);
    const assets = await this.db.select().from(schema.assets)
      .where(eq(schema.assets.subcategoryId, subcategoryId))
      .orderBy(desc(schema.assets.createdAt));
    return Promise.all(assets.map(asset => this.populateAsset(asset)));
  }

  private async populateAsset(asset: Asset): Promise<AssetWithCategory> {
    const category = await this.getCategoryById(asset.categoryId);
    const subcategory = asset.subcategoryId 
      ? await this.getSubcategoryById(asset.subcategoryId)
      : undefined;
    
    return {
      ...asset,
      category,
      subcategory,
    };
  }

  // Cart methods (session-based, in-memory)
  private carts: Map<string, CartItem[]> = new Map();

  async getCart(sessionId: string): Promise<CartItem[]> {
    return this.carts.get(sessionId) || [];
  }

  async getCartWithAssets(sessionId: string): Promise<CartItemWithAsset[]> {
    const cartItems = await this.getCart(sessionId);
    const result: CartItemWithAsset[] = [];

    for (const item of cartItems) {
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
            subcategoryId: asset.subcategoryId,
          },
        });
      }
    }

    return result;
  }

  async addToCart(sessionId: string, item: CartItem): Promise<void> {
    const cart = await this.getCart(sessionId);
    const existingIndex = cart.findIndex(i => i.assetId === item.assetId);

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += item.quantity;
    } else {
      cart.push(item);
    }

    this.carts.set(sessionId, cart);
  }

  async removeFromCart(sessionId: string, assetId: string): Promise<void> {
    const cart = await this.getCart(sessionId);
    const filtered = cart.filter(item => item.assetId !== assetId);
    this.carts.set(sessionId, filtered);
  }

  async clearCart(sessionId: string): Promise<void> {
    this.carts.delete(sessionId);
  }
}

// Use database storage if available, otherwise fall back to memory
export const storage = getDb() ? new DbStorage() : new MemStorage();
