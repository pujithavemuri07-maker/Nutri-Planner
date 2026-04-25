import type { DishRow, OrderRow, UserRow } from "@workspace/db";

export function serializeUser(user: UserRow) {
  return {
    id: user.id,
    phone: user.phone,
    name: user.name,
    role: user.role,
    kitchenName: user.kitchenName,
    bio: user.bio,
    address: user.address,
    createdAt: user.createdAt.toISOString(),
  };
}

export function serializeDish(
  dish: DishRow,
  chef?: { name: string; kitchenName: string | null },
) {
  return {
    id: dish.id,
    chefId: dish.chefId,
    chefName: chef?.name ?? "",
    kitchenName: chef?.kitchenName ?? null,
    name: dish.name,
    description: dish.description,
    price: Number(dish.price),
    category: dish.category,
    tags: dish.tags ?? [],
    prepMinutes: dish.prepMinutes,
    calories: dish.calories,
    proteinGrams: dish.proteinGrams,
    imageUrl: dish.imageUrl,
    rating: Number(dish.rating),
    reviewCount: dish.reviewCount,
    ecoFriendly: dish.ecoFriendly,
    available: dish.available,
    createdAt: dish.createdAt.toISOString(),
  };
}

export function serializeOrder(
  order: OrderRow,
  customer: UserRow,
  chef: UserRow,
) {
  return {
    id: order.id,
    customerId: order.customerId,
    customerName: customer.name,
    customerPhone: customer.phone,
    chefId: order.chefId,
    chefName: chef.name,
    kitchenName: chef.kitchenName,
    items: order.items,
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee),
    total: Number(order.total),
    status: order.status,
    address: order.address,
    notes: order.notes,
    estimatedMinutes: order.estimatedMinutes,
    placedAt: order.placedAt.toISOString(),
    scheduledFor: order.scheduledFor ? order.scheduledFor.toISOString() : null,
    isCorporate: order.isCorporate,
  };
}
