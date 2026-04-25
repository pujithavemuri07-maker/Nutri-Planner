import { Link } from "wouter";
import { motion } from "framer-motion";
import { Leaf, Star, Clock, Plus } from "lucide-react";
import { useCart, formatINR } from "@/hooks/use-cart";
import { toast } from "sonner";
import type { Dish } from "@workspace/api-client-react";

const FALLBACK =
  "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=70&auto=format&fit=crop";

const CATEGORY_LABEL: Record<string, string> = {
  veg: "Pure Veg",
  non_veg: "Non-Veg",
  diet: "Diet",
  gym: "Protein",
  elderly: "Elderly Care",
  tiffin: "Tiffin",
};

export function DishCard({ dish, index = 0 }: { dish: Dish; index?: number }) {
  const addItem = useCart((s) => s.addItem);

  const onAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      dishId: dish.id,
      dishName: dish.name,
      unitPrice: dish.price,
      imageUrl: dish.imageUrl,
      chefId: dish.chefId,
      chefName: dish.chefName,
    });
    toast.success(`${dish.name} added to cart`, {
      description: `From ${dish.kitchenName ?? dish.chefName}`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
    >
      <Link href={`/dish/${dish.id}`}>
        <div className="group relative bg-card rounded-2xl overflow-hidden border border-card-border hover:shadow-lg transition-all hover:-translate-y-0.5">
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            <img
              src={dish.imageUrl || FALLBACK}
              alt={dish.name}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-background/90 backdrop-blur text-foreground">
                {CATEGORY_LABEL[dish.category] ?? dish.category}
              </span>
              {dish.ecoFriendly && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-secondary text-secondary-foreground">
                  <Leaf className="h-3 w-3" />
                  Eco
                </span>
              )}
            </div>
            <button
              onClick={onAdd}
              className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
              aria-label="Add to cart"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-medium leading-tight truncate">{dish.name}</h3>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  by {dish.kitchenName ?? dish.chefName}
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="font-semibold">{formatINR(dish.price)}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {dish.rating.toFixed(1)}
                <span className="opacity-70">({dish.reviewCount})</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {dish.prepMinutes} min
              </span>
              {dish.proteinGrams ? (
                <span className="inline-flex items-center gap-1">
                  {dish.proteinGrams}g protein
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
