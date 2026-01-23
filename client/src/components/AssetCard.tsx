import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Box } from "lucide-react";
import { useState, useRef } from "react";
import { ThreeScene } from "./ThreeScene";
import type { AssetWithCategory } from "@shared/schema";

interface AssetCardProps {
  asset: AssetWithCategory;
  onAddToCart?: (assetId: string) => void;
}

export function AssetCard({ asset, onAddToCart }: AssetCardProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Throttle updates using requestAnimationFrame for better performance
    if (rafRef.current !== null) return;
    
    const target = e.currentTarget;
    if (!target) return;
    
    rafRef.current = requestAnimationFrame(() => {
      const rect = target.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setTilt({ x: x * 10, y: y * -10 });
      }
      rafRef.current = null;
    });
  };

  const handleMouseLeave = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setTilt({ x: 0, y: 0 });
  };

  return (
    <Card 
      className="overflow-hidden group hover-elevate transition-all duration-300 animate-in fade-in" 
      data-testid={`card-asset-${asset.id}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) translateZ(10px)`,
        transition: 'transform 0.2s ease-out'
      }}
    >
      <div className="aspect-video bg-gradient-to-br from-background via-primary/5 to-background relative overflow-hidden border-b border-border/50">
        <Link href={`/asset/${asset.id}`}>
          <span className="block w-full h-full relative">
            <ThreeScene className="w-full h-full" animationType="cube" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
          </span>
        </Link>
        {asset.category && (
          <Badge className="absolute top-3 right-3 pointer-events-none backdrop-blur-sm bg-background/80 transition-all duration-300 group-hover:scale-110" data-testid={`badge-category-${asset.id}`}>
            {asset.category.name}
          </Badge>
        )}
        <div className="absolute bottom-3 left-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          {asset.fileFormat && (
            <Badge variant="secondary" className="backdrop-blur-sm bg-background/90 text-xs">
              {asset.fileFormat}
            </Badge>
          )}
        </div>
      </div>

      <div className="p-6 space-y-3 transition-all duration-300">
        <Link href={`/asset/${asset.id}`}>
          <h3 className="font-semibold text-lg hover:text-primary transition-all duration-200 line-clamp-1 group-hover:translate-x-1" data-testid={`text-title-${asset.id}`}>
            {asset.title}
          </h3>
        </Link>

        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed" data-testid={`text-description-${asset.id}`}>
          {asset.description}
        </p>

        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-primary transition-all duration-200 group-hover:scale-105" data-testid={`text-price-${asset.id}`}>
              ${asset.price}
            </span>
            {asset.polyCount && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Box className="h-3 w-3" />
                {asset.polyCount.toLocaleString()} polys
              </span>
            )}
          </div>

          <Button
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              onAddToCart?.(asset.id);
            }}
            className="transition-all duration-200 hover:scale-105"
            data-testid={`button-add-to-cart-${asset.id}`}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>

        {asset.tags && asset.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 opacity-80 group-hover:opacity-100 transition-opacity duration-200">
            {asset.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs transition-transform duration-200 hover:scale-105">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
