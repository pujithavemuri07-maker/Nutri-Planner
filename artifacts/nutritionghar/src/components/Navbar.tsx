import { Link, useLocation } from "wouter";
import { useState } from "react";
import {
  ShoppingBag,
  Menu as MenuIcon,
  X,
  ChefHat,
  User as UserIcon,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCart, cartCount } from "@/hooks/use-cart";
import { useLogout } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CartSheet } from "@/components/CartSheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        active
          ? "text-primary bg-primary/5"
          : "text-foreground/70 hover:text-foreground hover:bg-muted"
      }`}
    >
      {label}
    </Link>
  );
}

export function Navbar() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const items = useCart((s) => s.items);
  const count = cartCount(items);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const qc = useQueryClient();

  const logoutMutation = useLogout({
    mutation: {
      onSuccess: async () => {
        await qc.invalidateQueries();
        navigate("/");
      },
    },
  });

  const isChef = user?.role === "chef";

  const customerLinks = [
    { href: "/", label: "Home" },
    { href: "/menu", label: "Menu" },
    { href: "/subscriptions", label: "Subscriptions" },
    ...(user ? [{ href: "/orders", label: "My Orders" }] : []),
  ];

  const chefLinks = [
    { href: "/chef", label: "Dashboard" },
    { href: "/chef/dishes", label: "My Dishes" },
    { href: "/chef/orders", label: "Orders" },
  ];

  const links = isChef ? chefLinks : customerLinks;

  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href={isChef ? "/chef" : "/"} className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <ChefHat className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <div className="font-serif text-lg font-semibold text-foreground">
              NutritionGhar
            </div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground -mt-0.5">
              Healthy. Homemade. Heartfelt.
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.href}
              href={l.href}
              label={l.label}
              active={location === l.href || (l.href !== "/" && location.startsWith(l.href))}
            />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {!isChef && (
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-md hover:bg-muted transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[11px] font-semibold text-primary-foreground flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <UserIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-muted-foreground">{user.phone}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  Profile
                </DropdownMenuItem>
                {!isChef && (
                  <DropdownMenuItem onClick={() => navigate("/orders")}>
                    My Orders
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={() => navigate("/login")}>
              Sign in
            </Button>
          )}

          <button
            className="md:hidden p-2 rounded-md hover:bg-muted"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-3 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 rounded-md text-sm font-medium text-foreground/80 hover:bg-muted"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  );
}
