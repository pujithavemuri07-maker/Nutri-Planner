import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Truck, Banknote, Wallet, CreditCard, Building2 } from "lucide-react";
import { useCart, cartSubtotal, formatINR } from "@/hooks/use-cart";
import { useAuth } from "@/lib/auth";
import { useCreateOrder } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const PAY_METHODS = [
  { id: "cod", label: "Cash", Icon: Banknote },
  { id: "upi", label: "UPI", Icon: Wallet },
  { id: "card", label: "Card", Icon: CreditCard },
];

export default function Checkout() {
  const items = useCart((s) => s.items);
  const clearCart = useCart((s) => s.clearCart);
  const subtotal = cartSubtotal(items);
  const deliveryFee = subtotal > 500 ? 0 : 30;
  const total = subtotal + deliveryFee;
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const qc = useQueryClient();

  const [address, setAddress] = useState(user?.address ?? "");
  const [notes, setNotes] = useState("");
  const [isCorporate, setIsCorporate] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");
  const [pay, setPay] = useState("cod");

  const createOrder = useCreateOrder({
    mutation: {
      onSuccess: async (order) => {
        clearCart();
        await qc.invalidateQueries();
        toast.success("Order placed", {
          description: "Your home chef is preparing your meal.",
        });
        navigate(`/orders/${order.id}`);
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Could not place the order",
        );
      },
    },
  });

  const onSubmit = () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (!address.trim()) {
      toast.error("Please add a delivery address");
      return;
    }
    createOrder.mutate({
      data: {
        items: items.map((i) => ({ dishId: i.dishId, quantity: i.quantity })),
        address: address.trim(),
        notes: notes.trim() || undefined,
        isCorporate,
        scheduledFor: scheduledFor || undefined,
      },
    });
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="font-serif text-3xl font-semibold">Nothing to checkout</h1>
        <p className="text-muted-foreground mt-2">
          Add a dish from the menu first.
        </p>
        <Button className="mt-6" onClick={() => navigate("/menu")}>
          Browse menu
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-serif text-4xl font-semibold mb-2">Checkout</h1>
      <p className="text-muted-foreground mb-8">
        We'll send updates to {user?.phone}.
      </p>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-6">
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-card border border-card-border"
          >
            <h2 className="font-serif text-xl font-semibold mb-4">Delivery details</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="address">Delivery address</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House / flat, street, area, landmark, city"
                  rows={3}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes for the chef (optional)</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="No onion in dal, less spicy, ring the bell twice…"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="schedule">Schedule for later (optional)</Label>
                <Input
                  id="schedule"
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <label className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-secondary" />
                  <div>
                    <div className="text-sm font-medium">Corporate / office order</div>
                    <div className="text-xs text-muted-foreground">
                      Bill to office, single invoice
                    </div>
                  </div>
                </div>
                <Switch checked={isCorporate} onCheckedChange={setIsCorporate} />
              </label>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="p-6 rounded-2xl bg-card border border-card-border"
          >
            <h2 className="font-serif text-xl font-semibold mb-4">Payment method</h2>
            <div className="grid grid-cols-3 gap-3">
              {PAY_METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPay(m.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                    pay === m.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <m.Icon className="h-5 w-5" />
                  <div className="text-sm font-medium">{m.label}</div>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              For this demo, no real payment is captured.
            </p>
          </motion.section>
        </div>

        <aside className="lg:sticky lg:top-20 h-fit p-6 rounded-2xl bg-card border border-card-border">
          <h2 className="font-serif text-xl font-semibold">Summary</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {items.map((it) => (
              <li key={it.dishId} className="flex justify-between gap-2">
                <span className="truncate">
                  {it.quantity} × {it.dishName}
                </span>
                <span className="shrink-0">{formatINR(it.unitPrice * it.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 pt-4 border-t border-border space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatINR(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd>{deliveryFee === 0 ? "Free" : formatINR(deliveryFee)}</dd>
            </div>
            <div className="flex justify-between text-base font-semibold pt-1">
              <dt>Total</dt>
              <dd>{formatINR(total)}</dd>
            </div>
          </dl>

          <Button
            className="w-full mt-5"
            size="lg"
            onClick={onSubmit}
            disabled={createOrder.isPending}
          >
            {createOrder.isPending ? "Placing order…" : "Place order"}
          </Button>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Truck className="h-3.5 w-3.5" />
            Estimated delivery in 30-45 minutes
          </div>
        </aside>
      </div>
    </div>
  );
}
