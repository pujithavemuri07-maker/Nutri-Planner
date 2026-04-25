import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Package,
  TrendingUp,
  Star,
  Wallet,
  ChefHat,
  ArrowRight,
} from "lucide-react";
import { useGetChefStats } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { formatINR } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { DishCard } from "@/components/DishCard";

const stats = (s?: {
  totalOrders: number;
  activeOrders: number;
  deliveredOrders: number;
  revenue: number;
  avgRating: number;
}) => [
  { label: "Total orders", value: s?.totalOrders ?? 0, Icon: Package, tone: "bg-primary/10 text-primary" },
  { label: "Active right now", value: s?.activeOrders ?? 0, Icon: TrendingUp, tone: "bg-accent/20 text-accent-foreground" },
  { label: "Delivered", value: s?.deliveredOrders ?? 0, Icon: ChefHat, tone: "bg-secondary/15 text-secondary" },
  { label: "Revenue", value: formatINR(s?.revenue ?? 0), Icon: Wallet, tone: "bg-primary/10 text-primary" },
];

export default function ChefDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useGetChefStats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-end justify-between gap-4 mb-8"
      >
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Namaste
          </div>
          <h1 className="font-serif text-4xl font-semibold mt-1">
            {user?.name?.split(" ")[0]} ji
          </h1>
          {user?.kitchenName && (
            <p className="text-muted-foreground mt-1">{user.kitchenName}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href="/chef/dishes">
            <Button variant="outline">Manage dishes</Button>
          </Link>
          <Link href="/chef/orders">
            <Button>
              View orders <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats(data).map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="p-5 rounded-2xl bg-card border border-card-border"
          >
            <div className={`h-9 w-9 rounded-full flex items-center justify-center ${s.tone}`}>
              <s.Icon className="h-4 w-4" />
            </div>
            <div className="mt-3 text-2xl font-semibold">
              {isLoading ? <span className="text-muted-foreground">—</span> : s.value}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-card border border-card-border mb-10 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
            <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Average rating
            </div>
            <div className="font-serif text-2xl font-semibold">
              {data?.avgRating ? data.avgRating.toFixed(1) : "—"}
            </div>
          </div>
        </div>
        <div className="text-sm text-muted-foreground max-w-md">
          Customers love consistency — keep the same recipes for at least a week.
        </div>
      </div>

      <div className="mb-10">
        <div className="flex items-end justify-between mb-5">
          <h2 className="font-serif text-2xl font-semibold">Your top dishes</h2>
          <Link href="/chef/dishes" className="text-sm text-primary hover:underline">
            Edit menu
          </Link>
        </div>
        {(data?.topDishes?.length ?? 0) === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            <div className="font-medium text-foreground">You haven't added any dishes yet.</div>
            <div className="text-sm mt-1">List your first one — it takes a minute.</div>
            <Link href="/chef/dishes">
              <Button className="mt-4">Add a dish</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {data!.topDishes.map((d, i) => (
              <DishCard key={d.id} dish={d} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
