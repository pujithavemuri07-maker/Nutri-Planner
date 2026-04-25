import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart, cartSubtotal, formatINR } from "@/hooks/use-cart";
import { useLocation } from "wouter";

export function CartSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const items = useCart((s) => s.items);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const subtotal = cartSubtotal(items);
  const [, navigate] = useLocation();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-serif text-2xl">Your tiffin</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6 py-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground gap-3 py-12">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <div className="font-medium text-foreground">
                Your cart is empty
              </div>
              <div className="text-sm">
                Add a warm meal from a home chef nearby.
              </div>
              <Button
                onClick={() => {
                  onOpenChange(false);
                  navigate("/menu");
                }}
                className="mt-2"
              >
                Browse menu
              </Button>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((it) => (
                <li
                  key={it.dishId}
                  className="flex gap-3 p-3 rounded-lg border border-border bg-card"
                >
                  <div className="h-16 w-16 shrink-0 rounded-md overflow-hidden bg-muted">
                    {it.imageUrl ? (
                      <img
                        src={it.imageUrl}
                        alt={it.dishName}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium leading-tight truncate">
                      {it.dishName}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      by {it.chefName}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button
                          className="h-7 w-7 rounded-md border border-border hover:bg-muted flex items-center justify-center"
                          onClick={() =>
                            updateQuantity(it.dishId, it.quantity - 1)
                          }
                          aria-label="decrement"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-sm w-6 text-center">{it.quantity}</span>
                        <button
                          className="h-7 w-7 rounded-md border border-border hover:bg-muted flex items-center justify-center"
                          onClick={() =>
                            updateQuantity(it.dishId, it.quantity + 1)
                          }
                          aria-label="increment"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="text-sm font-semibold">
                        {formatINR(it.unitPrice * it.quantity)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(it.dishId)}
                    className="h-7 w-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted flex items-center justify-center"
                    aria-label="remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="border-t border-border pt-4 sm:flex-col sm:gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold text-base">{formatINR(subtotal)}</span>
            </div>
            <Button
              size="lg"
              className="w-full"
              onClick={() => {
                onOpenChange(false);
                navigate("/checkout");
              }}
            >
              Proceed to checkout
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
