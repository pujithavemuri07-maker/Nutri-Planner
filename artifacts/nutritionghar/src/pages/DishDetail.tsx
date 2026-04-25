import { useState } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Star,
  Clock,
  Leaf,
  Plus,
  Minus,
  Flame,
  Beef,
} from "lucide-react";
import { useGetDish, getGetDishQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useCart, formatINR } from "@/hooks/use-cart";
import { toast } from "sonner";

const FALLBACK =
  "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=1200&q=70&auto=format&fit=crop";

export default function DishDetail() {
  const [, params] = useRoute("/dish/:id");
  const id = params?.id ?? "";
  const { data: dish, isLoading } = useGetDish(id, {
    query: { queryKey: getGetDishQueryKey(id), enabled: !!id },
  });
  const [qty, setQty] = useState(1);
  const addItem = useCart((s) => s.addItem);
  const [, navigate] = useLocation();

  if (isLoading || !dish) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="aspect-video rounded-2xl bg-muted animate-pulse" />
        <div className="mt-6 h-8 w-1/2 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  const onAdd = () => {
    addItem({
      dishId: dish.id,
      dishName: dish.name,
      unitPrice: dish.price,
      imageUrl: dish.imageUrl,
      chefId: dish.chefId,
      chefName: dish.chefName,
      quantity: qty,
    });
    toast.success(`${qty} × ${dish.name} added`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/menu" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to menu
      </Link>

      <div className="grid lg:grid-cols-2 gap-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative aspect-square rounded-3xl overflow-hidden border border-card-border"
        >
          <img
            src={dish.imageUrl || FALLBACK}
            alt={dish.name}
            className="h-full w-full object-cover"
          />
          {dish.ecoFriendly && (
            <span className="absolute top-4 left-4 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
              <Leaf className="h-3.5 w-3.5" />
              Eco-friendly packaging
            </span>
          )}
        </motion.div>

        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            {dish.category.replace("_", "-")}
          </div>
          <h1 className="font-serif text-4xl font-semibold mt-2 leading-tight">
            {dish.name}
          </h1>
          <div className="mt-2 text-sm text-muted-foreground">
            from <span className="text-foreground font-medium">{dish.kitchenName ?? dish.chefName}</span>
            {dish.kitchenName && (
              <span> · cooked by {dish.chefName}</span>
            )}
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {dish.rating.toFixed(1)}
              <span className="text-muted-foreground">({dish.reviewCount})</span>
            </span>
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" /> {dish.prepMinutes} min prep
            </span>
          </div>

          <p className="mt-5 text-foreground/80 leading-relaxed">{dish.description}</p>

          {(dish.calories || dish.proteinGrams) && (
            <div className="mt-5 flex gap-3">
              {dish.calories ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted">
                  <Flame className="h-4 w-4 text-primary" />
                  <div className="text-sm">
                    <div className="font-medium">{dish.calories}</div>
                    <div className="text-xs text-muted-foreground">kcal</div>
                  </div>
                </div>
              ) : null}
              {dish.proteinGrams ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted">
                  <Beef className="h-4 w-4 text-primary" />
                  <div className="text-sm">
                    <div className="font-medium">{dish.proteinGrams}g</div>
                    <div className="text-xs text-muted-foreground">protein</div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {dish.tags?.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {dish.tags.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-full text-xs bg-accent/20 text-accent-foreground border border-accent/30"
                >
                  {t.replace("_", " ")}
                </span>
              ))}
            </div>
          )}

          <div className="mt-8 p-5 rounded-2xl border border-card-border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-semibold">{formatINR(dish.price * qty)}</div>
                <div className="text-xs text-muted-foreground">incl. fresh ingredients</div>
              </div>
              <div className="flex items-center gap-1 border border-border rounded-full p-1">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-medium">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button size="lg" variant="outline" onClick={onAdd}>
                Add to cart
              </Button>
              <Button
                size="lg"
                onClick={() => {
                  onAdd();
                  navigate("/checkout");
                }}
              >
                Order now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
