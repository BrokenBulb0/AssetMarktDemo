import { Link } from "wouter";
import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Sparkles, Zap, Box } from "lucide-react";
import { ThreeSceneHero } from "./ThreeSceneHero";

export function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [searchValue, setSearchValue] = useState("");
  const heroRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const particles = useMemo(() => {
    return [...Array(20)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${2 + Math.random() * 3}s`,
    }));
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (rafRef.current !== null) return;
      if (!heroRef.current) return;

      rafRef.current = requestAnimationFrame(() => {
        if (!heroRef.current) return;
        const rect = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setMousePosition({ x, y });
        rafRef.current = null;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const handleSearch = () => {
    if (searchValue.trim()) {
      window.location.href = `/browse?search=${encodeURIComponent(searchValue)}`;
    } else {
      window.location.href = '/browse';
    }
  };

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        perspective: '1000px',
      }}
    >
      {/* Animated 3D Background */}
      <div className="absolute inset-0 z-0">
        <ThreeSceneHero className="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/50 to-background/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,10,10,0.9)_100%)]" />
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full animate-pulse"
            style={particle}
          />
        ))}
      </div>

      {/* Main Content with 3D transforms */}
      <div 
        className="container mx-auto px-6 relative z-10"
        style={{
          transform: `
            rotateX(${mousePosition.y * 2}deg) 
            rotateY(${mousePosition.x * 2}deg)
            translateZ(50px)
          `,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.3s ease-out',
        }}
      >
        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Headline with 3D depth */}
          <div 
            className="relative mt-8"
            style={{
              transform: 'translateZ(80px)',
              transformStyle: 'preserve-3d',
            }}
          >
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-1000 relative">
              <span className="inline-block">
                Create Beyond
              </span>
              <span className="block bg-gradient-to-r from-primary via-purple-400 to-pink-500 bg-clip-text text-transparent mt-3 animate-in fade-in slide-in-from-bottom-8 duration-1000 drop-shadow-2xl" style={{ animationDelay: "200ms" }}>
                Imagination
              </span>
            </h1>
            
            {/* Floating accent elements */}
            <div className="absolute -top-12 -right-12 opacity-50 animate-pulse" style={{ animationDelay: "1s", animationDuration: "3s" }}>
              <Sparkles className="w-12 h-12 text-primary" />
            </div>
            <div className="absolute -bottom-8 -left-8 opacity-50 animate-pulse" style={{ animationDelay: "1.5s", animationDuration: "4s" }}>
              <Zap className="w-10 h-10 text-purple-400" />
            </div>
          </div>

          {/* Subtitle with depth */}
          <div 
            style={{
              transform: 'translateZ(60px)',
            }}
          >
            <p className="text-lg md:text-2xl text-foreground/80 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 leading-relaxed" style={{ animationDelay: "400ms" }}>
              Premium game assets for
              <span className="text-primary font-semibold"> Visual</span>,
              <span className="text-purple-400 font-semibold"> Audio</span>,
              <span className="text-pink-400 font-semibold"> Animation</span>, and
              <span className="text-primary font-semibold"> VFX</span>
            </p>
          </div>

          {/* Interactive Search Bar with 3D lift */}
          <div 
            className="flex flex-col sm:flex-row gap-4 items-center justify-center max-w-3xl mx-auto pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700"
            style={{ 
              animationDelay: "600ms",
              transform: 'translateZ(70px)',
            }}
          >
            <div className="relative flex-1 w-full group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground transition-all duration-300 group-focus-within:text-primary group-focus-within:scale-110 z-10" />
              <Input
                type="search"
                placeholder="Search thousands of premium assets..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-14 h-16 text-lg bg-background/90 backdrop-blur-xl border-2 border-border/50 transition-all duration-300 focus:border-primary focus:bg-background/95 focus:shadow-2xl focus:shadow-primary/20 hover:border-primary/50 relative"
                data-testid="input-hero-search"
              />
            </div>
            <Button 
              size="lg" 
              onClick={handleSearch}
              className="h-16 px-10 whitespace-nowrap group transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/30 bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-primary text-lg font-semibold" 
              data-testid="button-hero-search"
            >
              <Search className="mr-2 h-5 w-5" />
              Search
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          {/* Stats Cards with 3D layers */}
          <div 
            className="flex flex-wrap gap-4 items-center justify-center pt-6 text-sm animate-in fade-in slide-in-from-bottom-4 duration-700"
            style={{ 
              animationDelay: "800ms",
              transform: 'translateZ(50px)',
            }}
          >
            <Link href="/browse?categoryId=cat-visual">
              <div className="group cursor-pointer flex items-center gap-3 hover:scale-110 transition-all duration-300 backdrop-blur-xl bg-gradient-to-br from-primary/10 to-purple-500/10 px-6 py-4 rounded-2xl border border-primary/30 hover:border-primary hover:shadow-xl hover:shadow-primary/20">
                <Box className="w-8 h-8 text-primary group-hover:rotate-12 transition-transform duration-300" />
                <div className="text-left">
                  <div className="text-2xl font-bold text-foreground">1,400+</div>
                  <div className="text-muted-foreground font-medium">Visual Assets</div>
                </div>
              </div>
            </Link>

            <Link href="/browse?categoryId=cat-audio">
              <div className="group cursor-pointer flex items-center gap-3 hover:scale-110 transition-all duration-300 backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 px-6 py-4 rounded-2xl border border-purple-400/30 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-400/20">
                <Sparkles className="w-8 h-8 text-purple-400 group-hover:rotate-12 transition-transform duration-300" />
                <div className="text-left">
                  <div className="text-2xl font-bold text-foreground">500+</div>
                  <div className="text-muted-foreground font-medium">Audio Tracks</div>
                </div>
              </div>
            </Link>

            <Link href="/browse?categoryId=cat-vfx">
              <div className="group cursor-pointer flex items-center gap-3 hover:scale-110 transition-all duration-300 backdrop-blur-xl bg-gradient-to-br from-pink-500/10 to-primary/10 px-6 py-4 rounded-2xl border border-pink-400/30 hover:border-pink-400 hover:shadow-xl hover:shadow-pink-400/20">
                <Zap className="w-8 h-8 text-pink-400 group-hover:rotate-12 transition-transform duration-300" />
                <div className="text-left">
                  <div className="text-2xl font-bold text-foreground">250+</div>
                  <div className="text-muted-foreground font-medium">VFX Packs</div>
                </div>
              </div>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
