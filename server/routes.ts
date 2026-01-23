import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { cartItemSchema } from "@shared/schema";

// Get session ID from express-session
function getSessionId(req: Request): string {
  return req.sessionID || 'default-session';
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Category endpoints
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching categories: " + error.message });
    }
  });

  app.get("/api/categories/:id/subcategories", async (req, res) => {
    try {
      const subcategories = await storage.getSubcategoriesByCategoryId(req.params.id);
      res.json(subcategories);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching subcategories: " + error.message });
    }
  });

  // Asset endpoints with pagination and search
  app.get("/api/assets", async (req, res) => {
    try {
      const { 
        categoryId, 
        subcategoryId, 
        featured,
        search,
        page = '1',
        limit = '20',
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;
      
      let assets;
      if (subcategoryId && typeof subcategoryId === 'string') {
        assets = await storage.getAssetsBySubcategoryId(subcategoryId);
      } else if (categoryId && typeof categoryId === 'string') {
        assets = await storage.getAssetsByCategoryId(categoryId);
      } else {
        assets = await storage.getAllAssets();
      }

      // Filter by featured
      if (featured === 'true') {
        assets = assets.filter(a => a.featured);
      }

      // Search filter
      if (search && typeof search === 'string') {
        const searchLower = search.toLowerCase();
        assets = assets.filter(asset => 
          asset.title.toLowerCase().includes(searchLower) ||
          asset.description.toLowerCase().includes(searchLower) ||
          asset.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      // Sorting
      if (sortBy === 'price') {
        assets.sort((a, b) => {
          const priceA = parseFloat(a.price);
          const priceB = parseFloat(b.price);
          return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
        });
      } else if (sortBy === 'title') {
        assets.sort((a, b) => {
          return sortOrder === 'asc' 
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        });
      }

      // Pagination
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      
      const paginatedAssets = assets.slice(startIndex, endIndex);
      
      res.json({
        assets: paginatedAssets,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: assets.length,
          totalPages: Math.ceil(assets.length / limitNum),
          hasMore: endIndex < assets.length,
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching assets: " + error.message });
    }
  });

  app.get("/api/assets/:id", async (req, res) => {
    try {
      const asset = await storage.getAssetById(req.params.id);
      
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }

      res.json(asset);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching asset: " + error.message });
    }
  });

  // Cart endpoints
  app.get("/api/cart", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const cartItems = await storage.getCartWithAssets(sessionId);
      res.json(cartItems);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching cart: " + error.message });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const validatedItem = cartItemSchema.parse(req.body);
      
      // Verify asset exists
      const asset = await storage.getAssetById(validatedItem.assetId);
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }

      await storage.addToCart(sessionId, validatedItem);
      res.status(201).json({ message: "Item added to cart" });
    } catch (error: any) {
      res.status(400).json({ message: "Error adding to cart: " + error.message });
    }
  });

  app.delete("/api/cart/:assetId", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      await storage.removeFromCart(sessionId, req.params.assetId);
      res.json({ message: "Item removed from cart" });
    } catch (error: any) {
      res.status(500).json({ message: "Error removing from cart: " + error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
