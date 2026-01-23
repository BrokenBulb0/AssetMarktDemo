import { Switch, Route } from "wouter";
import { useState, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Loading } from "@/components/Loading";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import type { CartItemWithAsset } from "@shared/schema";

// Code splitting for better performance
const Home = lazy(() => import("@/pages/Home"));
const Browse = lazy(() => import("@/pages/Browse"));
const AssetDetail = lazy(() => import("@/pages/AssetDetail"));
const Cart = lazy(() => import("@/pages/Cart"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const Login = lazy(() => import("@/pages/Login"));
const NotFound = lazy(() => import("@/pages/not-found"));

function Router() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: cartItems } = useQuery<CartItemWithAsset[]>({
    queryKey: ['/api/cart'],
  });

  const cartItemCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartItemCount={cartItemCount} onSearchChange={setSearchQuery} />
      <Suspense fallback={<Loading fullScreen />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/browse" component={Browse} />
          <Route path="/asset/:id" component={AssetDetail} />
          <Route path="/cart" component={Cart} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/login" component={Login} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider defaultTheme="dark">
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
