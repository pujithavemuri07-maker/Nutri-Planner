import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Building2, User as UserIcon } from "lucide-react";
import {
  useListSubscriptionPlans,
  useListMySubscriptions,
  useCreateSubscription,
  getListMySubscriptionsQueryKey,
  type SubscriptionPlan,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatINR } from "@/hooks/use-cart";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export default function Subscriptions() {
  const { data: plans } = useListSubscriptionPlans();
  const { data: mine } = useListMySubscriptions();
  const { user } = useAuth();
  const [tab, setTab] = useState<"personal" | "corporate">("personal");
  const [pickedPlan, setPickedPlan] = useState<SubscriptionPlan | null>(null);
  const [address, setAddress] = useState(user?.address ?? "");
  const qc = useQueryClient();

  const createSub = useCreateSubscription({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListMySubscriptionsQueryKey() });
        toast.success("Subscription started", {
          description: "Your first meal is scheduled.",
        });
        setPickedPlan(null);
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : "Could not subscribe"),
    },
  });

  const visiblePlans = (plans ?? []).filter((p) =>
    tab === "corporate" ? p.forCorporate : !p.forCorporate,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="font-serif text-4xl md:text-5xl font-semibold">
          Eat well every day, on a plan
        </h1>
        <p className="text-muted-foreground mt-3">
          Daily tiffins for working professionals, protein meals for the gym, and
          gentle home-cooked food for elderly parents. Pause or stop any time.
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1 rounded-full bg-muted">
          <button
            onClick={() => setTab("personal")}
            className={`px-5 py-2 rounded-full text-sm font-medium inline-flex items-center gap-1.5 transition-colors ${
              tab === "personal" ? "bg-background shadow-sm" : "text-muted-foreground"
            }`}
          >
            <UserIcon className="h-4 w-4" /> Personal
          </button>
          <button
            onClick={() => setTab("corporate")}
            className={`px-5 py-2 rounded-full text-sm font-medium inline-flex items-center gap-1.5 transition-colors ${
              tab === "corporate" ? "bg-background shadow-sm" : "text-muted-foreground"
            }`}
          >
            <Building2 className="h-4 w-4" /> Corporate
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {visiblePlans.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="rounded-2xl bg-card border border-card-border p-6 flex flex-col"
          >
            <div className="text-xs uppercase tracking-wider text-secondary font-medium">
              {p.frequency}
            </div>
            <h3 className="mt-1 font-serif text-2xl font-semibold">{p.name}</h3>
            <p className="text-sm text-muted-foreground mt-2 min-h-[3em]">{p.description}</p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-semibold">{formatINR(p.pricePerMeal)}</span>
              <span className="text-sm text-muted-foreground">/ meal</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {p.mealsPerWeek} meals per week
            </div>
            <ul className="mt-5 space-y-2 text-sm flex-1">
              {p.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
            <Button
              className="mt-6"
              onClick={() => {
                setPickedPlan(p);
                setAddress(user?.address ?? "");
              }}
            >
              Subscribe
            </Button>
          </motion.div>
        ))}
      </div>

      {mine && mine.length > 0 && (
        <section className="mt-14">
          <h2 className="font-serif text-2xl font-semibold mb-4">Your subscriptions</h2>
          <ul className="space-y-3">
            {mine.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between p-5 rounded-2xl bg-card border border-card-border"
              >
                <div>
                  <div className="font-medium">{s.planName}</div>
                  <div className="text-xs text-muted-foreground">{s.deliveryAddress}</div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    s.active ? "bg-secondary/20 text-secondary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s.active ? "Active" : "Paused"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Dialog open={!!pickedPlan} onOpenChange={(o) => !o && setPickedPlan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              Subscribe to {pickedPlan?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted text-sm">
              <div className="font-semibold">{formatINR(pickedPlan?.pricePerMeal ?? 0)} / meal</div>
              <div className="text-xs text-muted-foreground">
                {pickedPlan?.mealsPerWeek} meals per week, billed {pickedPlan?.frequency}
              </div>
            </div>
            <div>
              <Label htmlFor="sub-address">Delivery address</Label>
              <Textarea
                id="sub-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Where should we deliver your meals?"
                rows={3}
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPickedPlan(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!pickedPlan || !address.trim()) {
                  toast.error("Please add a delivery address");
                  return;
                }
                createSub.mutate({
                  data: { planId: pickedPlan.id, deliveryAddress: address.trim() },
                });
              }}
              disabled={createSub.isPending}
            >
              {createSub.isPending ? "Confirming…" : "Confirm subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
