"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBagIcon,
  UserIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  EqualsIcon,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getCart, removeFromCart, logoutAction } from "./actions";
import { toast } from "sonner";

export default function NavClient({ isLoggedIn }: { isLoggedIn: boolean }) {
  const route = useRouter();
  const pathname = usePathname();
  const [cart, setCart] = React.useState<any>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "LuxeComm";

  const routes = [
    { href: "/products", label: "Products" },
    { href: "/categories", label: "Categories" },
  ];

  const fetchCart = React.useCallback(async () => {
    const cartData = await getCart();
    setCart(cartData);
  }, []);

  React.useEffect(() => {
    fetchCart();
    window.addEventListener("cart-updated", fetchCart);
    return () => window.removeEventListener("cart-updated", fetchCart);
  }, [fetchCart]);

  const handleRemoveItem = async (productId: string) => {
    const result = await removeFromCart(productId);
    if (result.success) {
      toast.success(result.message);
      window.dispatchEvent(new Event("cart-updated"));
    } else {
      toast.error(result.message);
    }
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (searchQuery.trim()) {
        route.push(
          `/products?search=${encodeURIComponent(searchQuery.trim())}`,
        );
      }
    }
  };

  const cartItems = cart?.items?.filter((item: any) => item.product) || [];
  const cartTotal = cartItems.reduce(
    (acc: number, item: any) => acc + item.product.price * item.quantity,
    0,
  );
  const cartCount = cartItems.reduce(
    (acc: number, item: any) => acc + item.quantity,
    0,
  );

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="mr-4 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <EqualsIcon className="size-7" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <div className="px-7">
                <Link href="/" className="flex items-center">
                  <span className="text-xl font-bold">{brandName}</span>
                </Link>
              </div>
              <div className="mt-4 flex flex-col gap-4 px-7 py-4">
                {routes.map((route) => (
                  <SheetClose asChild key={route.label}>
                    <Link
                      href={route.href}
                      className={`hover:text-primary text-sm font-medium transition-colors ${
                        pathname === route.href
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {route.label}
                    </Link>
                  </SheetClose>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex flex-1 items-center justify-end">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="hidden text-xl font-bold sm:inline-block">
                {brandName}
              </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {routes.map((route) => (
                <Link
                  key={route.label}
                  href={route.href}
                  className={`hover:text-foreground/80 transition-colors ${
                    pathname === route.href
                      ? "text-foreground"
                      : "text-foreground/60"
                  }`}
                >
                  {route.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="flex-1 md:w-auto md:flex-none">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                />
              </div>
            </div>
            <div className="items-cente flex gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    onClick={fetchCart}
                  >
                    <ShoppingBagIcon className="size-6" />
                    {cartCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full p-0 text-[10px]">
                        {cartCount}
                      </Badge>
                    )}
                    <span className="sr-only">Cart</span>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="flex w-full flex-col sm:max-w-lg"
                >
                  <SheetHeader>
                    <SheetTitle>Shopping Cart ({cartCount})</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="flex-1">
                    {cartItems.length === 0 ? (
                      <div className="text-muted-foreground flex h-full flex-col items-center justify-center space-y-2 px-4 py-6">
                        <ShoppingBagIcon className="h-12 w-12 opacity-20" />
                        <p>Your cart is empty</p>
                      </div>
                    ) : (
                      <div className="space-y-6 px-4 py-6">
                        {cartItems.map((item: any) => (
                          <div
                            key={item._id}
                            className="flex items-start gap-4"
                          >
                            <div className="bg-secondary relative h-20 w-20 overflow-hidden rounded-md border">
                              {item.product.images?.[0]?.url && (
                                <img
                                  src={item.product.images[0].url}
                                  alt={item.product.name}
                                  className="h-full w-full object-cover"
                                />
                              )}
                            </div>
                            <div className="flex flex-1 flex-col gap-1">
                              <h4 className="font-medium">
                                {item.product.name}
                              </h4>
                              <p className="text-muted-foreground text-sm">
                                Qty: {item.quantity} × $
                                {item.product.price.toFixed(2)}
                              </p>
                              <p className="font-medium">
                                $
                                {(item.product.price * item.quantity).toFixed(
                                  2,
                                )}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-destructive h-8 w-8"
                              onClick={() => handleRemoveItem(item.product._id)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                  {cartItems.length > 0 && (
                    <div className="border-t pt-6">
                      <div className="mb-4 flex items-center justify-between px-4 font-medium">
                        <span>Total</span>
                        <span>${cartTotal.toFixed(2)}</span>
                      </div>
                      <SheetClose asChild>
                        <Button className="w-full" asChild>
                          <Link href="/checkout">Checkout</Link>
                        </Button>
                      </SheetClose>
                    </div>
                  )}
                </SheetContent>
              </Sheet>

              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <UserIcon className="size-6" />
                      <span className="sr-only">User</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => route.push("/account")}>
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => route.push("/orders")}>
                      Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => route.push("/account")}>
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logoutAction()}>
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/login">
                    <UserIcon className="size-6" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
