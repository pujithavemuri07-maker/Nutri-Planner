import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  dishId: string;
  dishName: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string | null;
  chefId: string;
  chefName: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (dishId: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        const items = get().items;
        // Single-chef cart: if a different chef's dish is added, replace cart.
        const sameChef = items.length === 0 || items[0].chefId === newItem.chefId;
        const baseItems = sameChef ? items : [];
        const existing = baseItems.find((i) => i.dishId === newItem.dishId);
        if (existing) {
          set({
            items: baseItems.map((i) =>
              i.dishId === newItem.dishId
                ? { ...i, quantity: i.quantity + (newItem.quantity ?? 1) }
                : i,
            ),
          });
        } else {
          set({
            items: [
              ...baseItems,
              { ...newItem, quantity: newItem.quantity ?? 1 },
            ],
          });
        }
      },
      removeItem: (dishId) => {
        set({ items: get().items.filter((i) => i.dishId !== dishId) });
      },
      updateQuantity: (dishId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.dishId !== dishId) });
          return;
        }
        set({
          items: get().items.map((i) =>
            i.dishId === dishId ? { ...i, quantity } : i,
          ),
        });
      },
      clearCart: () => set({ items: [] }),
    }),
    { name: "nutritionghar-cart" },
  ),
);

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((s, i) => s + i.quantity, 0);
}

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}
