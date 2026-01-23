import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Categories table
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  icon: text("icon"),
  slug: text("slug").notNull().unique(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Subcategories table
export const subcategories = pgTable("subcategories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  slug: text("slug").notNull(),
});

export const insertSubcategorySchema = createInsertSchema(subcategories).omit({
  id: true,
});

export type InsertSubcategory = z.infer<typeof insertSubcategorySchema>;
export type Subcategory = typeof subcategories.$inferSelect;

// Assets table
export const assets = pgTable("assets", {
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
  featured: boolean("featured").notNull().default(false),
});

export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
  createdAt: true,
  featured: true,
});

export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type Asset = typeof assets.$inferSelect;

// Cart items table (now persisted)
export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull(),
  assetId: varchar("asset_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Cart items (in-memory, no table needed for MVP)
export const cartItemSchema = z.object({
  assetId: z.string(),
  quantity: z.number().int().positive().default(1),
});

export type CartItem = z.infer<typeof cartItemSchema>;

// Cart with full asset details for frontend
export const cartItemWithAssetSchema = cartItemSchema.extend({
  asset: z.object({
    id: z.string(),
    title: z.string(),
    price: z.string(),
    thumbnailUrl: z.string().nullable(),
    categoryId: z.string(),
    subcategoryId: z.string().nullable(),
  }),
});

export type CartItemWithAsset = z.infer<typeof cartItemWithAssetSchema>;

// Extended types with populated relations
export type AssetWithCategory = Asset & {
  category?: Category;
  subcategory?: Subcategory;
};

// Users table (keep existing structure)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
