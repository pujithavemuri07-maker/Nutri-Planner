import { Link } from "wouter";
import { motion } from "framer-motion";
import { Package, ArrowRight } from "lucide-react";
import { useListMyOrders } from "@workspace/api-client-react";
import { formatINR } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";

const STATUS_LABEL: Record<string, string> = {
  placed: "Placed",
  preparing: "Cooking",
  out_for_delivery: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
const STATUS_TONE: Record<string, string> = {
  placed: "bg-accent/30 text-accent-foreground",
  preparing: "bg-primary/15 text-primary",
  out_for_delivery: "bg-secondary/20 text-secondary",
  delivered: "bg-secondary/20 text-secondary",
  cancelled: "bg-destructive/15 text-destructive",
};

export default function Orders() {
  const { data, isLoading } = useListMyOrders();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="h-8 w-40 bg-muted animate-pulse rounded mb-6" />
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="mx-auto h-20 w-20 rounded-full bg-muted flex items-center justify-center">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="font-serif text-3xl font-semibold mt-6">No orders yet</h1>
        <p className="text-muted-foreground mt-2">
          When you place your first tiffin, it'll show up here.
        </p>
        <Link href="/menu">
          <Button className="mt-6">Browse menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-serif text-4xl font-semibold mb-6">Your orders</h1>
      <ul className="space-y-3">
        {data.map((o, i) => (
          <motion.li
            key={o.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
          >
            <Link href={`/orders/${o.id}`}>
              <div className="p-5 rounded-2xl bg-card border border-card-border hover:shadow-md transition-shadow flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_TONE[o.status]}`}>
                      {STATUS_LABEL[o.status]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(o.placedAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="mt-2 font-medium truncate">
                    {o.items.map((i) => `${i.quantity}× ${i.dishName}`).join(" · ")}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    from {o.kitchenName ?? o.chefName}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-semibold">{formatINR(o.total)}</div>
                  <div className="text-xs text-primary mt-1 inline-flex items-center gap-1">
                    Track <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
