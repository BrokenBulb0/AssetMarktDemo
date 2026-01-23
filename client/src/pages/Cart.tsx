import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Loading } from "@/components/Loading";
import { ThreeSceneBackground } from "@/components/ThreeSceneBackground";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { CartItemWithAsset } from "@shared/schema";

export default function Cart() {
  const { toast } = useToast();

  const { data: cartItems, isLoading } = useQuery<CartItemWithAsset[]>({
    queryKey: ['/api/cart'],
  });

  const handleRemoveItem = async (assetId: string) => {
    try {
      const response = await fetch(`/api/cart/${assetId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove item');

      await queryClient.invalidateQueries({ queryKey: ['/api/cart'] });

      toast({
        title: "Removed from Cart",
        description: "Item has been removed from your cart",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    }
  };

  const subtotal = cartItems?.reduce(
    (sum, item) => sum + parseFloat(item.asset.price) * item.quantity,
    0
  ) || 0;

  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20 relative">
        <ThreeSceneBackground variant="cart" />
        <Card className="p-12 text-center max-w-md relative z-10">
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-muted rounded-full">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-3">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Browse our marketplace and discover amazing assets for your projects
          </p>
          <Link href="/browse">
            <Button size="lg" data-testid="button-browse-assets">
              Browse Assets
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 relative">
      <ThreeSceneBackground variant="cart" />
      <div className="container mx-auto px-6 relative z-10">
        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems?.map((item) => (
              <Card key={item.assetId} className="p-6" data-testid={`card-cart-item-${item.assetId}`}>
                <div className="flex gap-6">
                  <div className="w-32 h-32 bg-card rounded-lg overflow-hidden flex-shrink-0">
                    {item.asset.thumbnailUrl ? (
                      <img
                        src={item.asset.thumbnailUrl}
                        alt={item.asset.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/asset/${item.assetId}`}>
                        <h3 className="font-semibold text-lg hover:text-primary transition-colors" data-testid={`text-cart-item-title-${item.assetId}`}>
                          {item.asset.title}
                        </h3>
                      </Link>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <p className="text-2xl font-bold text-primary" data-testid={`text-cart-item-price-${item.assetId}`}>
                        ${item.asset.price}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.assetId)}
                        data-testid={`button-remove-${item.assetId}`}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24 space-y-6">
              <h2 className="text-2xl font-bold">Order Summary</h2>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium" data-testid="text-subtotal">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (10%)</span>
                  <span className="font-medium" data-testid="text-tax">
                    ${tax.toFixed(2)}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary" data-testid="text-total">
                  ${total.toFixed(2)}
                </span>
              </div>

              <Button className="w-full" size="lg" asChild data-testid="button-checkout">
                <Link href="/checkout">
                  Proceed to Checkout
                </Link>
              </Button>

              <Button className="w-full" size="lg" variant="outline" asChild data-testid="button-continue-shopping">
                <Link href="/browse">
                  Continue Shopping
                </Link>
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
