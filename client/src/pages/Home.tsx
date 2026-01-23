import { useQuery } from "@tanstack/react-query";
import { Hero } from "@/components/Hero";
import { CategoryGrid } from "@/components/CategoryGrid";
import { AssetCard } from "@/components/AssetCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { AssetWithCategory } from "@shared/schema";

import { SEO } from "@/components/SEO";

export default function Home() {
  const { toast } = useToast();

  const { data: featuredResponse, isLoading } = useQuery<{ assets: AssetWithCategory[], pagination: any }>({
    queryKey: ['/api/assets', { featured: 'true', limit: '8' }],
  });

  const featuredAssets = featuredResponse?.assets || [];

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

  return (
    <div className="min-h-screen">
      <SEO />
      <Hero />

      <CategoryGrid />

      <section className="py-20 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "4s" }} />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "5s", animationDelay: "1s" }} />
        </div>
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 sm:mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent animate-in">
                Featured Assets
              </h2>
              <p className="text-muted-foreground text-sm sm:text-lg">
                Hand-picked premium assets for your next project
              </p>
            </div>
            <Link href="/browse">
              <Button variant="outline" size="lg" className="group w-full sm:w-auto" data-testid="button-view-all">
                View All
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-96 bg-card animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {featuredAssets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 pointer-events-none" />
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "6s" }} />
        </div>
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-purple-300 to-primary bg-clip-text text-transparent">
              Ready to Create?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground px-4">
              Join thousands of game developers building with WindSand assets
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Link href="/browse" className="w-full sm:w-auto">
                <Button size="lg" className="group transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-primary/20 w-full sm:w-auto" data-testid="button-start-browsing">
                  Start Browsing
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
