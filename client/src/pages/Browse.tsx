import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { AssetCard } from "@/components/AssetCard";
import { ThreeSceneBackground } from "@/components/ThreeSceneBackground";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { 
  Image,
  Music,
  Film,
  Code,
  Sparkles,
  SlidersHorizontal,
  Search,
  X,
  ChevronDown,
  ChevronRight,
  Box,
  Layers,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { AssetWithCategory, Category, Subcategory } from "@shared/schema";

const categoryIcons: Record<string, any> = {
  visual: Image,
  audio: Music,
  animation: Film,
  functional: Code,
  vfx: Sparkles,
};

const categoryColors: Record<string, string> = {
  visual: "from-primary/20 to-purple-500/20 border-primary/40 text-primary",
  audio: "from-purple-500/20 to-pink-500/20 border-purple-400/40 text-purple-400",
  animation: "from-pink-500/20 to-primary/20 border-pink-400/40 text-pink-400",
  functional: "from-blue-500/20 to-cyan-500/20 border-blue-400/40 text-blue-400",
  vfx: "from-purple-600/20 to-primary/20 border-purple-500/40 text-purple-500",
};

interface CategoryItemProps {
  category: Category;
  selectedCategoryId: string | null;
  selectedSubcategoryId: string | null;
  expandedCategories: Set<string>;
  onSelectCategory: (categoryId: string | null) => void;
  onSelectSubcategory: (subcategoryId: string | null, categoryId: string) => void;
  onToggleExpand: (categoryId: string) => void;
}

function CategoryItem({
  category,
  selectedCategoryId,
  selectedSubcategoryId,
  expandedCategories,
  onSelectCategory,
  onSelectSubcategory,
  onToggleExpand,
}: CategoryItemProps) {
  const { data: subcategories } = useQuery<Subcategory[]>({
    queryKey: [`/api/categories/${category.id}/subcategories`],
    enabled: !!category.id,
  });

  const Icon = categoryIcons[category.slug] || Box;
  const isExpanded = expandedCategories.has(category.id);
  const isSelected = selectedCategoryId === category.id && !selectedSubcategoryId;
  const colorClasses = categoryColors[category.slug] || categoryColors.visual;

  return (
    <div className="mb-2">
      <div className={`flex items-center rounded-lg overflow-hidden transition-all duration-300 ${isSelected ? 'bg-gradient-to-r ' + colorClasses + ' shadow-lg' : 'hover-elevate'}`}>
        <Button
          variant="ghost"
          size="sm"
          className="h-12 w-12 p-0 hover:bg-transparent"
          onClick={() => onToggleExpand(category.id)}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          className={`flex-1 justify-start h-12 hover:bg-transparent ${isSelected ? 'font-semibold' : ''}`}
          onClick={() => onSelectCategory(category.id)}
          data-testid={`button-category-${category.slug}`}
        >
          <Icon className="h-5 w-5 mr-3" />
          <span>{category.name}</span>
        </Button>
      </div>
      {isExpanded && subcategories && subcategories.length > 0 && (
        <div className="ml-8 mt-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
          {subcategories.map((sub) => (
            <Button
              key={sub.id}
              variant="ghost"
              className={`w-full justify-start text-sm h-10 rounded-lg transition-all duration-200 ${selectedSubcategoryId === sub.id ? 'bg-primary/20 text-primary font-medium' : 'hover-elevate'}`}
              onClick={() => onSelectSubcategory(sub.id, category.id)}
              data-testid={`button-subcategory-${sub.slug}`}
            >
              <Layers className="h-3 w-3 mr-2 opacity-70" />
              {sub.name}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Browse() {
  const searchParams = new URLSearchParams(useSearch());
  const initialCategoryId = searchParams.get('categoryId');
  const initialSubcategoryId = searchParams.get('subcategoryId');
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerOffset, setHeaderOffset] = useState(0);
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(initialCategoryId);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(initialSubcategoryId);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set<string>(initialCategoryId ? [initialCategoryId] : [])
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showFilters, setShowFilters] = useState(true);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(["GLTF/GLB", "FBX", "OBJ"]);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Parallax effect for header
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      setHeaderOffset(scrolled * 0.3);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Fetch assets with category/subcategory filter
  const queryParams: Record<string, string> = {};
  if (selectedSubcategoryId) {
    queryParams.subcategoryId = selectedSubcategoryId;
  } else if (selectedCategoryId) {
    queryParams.categoryId = selectedCategoryId;
  }
  if (searchQuery) {
    queryParams.search = searchQuery;
  }

  const { data: assetsResponse, isLoading } = useQuery<{ assets: AssetWithCategory[], pagination: any }>({
    queryKey: ['/api/assets', queryParams],
  });

  const assets = assetsResponse?.assets || [];

  const handleAddToCart = async (assetId: string) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId, quantity: 1 }),
      });

      if (!response.ok) throw new Error('Failed to add to cart');

      await queryClient.invalidateQueries({ queryKey: ['/api/cart'] });

      toast({
        title: "Added to Cart",
        description: "Asset has been added to your cart",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add asset to cart",
        variant: "destructive",
      });
    }
  };

  const filteredAssets = assets?.filter((asset) => {
    const price = parseFloat(asset.price);
    const priceMatch = price >= priceRange[0] && price <= priceRange[1];
    const formatMatch = selectedFormats.length === 0 || selectedFormats.includes(asset.fileFormat);
    const searchMatch = searchQuery === "" || 
      asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.tags && asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    return priceMatch && formatMatch && searchMatch;
  });

  const toggleFormat = (format: string) => {
    setSelectedFormats(prev =>
      prev.includes(format)
        ? prev.filter(f => f !== format)
        : [...prev, format]
    );
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(Array.from(prev));
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const selectCategory = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubcategoryId(null);
  };

  const selectSubcategory = (subcategoryId: string | null, categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubcategoryId(subcategoryId);
    if (!expandedCategories.has(categoryId)) {
      setExpandedCategories(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.add(categoryId);
        return newSet;
      });
    }
  };

  const clearAllFilters = () => {
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
    setExpandedCategories(new Set<string>());
    setPriceRange([0, 1000]);
    setSearchQuery("");
    setSelectedFormats(["GLTF/GLB", "FBX", "OBJ"]);
  };

  const selectedCategory = categories?.find(cat => cat.id === selectedCategoryId);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ThreeSceneBackground variant="browse" />
      
      {/* Modern Header with Parallax */}
      <div 
        ref={headerRef}
        className="relative py-16 overflow-hidden"
        style={{
          transform: `translateY(${-headerOffset}px)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(184,84,212,0.15),transparent_50%)]" />
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Filter className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Explore Premium Assets</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-purple-400 to-pink-500 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-8 duration-700">
              {selectedCategory ? selectedCategory.name : 'Browse All Assets'}
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "200ms" }}>
              {selectedCategory ? selectedCategory.description : 'Discover thousands of premium game development assets'}
            </p>

            <div className="flex items-center gap-2 justify-center flex-wrap animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "300ms" }}>
              <Badge variant="secondary" className="text-sm backdrop-blur-sm bg-background/80">
                {filteredAssets?.length || 0} assets
              </Badge>
              {selectedCategory && (
                <Badge className="text-sm backdrop-blur-sm bg-primary/20 text-primary border-primary/30">
                  Filtered by {selectedCategory.name}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 relative z-10 pb-12">
        {/* Search Bar */}
        <div className="max-w-3xl mx-auto -mt-8 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "400ms" }}>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground transition-all duration-300 group-focus-within:text-primary group-focus-within:scale-110 z-10" />
            <Input
              type="text"
              placeholder="Search by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 pr-14 h-16 text-lg bg-background/90 backdrop-blur-xl border-2 border-border/50 transition-all duration-300 focus:border-primary focus:bg-background/95 focus:shadow-2xl focus:shadow-primary/20 hover:border-primary/50 rounded-2xl relative"
              data-testid="input-search"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 p-0 hover:bg-destructive/20 hover:text-destructive rounded-full z-10"
                onClick={() => setSearchQuery("")}
                data-testid="button-clear-search"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Glassmorphic Design */}
          <aside className={`w-full lg:w-80 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card className="p-6 sticky top-24 space-y-6 backdrop-blur-xl bg-background/70 border-border/50 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Filters</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setShowFilters(false)}
                  data-testid="button-close-filters"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {(selectedCategoryId || selectedSubcategoryId || searchQuery) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="w-full hover-elevate"
                  data-testid="button-clear-all-filters"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear All Filters
                </Button>
              )}

              <Separator />

              {/* Categories */}
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Box className="h-4 w-4 text-primary" />
                  Categories
                </h4>
                <div className="space-y-1">
                  {categories?.map((category) => (
                    <CategoryItem
                      key={category.id}
                      category={category}
                      selectedCategoryId={selectedCategoryId}
                      selectedSubcategoryId={selectedSubcategoryId}
                      expandedCategories={expandedCategories}
                      onSelectCategory={selectCategory}
                      onSelectSubcategory={selectSubcategory}
                      onToggleExpand={toggleCategory}
                    />
                  ))}
                </div>
              </div>

              <Separator />

              {/* File Formats */}
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  File Formats
                </h4>
                <div className="space-y-2">
                  {["GLTF/GLB", "FBX", "OBJ"].map((format) => (
                    <label
                      key={format}
                      className="flex items-center gap-3 p-3 rounded-lg hover-elevate cursor-pointer transition-all duration-200"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFormats.includes(format)}
                        onChange={() => toggleFormat(format)}
                        className="w-5 h-5 rounded border-2 border-primary text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer"
                      />
                      <span className="text-sm font-medium">{format}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Price Range */}
              <div>
                <h4 className="font-semibold mb-4">Price Range</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      className="flex-1"
                      placeholder="Min"
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000])}
                      className="flex-1"
                      placeholder="Max"
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </Card>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-6">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full hover-elevate"
                data-testid="button-toggle-filters"
              >
                <SlidersHorizontal className="h-5 w-5 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>

            {/* Asset Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="h-96 bg-card/50 animate-pulse rounded-2xl backdrop-blur-sm" />
                ))}
              </div>
            ) : filteredAssets && filteredAssets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-500">
                {filteredAssets.map((asset, index) => (
                  <div
                    key={asset.id}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <AssetCard
                      asset={asset}
                      onAddToCart={handleAddToCart}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center backdrop-blur-xl bg-background/70 border-border/50">
                <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-2xl font-semibold mb-2">No Assets Found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters or search terms
                </p>
                <Button onClick={clearAllFilters} variant="outline" className="hover-elevate">
                  Clear Filters
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
