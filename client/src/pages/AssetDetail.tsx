import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loading } from "@/components/Loading";
import { AssetViewer } from "@/components/AssetViewer";
import { FullScreenViewer } from "@/components/FullScreenViewer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingCart, 
  Download, 
  Share2,
  FileType,
  Box,
  Layers,
  Maximize2,
  Star,
  CheckCircle2,
  Package,
  Cpu,
  HardDrive
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { AssetWithCategory } from "@shared/schema";

import { SEO } from "@/components/SEO";

export default function AssetDetail() {
  const [, params] = useRoute("/asset/:id");
  const assetId = params?.id;
  const { toast } = useToast();
  const [showFullScreen, setShowFullScreen] = useState(false);

  const { data: asset, isLoading } = useQuery<AssetWithCategory>({
    queryKey: ['/api/assets', assetId],
    enabled: !!assetId,
  });

  const handleAddToCart = async () => {
    if (!assetId) return;

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

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (!asset) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-12 text-center">
          <p className="text-lg text-muted-foreground">Asset not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 sm:py-8">
      <SEO
        title={`${asset.title} - WindSand Asset Market`}
        description={asset.description?.slice(0, 160) || asset.title}
        image={asset.thumbnailUrl || undefined}
        type="product"
      />
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="relative group">
              <AssetViewer 
                modelUrl={asset.modelUrl} 
                category={asset.category?.name || 'Unknown'}
                className="h-[400px] sm:h-[500px] md:h-[600px] w-full"
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 backdrop-blur-sm"
                onClick={() => setShowFullScreen(true)}
                data-testid="button-fullscreen"
              >
                <Maximize2 className="h-4 w-4 mr-2" />
                Full Screen
              </Button>
            </div>

            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description" data-testid="tab-description">Description</TabsTrigger>
                <TabsTrigger value="specs" data-testid="tab-specs">Specifications</TabsTrigger>
                <TabsTrigger value="reviews" data-testid="tab-reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="space-y-6 pt-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">About this asset</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {asset.description}
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="text-lg font-semibold mb-4">What's Included</h4>
                  <div className="grid gap-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">High-Quality 3D Models</p>
                        <p className="text-sm text-muted-foreground">Production-ready assets optimized for real-time rendering</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">PBR Textures</p>
                        <p className="text-sm text-muted-foreground">Complete texture sets including albedo, normal, metallic, roughness, and AO maps</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Multiple File Formats</p>
                        <p className="text-sm text-muted-foreground">FBX, GLTF/GLB, and OBJ formats for maximum compatibility</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Documentation</p>
                        <p className="text-sm text-muted-foreground">Detailed setup guide and usage instructions</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />
                
                <div>
                  <h4 className="text-lg font-semibold mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {asset.tags?.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    )) || null}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="specs" className="space-y-6 pt-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Technical Specifications</h3>
                  <div className="grid gap-4">
                    <div className="flex items-center gap-3 p-4 bg-card rounded-lg border hover-elevate">
                      <Box className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium">Polygon Count</p>
                        <p className="text-sm text-muted-foreground">
                          {asset.polyCount?.toLocaleString() || 'N/A'} triangles
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-card rounded-lg border hover-elevate">
                      <Layers className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium">Texture Resolution</p>
                        <p className="text-sm text-muted-foreground">
                          {asset.textureResolution || 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-card rounded-lg border hover-elevate">
                      <FileType className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium">File Formats</p>
                        <p className="text-sm text-muted-foreground">
                          {asset.fileFormat}, FBX, OBJ
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-card rounded-lg border hover-elevate">
                      <Package className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium">File Size</p>
                        <p className="text-sm text-muted-foreground">
                          ~{Math.round((asset.polyCount || 10000) / 5000 * 12)}MB (compressed)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-card rounded-lg border hover-elevate">
                      <Cpu className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium">LOD Levels</p>
                        <p className="text-sm text-muted-foreground">
                          3 levels included (High, Medium, Low)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-card rounded-lg border hover-elevate">
                      <HardDrive className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium">UV Mapping</p>
                        <p className="text-sm text-muted-foreground">
                          Non-overlapping UVs, optimized layout
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-lg font-semibold mb-4">Compatibility</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Card className="p-4">
                      <p className="font-medium mb-2">Game Engines</p>
                      <p className="text-sm text-muted-foreground">Unity, Unreal Engine, Godot, CryEngine</p>
                    </Card>
                    <Card className="p-4">
                      <p className="font-medium mb-2">3D Software</p>
                      <p className="text-sm text-muted-foreground">Blender, Maya, 3ds Max, Cinema 4D</p>
                    </Card>
                    <Card className="p-4">
                      <p className="font-medium mb-2">Platforms</p>
                      <p className="text-sm text-muted-foreground">PC, Console, Mobile, VR/AR</p>
                    </Card>
                    <Card className="p-4">
                      <p className="font-medium mb-2">Render Pipelines</p>
                      <p className="text-sm text-muted-foreground">URP, HDRP, Built-in, Custom</p>
                    </Card>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-lg font-semibold mb-4">License Information</h4>
                  <Card className="p-4 bg-muted/30">
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">License Type:</span> Royalty-Free Commercial License</p>
                      <p><span className="font-medium">Usage:</span> Use in unlimited commercial projects</p>
                      <p><span className="font-medium">Modification:</span> Fully editable, can be modified</p>
                      <p><span className="font-medium">Redistribution:</span> Cannot resell or redistribute as-is</p>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6 pt-6">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">Customer Reviews</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-5 w-5 fill-primary text-primary" />
                        ))}
                      </div>
                      <span className="text-lg font-semibold">4.8</span>
                      <span className="text-sm text-muted-foreground">(127 reviews)</span>
                    </div>
                  </div>

                  <div className="grid gap-3 mb-6">
                    {[
                      { stars: 5, count: 98, percentage: 77 },
                      { stars: 4, count: 22, percentage: 17 },
                      { stars: 3, count: 5, percentage: 4 },
                      { stars: 2, count: 2, percentage: 2 },
                      { stars: 1, count: 0, percentage: 0 },
                    ].map(({ stars, count, percentage }) => (
                      <div key={stars} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-20">
                          <span className="text-sm font-medium">{stars}</span>
                          <Star className="h-3 w-3 fill-primary text-primary" />
                        </div>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-6">
                  {[
                    {
                      name: "Alex Martinez",
                      rating: 5,
                      date: "2 weeks ago",
                      title: "Exceptional quality and performance",
                      comment: "This asset exceeded my expectations! The quality of the models is outstanding, and the optimization is perfect for my game project. The textures are crisp and the poly count is just right for real-time rendering. Documentation was clear and helpful. Highly recommend!"
                    },
                    {
                      name: "Sarah Chen",
                      rating: 5,
                      date: "1 month ago",
                      title: "Perfect for my project needs",
                      comment: "Exactly what I was looking for. The asset integrates seamlessly with Unity and the PBR materials look amazing under different lighting conditions. Great value for money and the multiple LOD levels are a nice bonus."
                    },
                    {
                      name: "James Wilson",
                      rating: 4,
                      date: "1 month ago",
                      title: "Very good, minor suggestions",
                      comment: "Overall excellent asset. The models are high quality and well optimized. Would love to see even more texture variations in future updates. Still, this is a solid purchase and I'll definitely use it in my commercial project."
                    },
                    {
                      name: "Emily Rodriguez",
                      rating: 5,
                      date: "2 months ago",
                      title: "Game-changer for indie developers",
                      comment: "As a solo indie developer, finding assets of this quality at this price point is incredible. The artist clearly knows what game developers need. Everything is properly named, organized, and ready to use. Saved me weeks of work!"
                    },
                  ].map((review, index) => (
                    <Card key={index} className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold">{review.name}</p>
                          <p className="text-sm text-muted-foreground">{review.date}</p>
                        </div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`h-4 w-4 ${star <= review.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <h5 className="font-medium mb-2">{review.title}</h5>
                      <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-center pt-4">
                  <Button variant="outline">Load More Reviews</Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24 space-y-6">
              <div>
                {asset.category && (
                  <Badge className="mb-4">{asset.category.name}</Badge>
                )}
                <h1 className="text-3xl font-bold mb-2" data-testid="text-asset-title">
                  {asset.title}
                </h1>
                <p className="text-4xl font-bold text-primary mt-4" data-testid="text-asset-price">
                  ${asset.price}
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleAddToCart}
                  data-testid="button-add-to-cart"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  data-testid="button-share"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>

              <Separator />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium capitalize">{asset.category?.name || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Format</span>
                  <span className="font-medium">{asset.fileFormat}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Polygons</span>
                  <span className="font-medium">
                    {asset.polyCount?.toLocaleString() || 'N/A'}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Download className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Instant download after purchase</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileType className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Compatible with Unity & Unreal</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {showFullScreen && (
        <FullScreenViewer
          modelUrl={asset.modelUrl}
          assetTitle={asset.title}
          category={asset.category?.name || 'Unknown'}
          onClose={() => setShowFullScreen(false)}
        />
      )}
    </div>
  );
}
