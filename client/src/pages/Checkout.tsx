import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Loading } from "@/components/Loading";
import { ThreeSceneBackground } from "@/components/ThreeSceneBackground";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ShoppingBag, CreditCard, User, Mail, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CartItemWithAsset } from "@shared/schema";

export default function Checkout() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const { data: cartItems, isLoading } = useQuery<CartItemWithAsset[]>({
    queryKey: ['/api/cart'],
  });

  const subtotal = cartItems?.reduce(
    (sum, item) => sum + parseFloat(item.asset.price) * item.quantity,
    0
  ) || 0;

  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsProcessing(false);
    setOrderComplete(true);

    toast({
      title: "Order Placed Successfully!",
      description: "Thank you for your purchase. Check your email for details.",
    });
  };

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
            Add items to your cart before checking out
          </p>
          <Button size="lg" asChild data-testid="button-browse-assets">
            <Link href="/browse">
              Browse Assets
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20 relative">
        <ThreeSceneBackground variant="cart" />
        <Card className="p-12 text-center max-w-md relative z-10">
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-primary/10 rounded-full">
              <CheckCircle2 className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-3">Order Complete!</h2>
          <p className="text-muted-foreground mb-2">
            Your order has been placed successfully.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Order confirmation sent to your email.
          </p>
          <div className="space-y-3">
            <Link href="/browse">
              <Button size="lg" className="w-full" data-testid="button-continue-shopping">
                Continue Shopping
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="w-full" data-testid="button-go-home">
                Go to Home
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 relative">
      <ThreeSceneBackground variant="cart" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Checkout</h1>
          <p className="text-muted-foreground mb-8">Complete your order</p>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handlePlaceOrder} className="space-y-6">
                {/* Contact Information */}
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <User className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Contact Information</h2>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        required
                        data-testid="input-first-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        required
                        data-testid="input-last-name"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        required
                        data-testid="input-email"
                      />
                    </div>
                  </div>
                </Card>

                {/* Billing Address */}
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <MapPin className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Billing Address</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        placeholder="123 Main St"
                        required
                        data-testid="input-address"
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          placeholder="New York"
                          required
                          data-testid="input-city"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input
                          id="zip"
                          placeholder="10001"
                          required
                          data-testid="input-zip"
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Payment Information (Demo Only) */}
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Payment Information</h2>
                  </div>
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
                    <p className="text-sm text-primary font-medium">
                      Demo Mode - No payment will be processed
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This is a demonstration checkout. Enter any values.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="4242 4242 4242 4242"
                        required
                        data-testid="input-card-number"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          required
                          data-testid="input-expiry"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvc">CVC</Label>
                        <Input
                          id="cvc"
                          placeholder="123"
                          required
                          data-testid="input-cvc"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24 space-y-6">
                <h2 className="text-2xl font-bold">Order Summary</h2>

                <Separator />

                <div className="space-y-4">
                  {cartItems?.map((item) => (
                    <div key={item.assetId} className="flex justify-between text-sm">
                      <div className="flex-1">
                        <p className="font-medium">{item.asset.title}</p>
                        <p className="text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">${item.asset.price}</p>
                    </div>
                  ))}
                </div>

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

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isProcessing}
                  onClick={handlePlaceOrder}
                  data-testid="button-place-order"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-background border-t-transparent rounded-full mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Place Order
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Demo mode - No actual charges will be made
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
