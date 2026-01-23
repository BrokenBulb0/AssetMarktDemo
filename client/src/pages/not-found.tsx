import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import { ThreeSceneBackground } from "@/components/ThreeSceneBackground";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      <ThreeSceneBackground variant="cart" />
      <Card className="w-full max-w-lg mx-4 p-12 text-center relative z-10 backdrop-blur-xl bg-background/80 border-border/50">
        <div className="flex justify-center mb-6">
          <div className="p-6 bg-destructive/10 rounded-full">
            <AlertCircle className="h-16 w-16 text-destructive" />
          </div>
        </div>
        
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-destructive to-primary bg-clip-text text-transparent">
          404
        </h1>
        
        <h2 className="text-2xl font-semibold mb-3">Page Not Found</h2>
        
        <p className="text-muted-foreground mb-8 leading-relaxed">
          The asset you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto" data-testid="button-home">
              <Home className="h-5 w-5 mr-2" />
              Go Home
            </Button>
          </Link>
          <Link href="/browse">
            <Button size="lg" variant="outline" className="w-full sm:w-auto" data-testid="button-browse">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Browse Assets
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
