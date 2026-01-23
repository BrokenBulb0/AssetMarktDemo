import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Image,
  Music,
  Film,
  Code,
  Sparkles,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import type { Category } from "@shared/schema";

const categoryIcons: Record<string, any> = {
  visual: Image,
  audio: Music,
  animation: Film,
  functional: Code,
  vfx: Sparkles,
};

const categoryColors: Record<string, string> = {
  visual: "from-primary/20 to-purple-500/20 border-primary/40 hover:border-primary hover:shadow-primary/30",
  audio: "from-purple-500/20 to-pink-500/20 border-purple-400/40 hover:border-purple-400 hover:shadow-purple-400/30",
  animation: "from-pink-500/20 to-primary/20 border-pink-400/40 hover:border-pink-400 hover:shadow-pink-400/30",
  functional: "from-blue-500/20 to-cyan-500/20 border-blue-400/40 hover:border-blue-400 hover:shadow-blue-400/30",
  vfx: "from-purple-600/20 to-primary/20 border-purple-500/40 hover:border-purple-500 hover:shadow-purple-500/30",
};

export function CategoryGrid() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const mouseRafRef = useRef<number | null>(null);

  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current !== null) return;
      if (!sectionRef.current) return;

      rafRef.current = requestAnimationFrame(() => {
        if (!sectionRef.current) return;
        const rect = sectionRef.current.getBoundingClientRect();
        const scrollProgress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        setParallaxOffset(scrollProgress * 50 - 25);
        rafRef.current = null;
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (mouseRafRef.current !== null) return;
      if (!sectionRef.current) return;

      mouseRafRef.current = requestAnimationFrame(() => {
        if (!sectionRef.current) return;
        const rect = sectionRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setMousePosition({ x, y });
        mouseRafRef.current = null;
      });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      if (mouseRafRef.current !== null) {
        cancelAnimationFrame(mouseRafRef.current);
      }
    };
  }, []);

  if (error) {
    return (
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-6 relative">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="p-12 bg-destructive/10 border-destructive/20">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Failed to Load Categories</h3>
              <p className="text-muted-foreground mb-6">
                We encountered an error while loading the categories. Please try refreshing the page.
              </p>
              <Link href="/browse">
                <Card className="inline-block p-4 hover-elevate active-elevate-2 cursor-pointer transition-all duration-300 group bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/30 hover:border-primary">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">Browse All Assets</span>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
                  </div>
                </Card>
              </Link>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-6 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-card/50 animate-pulse rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      ref={sectionRef} 
      className="py-24 relative overflow-hidden"
      style={{
        perspective: '1500px',
      }}
    >
      {/* Animated background layers */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background pointer-events-none transition-transform duration-100"
        style={{ transform: `translateY(${parallaxOffset}px)` }}
      />
      <div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(184,84,212,0.08),transparent_70%)] pointer-events-none transition-transform duration-100"
        style={{ 
          transform: `translateY(${parallaxOffset * -0.5}px) scale(${1 + parallaxOffset * 0.002})` 
        }}
      />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "4s" }} />
      <div className="absolute bottom-20 right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "5s", animationDelay: "1s" }} />

      <div 
        className="container mx-auto px-6 relative"
        style={{
          transform: `rotateX(${mousePosition.y * 1}deg) rotateY(${mousePosition.x * 1}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.3s ease-out',
        }}
      >
        {/* Header */}
        <div 
          className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700"
          style={{
            transform: 'translateZ(50px)',
          }}
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-400 to-pink-500 bg-clip-text text-transparent">
            Explore Categories
          </h2>
          <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
            Discover premium assets across Visual, Audio, Animation, Functional, and VFX categories
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories?.map((category, index) => {
            const Icon = categoryIcons[category.slug] || Image;
            const colorClasses = categoryColors[category.slug] || categoryColors.visual;
            
            return (
              <Link key={category.id} href={`/browse?categoryId=${category.id}`} data-testid={`card-category-${category.slug}`}>
                <Card 
                  className={`p-10 text-center hover-elevate active-elevate-2 cursor-pointer transition-all duration-500 group animate-in fade-in slide-in-from-bottom-8 relative overflow-hidden backdrop-blur-sm bg-gradient-to-br ${colorClasses} border-2`}
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    transform: `perspective(1000px) rotateX(${parallaxOffset * 0.3}deg) translateZ(${index * 10}px)`,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Animated gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                  
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl rounded-2xl" />

                  <div className="flex flex-col items-center gap-6 relative z-10">
                    {/* Icon container with 3D effect */}
                    <div 
                      className="p-6 rounded-2xl bg-background/50 backdrop-blur-sm group-hover:bg-background/70 transition-all duration-500 group-hover:scale-125 group-hover:rotate-6 shadow-2xl group-hover:shadow-primary/30"
                      style={{
                        transform: 'translateZ(30px)',
                      }}
                    >
                      <Icon className="h-12 w-12 text-primary transition-all duration-500 group-hover:scale-110 group-hover:rotate-12" />
                    </div>
                    
                    {/* Category info */}
                    <div 
                      className="space-y-2"
                      style={{
                        transform: 'translateZ(20px)',
                      }}
                    >
                      <h3 className="text-2xl font-bold group-hover:text-primary transition-colors duration-300">
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300 leading-relaxed px-4">
                        {category.description}
                      </p>
                    </div>

                    {/* Arrow indicator */}
                    <div 
                      className="flex items-center gap-2 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
                      style={{
                        transform: 'translateZ(15px)',
                      }}
                    >
                      <span>Explore</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>

                  {/* Decorative corner accent */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Card>
              </Link>
            );
          })}
        </div>

        {/* View All Categories Button */}
        <div 
          className="text-center mt-16 animate-in fade-in slide-in-from-bottom-4 duration-700"
          style={{ 
            animationDelay: `${(categories?.length || 0) * 100 + 200}ms`,
            transform: 'translateZ(40px)',
          }}
        >
          <Link href="/browse">
            <Card className="inline-block p-6 hover-elevate active-elevate-2 cursor-pointer transition-all duration-300 group bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/30 hover:border-primary hover:shadow-xl hover:shadow-primary/20">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">View All Assets</span>
                <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </section>
  );
}
