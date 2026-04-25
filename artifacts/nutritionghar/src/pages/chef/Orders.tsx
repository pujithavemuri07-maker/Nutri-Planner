import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Inbox, ChefHat, Bike, Check, X } from "lucide-react";
import {
  useListChefOrders,
  useUpdateOrderStatus,
  getListChefOrdersQueryKey,
  getGetChefStatsQueryKey,
  type Order,
  type OrderStatus,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/hooks/use-cart";
import { toast } from "sonner";

const NEXT: Record<OrderStatus, { next?: OrderStatus; label?: string; Icon?: React.ComponentType<{ className?: string }> }> = {
  placed: { next: "preparing", label: "Start cooking", Icon: ChefHat },
  preparing: { next: "out_for_delivery", label: "Send for delivery", Icon: Bike },
  out_for_delivery: { next: "delivered", label: "Mark delivered", Icon: Check },
  delivered: {},
  cancelled: {},
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: "New",
  preparing: "Cooking",
  out_for_delivery: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_TONE: Record<OrderStatus, string> = {
  placed: "bg-accent/30 text-accent-foreground",
  preparing: "bg-primary/15 text-primary",
  out_for_delivery: "bg-secondary/20 text-secondary",
  delivered: "bg-secondary/20 text-secondary",
  cancelled: "bg-destructive/15 text-destructive",
};

export default function ChefOrders() {
  const { data, isLoading } = useListChefOrders();
  const qc = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);

  const update = useUpdateOrderStatus({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListChefOrdersQueryKey() });
        qc.invalidateQueries({ queryKey: getGetChefStatsQueryKey() });
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update"),
      onSettled: () => setBusyId(null),
    },
  });

  const advance = (o: Order, status: OrderStatus) => {
    setBusyId(o.id);
    update.mutate({ id: o.id, data: { status } });
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const groups: Record<string, Order[]> = {
    active: [],
    delivered: [],
  };
  for (const o of data ?? []) {
    if (o.status === "delivered" || o.status === "cancelled") groups.delivered.push(o);
    else groups.active.push(o);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-serif text-4xl font-semibold mb-2">Orders</h1>
      <p className="text-muted-foreground mb-8">
        Update status as you cook and dispatch — customers see it live.
      </p>

      {(data?.length ?? 0) === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
            <Inbox className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="font-medium">No orders yet</div>
          <div className="text-sm text-muted-foreground mt-1">
            Once a customer places an order, it'll appear here.
          </div>
        </div>
      ) : (
        <>
          <Section title="Live orders" orders={groups.active}>
            {(o) => (
              <OrderCard
                key={o.id}
                order={o}
                busy={busyId === o.id}
                onAdvance={() => {
                  const next = NEXT[o.status].next;
                  if (next) advance(o, next);
                }}
                onCancel={() => advance(o, "cancelled")}
              />
            )}
          </Section>
          {groups.delivered.length > 0 && (
            <Section title="Recent" orders={groups.delivered}>
              {(o) => (
                <OrderCard
                  key={o.id}
                  order={o}
                  busy={false}
                  readonly
                />
              )}
            </Section>
          )}
        </>
      )}
    </div>
  );
}

function Section({
  title,
  orders,
  children,
}: {
  title: string;
  orders: Order[];
  children: (o: Order) => React.ReactNode;
}) {
  if (orders.length === 0) return null;
  return (
    <section className="mb-10">
      <h2 className="font-serif text-xl font-semibold mb-3">{title}</h2>
      <div className="space-y-3">{orders.map(children)}</div>
    </section>
  );
}

function OrderCard({
  order,
  busy,
  readonly,
  onAdvance,
  onCancel,
}: {
  order: Order;
  busy: boolean;
  readonly?: boolean;
  onAdvance?: () => void;
  onCancel?: () => void;
}) {
  const next = NEXT[order.status];
  const NextIcon = next.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl bg-card border border-card-border"
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_TONE[order.status]}`}>
              {STATUS_LABEL[order.status]}
            </span>
            <span className="text-xs text-muted-foreground">
              #{order.id.slice(0, 8)} ·{" "}
              {new Date(order.placedAt).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {order.isCorporate && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-secondary/15 text-secondary">
                Corporate
              </span>
            )}
          </div>
          <div className="mt-3 font-medium">{order.customerName}</div>
          <a
            href={`tel:${order.customerPhone}`}
            className="text-xs text-primary inline-flex items-center gap-1 hover:underline"
          >
            <Phone className="h-3 w-3" /> {order.customerPhone}
          </a>
          <div className="text-xs text-muted-foreground mt-1">{order.address}</div>
          {order.notes && (
            <div className="mt-2 text-xs italic text-foreground/80 bg-accent/10 border border-accent/20 rounded-md p-2">
              "{order.notes}"
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="font-semibold text-lg">{formatINR(order.total)}</div>
          <div className="text-xs text-muted-foreground">{order.items.length} items</div>
        </div>
      </div>

      <ul className="mt-4 text-sm space-y-1 border-t border-border pt-3">
        {order.items.map((it) => (
          <li key={it.dishId} className="flex justify-between">
            <span>{it.quantity} × {it.dishName}</span>
            <span className="text-muted-foreground">{formatINR(it.unitPrice * it.quantity)}</span>
          </li>
        ))}
      </ul>

      {!readonly && (
        <div className="mt-4 flex flex-wrap gap-2 justify-end">
          {order.status !== "delivered" && order.status !== "cancelled" && onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel} disabled={busy} className="text-destructive">
              <X className="h-4 w-4" /> Cancel
            </Button>
          )}
          {next.next && onAdvance && (
            <Button onClick={onAdvance} disabled={busy}>
              {NextIcon && <NextIcon className="h-4 w-4" />}
              {next.label}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}
