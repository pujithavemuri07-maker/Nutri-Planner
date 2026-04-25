import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, cartSubtotal, formatINR } from "@/hooks/use-cart";

export default function Cart() {
  const items = useCart((s) => s.items);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const subtotal = cartSubtotal(items);
  const deliveryFee = subtotal === 0 ? 0 : subtotal > 500 ? 0 : 30;
  const total = subtotal + deliveryFee;
  const [, navigate] = useLocation();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="font-serif text-3xl font-semibold mt-6">Your tiffin is empty</h1>
        <p className="text-muted-foreground mt-2">
          Browse the menu and pick something warm.
        </p>
        <Button className="mt-6" size="lg" onClick={() => navigate("/menu")}>
          Browse menu
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-serif text-4xl font-semibold mb-6">Your tiffin</h1>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        <ul className="space-y-3">
          {items.map((it, i) => (
            <motion.li
              key={it.dishId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              className="flex gap-4 p-4 rounded-2xl bg-card border border-card-border"
            >
              <Link href={`/dish/${it.dishId}`} className="h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-muted">
                {it.imageUrl ? (
                  <img src={it.imageUrl} alt={it.dishName} className="h-full w-full object-cover" />
                ) : null}
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/dish/${it.dishId}`} className="font-medium hover:underline">
                  {it.dishName}
                </Link>
                <div className="text-xs text-muted-foreground">by {it.chefName}</div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(it.dishId, it.quantity - 1)}
                    className="h-8 w-8 rounded-md border border-border hover:bg-muted flex items-center justify-center"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm">{it.quantity}</span>
                  <button
                    onClick={() => updateQuantity(it.dishId, it.quantity + 1)}
                    className="h-8 w-8 rounded-md border border-border hover:bg-muted flex items-center justify-center"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => removeItem(it.dishId)}
                    className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{formatINR(it.unitPrice * it.quantity)}</div>
                <div className="text-xs text-muted-foreground">
                  {formatINR(it.unitPrice)} each
                </div>
              </div>
            </motion.li>
          ))}
        </ul>

        <aside className="lg:sticky lg:top-20 h-fit p-6 rounded-2xl bg-card border border-card-border">
          <h2 className="font-serif text-xl font-semibold">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatINR(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd>{deliveryFee === 0 ? "Free" : formatINR(deliveryFee)}</dd>
            </div>
            <div className="border-t border-border pt-2 flex justify-between text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatINR(total)}</dd>
            </div>
          </dl>
          <Button className="w-full mt-5" size="lg" onClick={() => navigate("/checkout")}>
            Checkout
            <ArrowRight className="h-4 w-4" />
          </Button>
          {deliveryFee === 0 && subtotal > 0 ? (
            <p className="mt-3 text-xs text-secondary text-center">
              You unlocked free delivery
            </p>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground text-center">
              Add {formatINR(500 - subtotal)} more for free delivery
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
