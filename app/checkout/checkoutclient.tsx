"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  CircleNotchIcon,
  CreditCardIcon,
  MapPinIcon,
  PlusIcon,
  CheckIcon,
  HouseIcon,
  PencilSimpleIcon,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { getCart, createOrder } from "@/components/actions";
import { getAccountData, addAddress } from "@/app/account/actions";
import { usePreferences } from "@/components/preferences";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Address {
  _id: string;
  label?: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

interface CartItem {
  _id: string;
  quantity: number;
  product: {
    name: string;
    price: number;
  };
}

const DEFAULT_NEW_ADDRESS = {
  label: "",
  street: "",
  city: "",
  state: "",
  zip: "",
  country: "",
  isDefault: false,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CheckoutClient() {
  const router = useRouter();
  const { formatPrice } = usePreferences();

  const [cart, setCart] = useState<any>(null);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );

  // "Add new address" dialog
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState(DEFAULT_NEW_ADDRESS);

  // Contact info (always required)
  const [contactForm, setContactForm] = useState({
    fullName: "",
    email: "",
  });

  // ─── Data fetching ──────────────────────────────────────────────────────────

  const fetchCart = useCallback(async () => {
    try {
      const cartData = await getCart();
      setCart(cartData);
    } catch (error) {
      console.error("Failed to fetch cart", error);
    } finally {
      setIsLoadingCart(false);
    }
  }, []);

  const fetchAddresses = useCallback(async () => {
    const data = await getAccountData();
    if (data?.shippingAddresses?.length) {
      setSavedAddresses(data.shippingAddresses);
      // Pre-select the default address, or the first one
      const defaultAddr =
        data.shippingAddresses.find((a: Address) => a.isDefault) ||
        data.shippingAddresses[0];
      setSelectedAddressId(defaultAddr._id);
    }
    // Pre-fill contact info from account
    if (data?.fullname)
      setContactForm((prev) => ({ ...prev, fullName: data.fullname }));
    if (data?.email) setContactForm((prev) => ({ ...prev, email: data.email }));
  }, []);

  useEffect(() => {
    fetchCart();
    fetchAddresses();
    window.addEventListener("cart-updated", fetchCart);
    return () => window.removeEventListener("cart-updated", fetchCart);
  }, [fetchCart, fetchAddresses]);

  // ─── Add new address ────────────────────────────────────────────────────────

  const handleNewAddressSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAddress(true);

    const result = await addAddress(newAddressForm);

    if (result.success) {
      toast.success("Address added");
      // Re-fetch so we get the new address with its _id
      const data = await getAccountData();
      if (data?.shippingAddresses) {
        setSavedAddresses(data.shippingAddresses);
        // Select the newly added address (last in array)
        const added = data.shippingAddresses[data.shippingAddresses.length - 1];
        setSelectedAddressId(added._id);
      }
      setIsAddressDialogOpen(false);
      setNewAddressForm(DEFAULT_NEW_ADDRESS);
    } else {
      toast.error(result.error || "Failed to add address");
    }

    setIsSavingAddress(false);
  };

  // ─── Checkout submit ────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedAddress = savedAddresses.find(
      (a) => a._id === selectedAddressId,
    );
    if (!selectedAddress) {
      toast.error("Please select a shipping address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        shippingAddress: {
          fullname: contactForm.fullName,
          email: contactForm.email,
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.zip,
          country: selectedAddress.country,
        },
      };

      const result = await createOrder(orderData);

      if (result.success && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        toast.error(
          result.error || "Failed to create order. Please try again.",
        );
        setIsSubmitting(false);
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  // ─── Loading ────────────────────────────────────────────────────────────────

  if (isLoadingCart) {
    return (
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center">
        <CircleNotchIcon className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const cartItems: CartItem[] =
    cart?.items?.filter((item: any) => item.product) || [];
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0,
  );
  const total = subtotal;

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-screen flex-1 flex-col">
        <div className="container mx-auto flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
          <div className="mb-4 rounded-full bg-secondary p-6">
            <CreditCardIcon className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">Your cart is empty</h1>
          <p className="mb-8 text-muted-foreground">
            Add some items to your cart to proceed to checkout.
          </p>
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1">
      <div className="flex min-h-screen flex-col bg-gray-50/50 dark:bg-background">
        <main className="container mx-auto flex-1 px-6 py-10">
          {/* Breadcrumb */}
          <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/cart" className="hover:text-foreground">
              Cart
            </Link>
            <span>/</span>
            <span className="font-medium text-foreground">Checkout</span>
          </div>

          <form id="checkout-form" onSubmit={handleSubmit}>
            <div className="grid gap-8 lg:grid-cols-12">
              {/* ── Left column ── */}
              <div className="space-y-6 lg:col-span-7">
                {/* Contact Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCardIcon className="h-5 w-5" />
                      Contact Information
                    </CardTitle>
                    <CardDescription>Used for order updates</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        required
                        placeholder="John Doe"
                        value={contactForm.fullName}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            fullName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={contactForm.email}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Address Selection */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MapPinIcon className="h-5 w-5" />
                        Shipping Address
                      </CardTitle>
                      <CardDescription>Select a saved address</CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddressDialogOpen(true)}
                    >
                      <PlusIcon className="mr-2 h-4 w-4" />
                      New Address
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {savedAddresses.length === 0 ? (
                      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
                        <MapPinIcon className="mb-3 h-8 w-8 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">
                          No saved addresses yet.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={() => setIsAddressDialogOpen(true)}
                        >
                          <PlusIcon className="mr-2 h-4 w-4" />
                          Add an Address
                        </Button>
                      </div>
                    ) : (
                      savedAddresses.map((address) => {
                        const isSelected = selectedAddressId === address._id;
                        return (
                          <button
                            key={address._id}
                            type="button"
                            onClick={() => setSelectedAddressId(address._id)}
                            className={cn(
                              "w-full rounded-lg border p-4 text-left transition-all",
                              isSelected
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "hover:border-muted-foreground/40",
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div
                                  className={cn(
                                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                                    isSelected
                                      ? "border-primary bg-primary"
                                      : "border-muted-foreground/40",
                                  )}
                                >
                                  {isSelected && (
                                    <CheckIcon className="h-3 w-3 text-primary-foreground" />
                                  )}
                                </div>
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <HouseIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-sm font-medium">
                                      {address.label || "Address"}
                                    </span>
                                    {address.isDefault && (
                                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {address.street}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {address.city}, {address.state}{" "}
                                    {address.zip}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {address.country}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* ── Right column: Order Summary ── */}
              <div className="lg:col-span-5">
                <div className="sticky top-24">
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        {cartItems.map((item) => (
                          <div
                            key={item._id}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-muted-foreground">
                              {item.quantity} × {item.product.name}
                            </span>
                            <span className="font-medium">
                              {formatPrice(item.product.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <Separator />
                      {/* <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div> */}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="text-green-600 font-medium">Free</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>{formatPrice(total)}</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        type="submit"
                        form="checkout-form"
                        disabled={isSubmitting || savedAddresses.length === 0}
                      >
                        {isSubmitting ? (
                          <CircleNotchIcon className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CreditCardIcon className="mr-2 h-4 w-4" />
                        )}
                        {isSubmitting ? "Processing..." : "Proceed to Payment"}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </div>
          </form>
        </main>
      </div>

      {/* ── Add New Address Dialog ── */}
      <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
            <DialogDescription>
              This address will be saved to your account.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleNewAddressSave}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="new-label">Label (e.g. Home, Work)</Label>
                <Input
                  id="new-label"
                  placeholder="Home"
                  value={newAddressForm.label}
                  onChange={(e) =>
                    setNewAddressForm({
                      ...newAddressForm,
                      label: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-street">Street Address</Label>
                <Input
                  id="new-street"
                  required
                  placeholder="123 Main St"
                  value={newAddressForm.street}
                  onChange={(e) =>
                    setNewAddressForm({
                      ...newAddressForm,
                      street: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="new-city">City</Label>
                  <Input
                    id="new-city"
                    required
                    value={newAddressForm.city}
                    onChange={(e) =>
                      setNewAddressForm({
                        ...newAddressForm,
                        city: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-state">State</Label>
                  <Input
                    id="new-state"
                    required
                    value={newAddressForm.state}
                    onChange={(e) =>
                      setNewAddressForm({
                        ...newAddressForm,
                        state: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="new-zip">Zip Code</Label>
                  <Input
                    id="new-zip"
                    required
                    value={newAddressForm.zip}
                    onChange={(e) =>
                      setNewAddressForm({
                        ...newAddressForm,
                        zip: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-country">Country</Label>
                  <Input
                    id="new-country"
                    required
                    value={newAddressForm.country}
                    onChange={(e) =>
                      setNewAddressForm({
                        ...newAddressForm,
                        country: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="new-isDefault"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={newAddressForm.isDefault}
                  onChange={(e) =>
                    setNewAddressForm({
                      ...newAddressForm,
                      isDefault: e.target.checked,
                    })
                  }
                />
                <Label htmlFor="new-isDefault">Set as default address</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddressDialogOpen(false)}
                disabled={isSavingAddress}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSavingAddress}>
                {isSavingAddress ? (
                  <CircleNotchIcon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <PlusIcon className="mr-2 h-4 w-4" />
                )}
                Save Address
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
