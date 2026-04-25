import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import {
  useListDishes,
  type DishCategory,
  type DishTag,
} from "@workspace/api-client-react";
import { DishCard } from "@/components/DishCard";

const CATEGORIES: { id: DishCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "veg", label: "Pure Veg" },
  { id: "non_veg", label: "Non-Veg" },
  { id: "tiffin", label: "Tiffin" },
  { id: "diet", label: "Diet" },
  { id: "gym", label: "Protein" },
  { id: "elderly", label: "Elderly Care" },
];

const TAGS: { id: DishTag; label: string }[] = [
  { id: "healthy", label: "Healthy" },
  { id: "protein", label: "High protein" },
  { id: "low_calorie", label: "Low calorie" },
  { id: "tiffin", label: "Daily tiffin" },
];

export default function Menu() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.includes("?") ? location.split("?")[1] : "");
  const initialQ = params.get("q") ?? "";
  const initialCategory = (params.get("category") as DishCategory | null) ?? null;

  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState<DishCategory | "all">(
    initialCategory ?? "all",
  );
  const [tag, setTag] = useState<DishTag | null>(null);

  useEffect(() => {
    setQ(initialQ);
    if (initialCategory) setCategory(initialCategory);
  }, [initialQ, initialCategory]);

  const { data: dishes, isLoading } = useListDishes({
    q: q || undefined,
    category: category === "all" ? undefined : category,
    tag: tag ?? undefined,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h1 className="font-serif text-4xl font-semibold">The menu</h1>
        <p className="text-muted-foreground mt-1">
          Fresh, home-cooked meals from kitchens near you.
        </p>
      </motion.div>

      <div className="flex items-center gap-2 bg-card rounded-full p-1.5 pl-5 border border-border max-w-2xl mb-6">
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search dishes, chefs, tiffins…"
          className="flex-1 bg-transparent outline-none text-sm py-2"
        />
        {q && (
          <button
            onClick={() => setQ("")}
            className="p-1 rounded-full hover:bg-muted"
            aria-label="Clear search"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`px-3.5 py-1.5 rounded-full text-sm border transition-colors ${
              category === c.id
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:bg-muted"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-8">
        {TAGS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTag(tag === t.id ? null : t.id)}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${
              tag === t.id
                ? "bg-secondary text-secondary-foreground border-secondary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (dishes?.length ?? 0) === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          <div className="font-medium text-foreground">No dishes match.</div>
          <div className="text-sm mt-1">Try a different search or category.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {dishes!.map((d, i) => (
            <DishCard key={d.id} dish={d} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
