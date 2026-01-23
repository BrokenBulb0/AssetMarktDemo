import { getDb, schema } from "./db";
import { storage } from "./storage";

async function seed() {
  const db = getDb();
  
  if (!db) {
    console.log("No database connection, skipping seed");
    return;
  }

  console.log("Seeding database...");

  try {
    // Seed categories
    const categories = [
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

    await db.insert(schema.categories).values(categories).onConflictDoNothing();
    console.log("✓ Categories seeded");

    // Seed subcategories
    const subcategories = [
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

    await db.insert(schema.subcategories).values(subcategories).onConflictDoNothing();
    console.log("✓ Subcategories seeded");

    console.log("✓ Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seed };
