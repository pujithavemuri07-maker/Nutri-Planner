import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Package,
  Flame,
  Bike,
  Check,
  Phone,
  MapPin,
  StickyNote,
} from "lucide-react";
import {
  useGetOrder,
  getGetOrderQueryKey,
  type OrderStatus,
} from "@workspace/api-client-react";
import { formatINR } from "@/hooks/use-cart";

const STEPS: { id: OrderStatus; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "placed", label: "Order placed", Icon: Package },
  { id: "preparing", label: "Cooking fresh", Icon: Flame },
  { id: "out_for_delivery", label: "On the way", Icon: Bike },
  { id: "delivered", label: "Delivered", Icon: Check },
];

export default function OrderDetail() {
  const [, params] = useRoute("/orders/:id");
  const id = params?.id ?? "";
  const { data: order, isLoading } = useGetOrder(id, {
    query: {
      queryKey: getGetOrderQueryKey(id),
      enabled: !!id,
      refetchInterval: 8000,
    },
  });

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  if (isLoading || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="h-12 w-1/2 bg-muted animate-pulse rounded" />
        <div className="mt-6 h-40 bg-muted animate-pulse rounded-2xl" />
      </div>
    );
  }

  const currentIdx = STEPS.findIndex((s) => s.id === order.status);
  const placedAt = new Date(order.placedAt).getTime();
  const eta = placedAt + order.estimatedMinutes * 60_000;
  const minsLeft = Math.max(0, Math.round((eta - now) / 60_000));
  const isCancelled = order.status === "cancelled";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/orders"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> All orders
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-serif text-3xl font-semibold">
          Order #{order.id.slice(0, 8)}
        </h1>
        <div className="text-sm text-muted-foreground mt-1">
          from {order.kitchenName ?? order.chefName}
        </div>
      </motion.div>

      {!isCancelled ? (
        <div className="p-6 rounded-2xl bg-card border border-card-border mb-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Estimated arrival
              </div>
              <div className="font-serif text-2xl font-semibold">
                {order.status === "delivered"
                  ? "Delivered"
                  : minsLeft <= 0
                    ? "Any minute now"
                    : `${minsLeft} min`}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Placed at{" "}
              {new Date(order.placedAt).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>

          <ol className="relative grid grid-cols-4 gap-2">
            {STEPS.map((s, i) => {
              const reached = i <= currentIdx;
              const active = i === currentIdx;
              return (
                <li key={s.id} className="relative flex flex-col items-center text-center">
                  {i > 0 && (
                    <div
                      className={`absolute top-5 right-1/2 w-full h-0.5 -z-0 ${
                        reached ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                  <motion.div
                    initial={false}
                    animate={{
                      scale: active ? 1.1 : 1,
                      backgroundColor: reached ? "hsl(var(--primary))" : "hsl(var(--muted))",
                      color: reached ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                    }}
                    className="relative z-10 h-10 w-10 rounded-full flex items-center justify-center"
                  >
                    <s.Icon className="h-5 w-5" />
                  </motion.div>
                  <div className={`mt-2 text-xs font-medium ${reached ? "text-foreground" : "text-muted-foreground"}`}>
                    {s.label}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/30 mb-6 text-destructive">
          This order was cancelled.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="p-5 rounded-2xl bg-card border border-card-border">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Your home chef
          </div>
          <div className="font-medium">{order.chefName}</div>
          {order.kitchenName && (
            <div className="text-sm text-muted-foreground">{order.kitchenName}</div>
          )}
        </div>
        <div className="p-5 rounded-2xl bg-card border border-card-border">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-2">
            <MapPin className="h-3.5 w-3.5" /> Delivery to
          </div>
          <div className="text-sm">{order.address}</div>
          <a
            href={`tel:${order.customerPhone}`}
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <Phone className="h-3.5 w-3.5" /> {order.customerPhone}
          </a>
        </div>
      </div>

      {order.notes && (
        <div className="p-5 rounded-2xl bg-accent/10 border border-accent/30 mb-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-accent-foreground mb-1.5">
            <StickyNote className="h-3.5 w-3.5" /> Note for chef
          </div>
          <div className="text-sm">{order.notes}</div>
        </div>
      )}

      <div className="p-6 rounded-2xl bg-card border border-card-border">
        <h2 className="font-serif text-xl font-semibold mb-4">Items</h2>
        <ul className="space-y-2 text-sm">
          {order.items.map((it) => (
            <li key={it.dishId} className="flex justify-between">
              <span>
                {it.quantity} × {it.dishName}
              </span>
              <span>{formatINR(it.unitPrice * it.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 pt-4 border-t border-border space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{formatINR(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Delivery</dt>
            <dd>{order.deliveryFee === 0 ? "Free" : formatINR(order.deliveryFee)}</dd>
          </div>
          <div className="flex justify-between text-base font-semibold pt-1">
            <dt>Total paid</dt>
            <dd>{formatINR(order.total)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
