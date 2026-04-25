import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  Star,
  Clock,
  Leaf,
  Image as ImageIcon,
} from "lucide-react";
import {
  useListChefDishes,
  useCreateDish,
  useUpdateDish,
  useDeleteDish,
  getListChefDishesQueryKey,
  getGetHomeFeaturedQueryKey,
  getListDishesQueryKey,
  type Dish,
  type DishCategory,
  type DishTag,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatINR } from "@/hooks/use-cart";
import { toast } from "sonner";

const CATEGORIES: { value: DishCategory; label: string }[] = [
  { value: "veg", label: "Pure Veg" },
  { value: "non_veg", label: "Non-Veg" },
  { value: "tiffin", label: "Tiffin" },
  { value: "diet", label: "Diet" },
  { value: "gym", label: "Protein" },
  { value: "elderly", label: "Elderly Care" },
];

const TAGS: { value: DishTag; label: string }[] = [
  { value: "healthy", label: "Healthy" },
  { value: "protein", label: "High protein" },
  { value: "low_calorie", label: "Low calorie" },
  { value: "tiffin", label: "Tiffin" },
];

const DEFAULT_FORM = {
  name: "",
  description: "",
  price: 150,
  category: "veg" as DishCategory,
  tags: [] as DishTag[],
  prepMinutes: 20,
  calories: undefined as number | undefined,
  proteinGrams: undefined as number | undefined,
  imageUrl: "",
  ecoFriendly: true,
  available: true,
};

type FormState = typeof DEFAULT_FORM;

export default function ChefDishes() {
  const { data: dishes, isLoading } = useListChefDishes();
  const qc = useQueryClient();

  const [editing, setEditing] = useState<Dish | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Dish | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: getListChefDishesQueryKey() });
    qc.invalidateQueries({ queryKey: getGetHomeFeaturedQueryKey() });
    qc.invalidateQueries({ queryKey: getListDishesQueryKey() });
  };

  const createDish = useCreateDish({
    mutation: {
      onSuccess: () => {
        invalidateAll();
        setCreating(false);
        setForm(DEFAULT_FORM);
        toast.success("Dish added");
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : "Could not add"),
    },
  });

  const updateDish = useUpdateDish({
    mutation: {
      onSuccess: () => {
        invalidateAll();
        setEditing(null);
        toast.success("Dish updated");
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save"),
    },
  });

  const deleteDish = useDeleteDish({
    mutation: {
      onSuccess: () => {
        invalidateAll();
        setConfirmDelete(null);
        toast.success("Dish removed");
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : "Could not delete"),
    },
  });

  const openEdit = (d: Dish) => {
    setEditing(d);
    setForm({
      name: d.name,
      description: d.description,
      price: d.price,
      category: d.category,
      tags: d.tags,
      prepMinutes: d.prepMinutes,
      calories: d.calories ?? undefined,
      proteinGrams: d.proteinGrams ?? undefined,
      imageUrl: d.imageUrl ?? "",
      ecoFriendly: d.ecoFriendly,
      available: d.available,
    });
  };

  const openCreate = () => {
    setForm(DEFAULT_FORM);
    setCreating(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!form.description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (form.price <= 0) {
      toast.error("Price must be greater than zero");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: form.price,
      category: form.category,
      tags: form.tags,
      prepMinutes: form.prepMinutes,
      calories: form.calories,
      proteinGrams: form.proteinGrams,
      imageUrl: form.imageUrl.trim() || undefined,
      ecoFriendly: form.ecoFriendly,
      available: form.available,
    };

    if (editing) {
      updateDish.mutate({ id: editing.id, data: payload });
    } else {
      createDish.mutate({ data: payload });
    }
  };

  const toggleAvailability = (d: Dish) => {
    updateDish.mutate({ id: d.id, data: { available: !d.available } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-4xl font-semibold">Your kitchen menu</h1>
          <p className="text-muted-foreground mt-1">
            Add dishes, edit prices, switch them on or off through the day.
          </p>
        </div>
        <Button size="lg" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add a dish
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-72 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (dishes?.length ?? 0) === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="font-medium">No dishes yet</div>
          <div className="text-sm text-muted-foreground mt-1">
            List your first dish — your neighbourhood is hungry.
          </div>
          <Button className="mt-5" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add a dish
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {dishes!.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              className={`rounded-2xl bg-card border border-card-border overflow-hidden ${
                d.available ? "" : "opacity-70"
              }`}
            >
              <div className="aspect-[4/3] bg-muted relative">
                {d.imageUrl ? (
                  <img src={d.imageUrl} alt={d.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-10 w-10" />
                  </div>
                )}
                {d.ecoFriendly && (
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-secondary text-secondary-foreground">
                    <Leaf className="h-3 w-3" /> Eco
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{d.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {d.description}
                    </div>
                  </div>
                  <div className="text-right shrink-0 font-semibold">
                    {formatINR(d.price)}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {d.rating.toFixed(1)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {d.prepMinutes}m
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 text-xs">
                    <Switch
                      checked={d.available}
                      onCheckedChange={() => toggleAvailability(d)}
                    />
                    <span>{d.available ? "Available" : "Off menu"}</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(d)}
                      aria-label="Edit"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmDelete(d)}
                      aria-label="Delete"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog
        open={creating || editing !== null}
        onOpenChange={(o) => {
          if (!o) {
            setCreating(false);
            setEditing(null);
          }
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {editing ? "Edit dish" : "Add a new dish"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="d-name">Name</Label>
              <Input
                id="d-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1.5"
                placeholder="Sprouts moong khichdi"
              />
            </div>
            <div>
              <Label htmlFor="d-desc">Description</Label>
              <Textarea
                id="d-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="mt-1.5"
                placeholder="Tell customers what makes this special."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Price (₹)</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Prep time (min)</Label>
                <Input
                  type="number"
                  value={form.prepMinutes}
                  onChange={(e) => setForm({ ...form, prepMinutes: Number(e.target.value) })}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v as DishCategory })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tags</Label>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {TAGS.map((t) => {
                  const on = form.tags.includes(t.value);
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          tags: on
                            ? form.tags.filter((x) => x !== t.value)
                            : [...form.tags, t.value],
                        })
                      }
                      className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                        on
                          ? "bg-secondary text-secondary-foreground border-secondary"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Calories</Label>
                <Input
                  type="number"
                  value={form.calories ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, calories: e.target.value ? Number(e.target.value) : undefined })
                  }
                  className="mt-1.5"
                  placeholder="optional"
                />
              </div>
              <div>
                <Label>Protein (g)</Label>
                <Input
                  type="number"
                  value={form.proteinGrams ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, proteinGrams: e.target.value ? Number(e.target.value) : undefined })
                  }
                  className="mt-1.5"
                  placeholder="optional"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="d-img">Image URL</Label>
              <Input
                id="d-img"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="mt-1.5"
                placeholder="https://…"
              />
            </div>
            <label className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="text-sm">Eco-friendly packaging</div>
              <Switch
                checked={form.ecoFriendly}
                onCheckedChange={(v) => setForm({ ...form, ecoFriendly: v })}
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="text-sm">Available now</div>
              <Switch
                checked={form.available}
                onCheckedChange={(v) => setForm({ ...form, available: v })}
              />
            </label>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreating(false);
                setEditing(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={createDish.isPending || updateDish.isPending}
            >
              {editing ? "Save changes" : "Add dish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={confirmDelete !== null}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove "{confirmDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              The dish will disappear from your menu and search results.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDelete && deleteDish.mutate({ id: confirmDelete.id })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
