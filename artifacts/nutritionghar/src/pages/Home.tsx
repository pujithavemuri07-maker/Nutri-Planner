import { Link, useLocation } from "wouter";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Search,
  ChefHat,
  Leaf,
  ShieldCheck,
  Heart,
} from "lucide-react";
import {
  useGetHomeFeatured,
  useListSubscriptionPlans,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { DishCard } from "@/components/DishCard";
import { formatINR } from "@/hooks/use-cart";

const HERO_IMG =
  "https://images.unsplash.com/photo-1567337710282-00832b415979?w=1400&q=70&auto=format&fit=crop";

const STEP_BG =
  "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=900&q=70&auto=format&fit=crop";

const CHEF_FALLBACK = [
  "https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&q=70&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=400&q=70&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=400&q=70&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1532635241-17e820acc59f?w=400&q=70&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=70&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400&q=70&auto=format&fit=crop",
];

const CATEGORY_IMG: Record<string, string> = {
  veg: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=70&auto=format&fit=crop",
  non_veg: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=70&auto=format&fit=crop",
  diet: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=70&auto=format&fit=crop",
  gym: "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=600&q=70&auto=format&fit=crop",
  elderly: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=70&auto=format&fit=crop",
  tiffin: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=600&q=70&auto=format&fit=crop",
};

const CATEGORY_LABEL: Record<string, string> = {
  veg: "Pure Veg",
  non_veg: "Non-Veg",
  diet: "Diet",
  gym: "High Protein",
  elderly: "Elderly Care",
  tiffin: "Daily Tiffin",
};

export default function Home() {
  const { data: home, isLoading } = useGetHomeFeatured();
  const { data: plans } = useListSubscriptionPlans();
  const [, navigate] = useLocation();
  const [q, setQ] = useState("");

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(q.trim() ? `/menu?q=${encodeURIComponent(q.trim())}` : "/menu");
  };

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={HERO_IMG} alt="" className="h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/30 text-accent-foreground text-xs font-medium border border-accent/40">
              <Heart className="h-3 w-3" />
              Cooked by mothers, sisters, and neighbours
            </span>
            <h1 className="mt-5 font-serif text-5xl md:text-6xl font-semibold leading-[1.05] text-foreground">
              Healthy.
              <br />
              <span className="italic text-primary">Homemade.</span>
              <br />
              Heartfelt.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-md">
              Order ghar-jaisa khana from the home cooks in your neighbourhood —
              fresh dal, hot rotis, sprouts, tiffins and protein meals. No clouds,
              no chains. Just real kitchens.
            </p>

            <form
              onSubmit={onSearch}
              className="mt-7 flex items-center gap-2 bg-card rounded-full p-1.5 pl-5 border border-border shadow-sm max-w-lg"
            >
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Try idli, ragi, dal khichdi…"
                className="flex-1 bg-transparent outline-none text-sm py-2"
              />
              <Button type="submit" size="sm" className="rounded-full">
                Find food
              </Button>
            </form>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => navigate("/menu")}>
                Order now
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/login?role=chef")}
              >
                <ChefHat className="h-4 w-4" />
                Join as a home chef
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative hidden md:block"
          >
            <div className="relative aspect-square rounded-[2.5rem] overflow-hidden border-4 border-background shadow-2xl rotate-2">
              <img
                src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=900&q=70&auto=format&fit=crop"
                alt="Indian thali"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-44 rounded-2xl bg-card border border-card-border p-4 shadow-lg -rotate-3">
              <div className="text-2xl font-serif font-semibold text-primary">
                {home?.topChefs?.length ?? "—"}
              </div>
              <div className="text-xs text-muted-foreground">
                home chefs cooking near you today
              </div>
            </div>
            <div className="absolute -top-6 -right-4 w-36 rounded-2xl bg-secondary text-secondary-foreground p-4 shadow-lg rotate-3">
              <Leaf className="h-5 w-5" />
              <div className="mt-1 text-sm font-medium leading-tight">
                Eco-friendly tiffin packaging
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-serif text-3xl font-semibold">What are you craving?</h2>
            <p className="text-muted-foreground text-sm mt-1">
              From light tiffins to high-protein meals — pick a vibe.
            </p>
          </div>
          <Link href="/menu" className="text-sm text-primary hover:underline hidden sm:inline">
            See all
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(home?.categoryCounts ?? []).map((cat, i) => (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <Link href={`/menu?category=${cat.category}`}>
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-card-border group">
                  <img
                    src={CATEGORY_IMG[cat.category]}
                    alt={CATEGORY_LABEL[cat.category]}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="font-medium leading-tight">
                      {CATEGORY_LABEL[cat.category]}
                    </div>
                    <div className="text-xs opacity-80">{cat.count} dishes</div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-serif text-3xl font-semibold">Today's warm picks</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Hand-picked dishes from the highest-rated home chefs.
            </p>
          </div>
          <Link href="/menu" className="text-sm text-primary hover:underline">
            Browse the full menu
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-2xl bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : (home?.featuredDishes?.length ?? 0) > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {home!.featuredDishes.slice(0, 8).map((d, i) => (
              <DishCard key={d.id} dish={d} index={i} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            No dishes yet — be the first chef to list one.
          </div>
        )}
      </section>

      {/* CHEFS */}
      <section className="bg-muted/40 py-16 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-serif text-3xl font-semibold">Meet the homemakers</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Real cooks, real kitchens, real stories.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
            {(home?.topChefs ?? []).map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="text-center"
              >
                <div className="relative aspect-square rounded-full overflow-hidden border-4 border-background shadow-md mx-auto max-w-[140px]">
                  <img
                    src={CHEF_FALLBACK[i % CHEF_FALLBACK.length]}
                    alt={c.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-3">
                  <div className="font-medium text-sm">{c.name}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">
                    {c.kitchenName ?? "Home chef"}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden hidden lg:block">
            <img src={STEP_BG} alt="" className="h-full w-full object-cover" />
          </div>
          <div>
            <h2 className="font-serif text-3xl font-semibold">How NutritionGhar works</h2>
            <ol className="mt-6 space-y-5">
              {[
                {
                  t: "Browse local kitchens",
                  d: "Filter by veg, protein, diet, elderly care or daily tiffins.",
                },
                {
                  t: "Order by 9 AM",
                  d: "Your home chef cooks fresh, just for you — never reheated.",
                },
                {
                  t: "Hot tiffin to your door",
                  d: "Delivered in eco-friendly steel-style packaging within 30-45 min.",
                },
              ].map((s, i) => (
                <li key={i} className="flex gap-4">
                  <div className="h-9 w-9 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-serif font-semibold">
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-medium">{s.t}</div>
                    <div className="text-sm text-muted-foreground">{s.d}</div>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-8 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-secondary/10 border border-secondary/20 p-3">
                <Leaf className="h-5 w-5 text-secondary mx-auto" />
                <div className="text-xs mt-1 font-medium">Eco-friendly</div>
              </div>
              <div className="rounded-xl bg-accent/10 border border-accent/30 p-3">
                <ShieldCheck className="h-5 w-5 text-accent-foreground mx-auto" />
                <div className="text-xs mt-1 font-medium">FSSAI-aware</div>
              </div>
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-3">
                <Heart className="h-5 w-5 text-primary mx-auto" />
                <div className="text-xs mt-1 font-medium">Made with love</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUBSCRIPTIONS */}
      {plans && plans.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="font-serif text-3xl font-semibold">Eat well every day</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Subscribe to a weekly or monthly plan — your office, parents or PG covered.
              </p>
            </div>
            <Link href="/subscriptions" className="text-sm text-primary hover:underline">
              All plans
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {plans.slice(0, 3).map((p) => (
              <Link key={p.id} href="/subscriptions">
                <div className="rounded-2xl bg-card border border-card-border p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="text-xs uppercase tracking-wider text-secondary font-medium">
                    {p.frequency}
                  </div>
                  <div className="mt-1 font-serif text-xl font-semibold">{p.name}</div>
                  <div className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {p.description}
                  </div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-2xl font-semibold">{formatINR(p.pricePerMeal)}</span>
                    <span className="text-xs text-muted-foreground">/ meal</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-3xl bg-primary text-primary-foreground p-10 md:p-14 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="font-serif text-3xl md:text-4xl font-semibold">
              Cook for the neighbourhood. Earn from your kitchen.
            </h3>
            <p className="mt-3 opacity-90 max-w-md">
              List your dishes in minutes. We handle orders, payments and delivery
              hand-offs so you can focus on the food.
            </p>
          </div>
          <div className="flex md:justify-end">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate("/login?role=chef")}
            >
              Become a home chef
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
