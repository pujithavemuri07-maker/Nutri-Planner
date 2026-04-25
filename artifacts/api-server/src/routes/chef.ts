import { Router, type IRouter } from "express";
import { and, eq, desc, sql } from "drizzle-orm";
import { db, dishesTable, ordersTable, usersTable } from "@workspace/db";
import {
  CreateDishBody,
  UpdateDishBody,
  UpdateDishParams,
  DeleteDishParams,
  UpdateOrderStatusBody,
  UpdateOrderStatusParams,
} from "@workspace/api-zod";
import { attachUser, requireChef } from "../lib/auth";
import { serializeDish, serializeOrder } from "../lib/serializers";

const router: IRouter = Router();

router.use(attachUser, requireChef);

router.get("/chef/dishes", async (req, res): Promise<void> => {
  const chef = req.currentUser!;
  const rows = await db
    .select()
    .from(dishesTable)
    .where(eq(dishesTable.chefId, chef.id))
    .orderBy(desc(dishesTable.createdAt));
  res.json(
    rows.map((d) =>
      serializeDish(d, { name: chef.name, kitchenName: chef.kitchenName }),
    ),
  );
});

router.post("/chef/dishes", async (req, res): Promise<void> => {
  const parsed = CreateDishBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const chef = req.currentUser!;
  const data = parsed.data;
  const [created] = await db
    .insert(dishesTable)
    .values({
      chefId: chef.id,
      name: data.name,
      description: data.description,
      price: String(data.price),
      category: data.category,
      tags: data.tags ?? [],
      prepMinutes: data.prepMinutes,
      calories: data.calories ?? null,
      proteinGrams: data.proteinGrams ?? null,
      imageUrl: data.imageUrl ?? null,
      ecoFriendly: data.ecoFriendly ?? true,
      available: data.available ?? true,
    })
    .returning();
  res.json(
    serializeDish(created, { name: chef.name, kitchenName: chef.kitchenName }),
  );
});

router.patch("/chef/dishes/:id", async (req, res): Promise<void> => {
  const params = UpdateDishParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateDishBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const chef = req.currentUser!;
  const data = parsed.data;
  const updates: Record<string, unknown> = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.description !== undefined) updates.description = data.description;
  if (data.price !== undefined) updates.price = String(data.price);
  if (data.category !== undefined) updates.category = data.category;
  if (data.tags !== undefined) updates.tags = data.tags;
  if (data.prepMinutes !== undefined) updates.prepMinutes = data.prepMinutes;
  if (data.calories !== undefined) updates.calories = data.calories;
  if (data.proteinGrams !== undefined) updates.proteinGrams = data.proteinGrams;
  if (data.imageUrl !== undefined) updates.imageUrl = data.imageUrl;
  if (data.ecoFriendly !== undefined) updates.ecoFriendly = data.ecoFriendly;
  if (data.available !== undefined) updates.available = data.available;

  const [updated] = await db
    .update(dishesTable)
    .set(updates)
    .where(
      and(eq(dishesTable.id, params.data.id), eq(dishesTable.chefId, chef.id)),
    )
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Dish not found" });
    return;
  }
  res.json(
    serializeDish(updated, { name: chef.name, kitchenName: chef.kitchenName }),
  );
});

router.delete("/chef/dishes/:id", async (req, res): Promise<void> => {
  const params = DeleteDishParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const chef = req.currentUser!;
  const [deleted] = await db
    .delete(dishesTable)
    .where(
      and(eq(dishesTable.id, params.data.id), eq(dishesTable.chefId, chef.id)),
    )
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Dish not found" });
    return;
  }
  res.json({ success: true });
});

router.get("/chef/orders", async (req, res): Promise<void> => {
  const chef = req.currentUser!;
  const rows = await db
    .select({ order: ordersTable, customer: usersTable })
    .from(ordersTable)
    .innerJoin(usersTable, eq(ordersTable.customerId, usersTable.id))
    .where(eq(ordersTable.chefId, chef.id))
    .orderBy(desc(ordersTable.placedAt));
  res.json(rows.map((r) => serializeOrder(r.order, r.customer, chef)));
});

router.patch("/chef/orders/:id/status", async (req, res): Promise<void> => {
  const params = UpdateOrderStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const chef = req.currentUser!;
  const [updated] = await db
    .update(ordersTable)
    .set({ status: parsed.data.status })
    .where(
      and(eq(ordersTable.id, params.data.id), eq(ordersTable.chefId, chef.id)),
    )
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  const [customer] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, updated.customerId));
  res.json(serializeOrder(updated, customer, chef));
});

router.get("/chef/stats", async (req, res): Promise<void> => {
  const chef = req.currentUser!;
  const orderRows = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.chefId, chef.id));

  const totalOrders = orderRows.length;
  const activeOrders = orderRows.filter(
    (o) => o.status === "placed" || o.status === "preparing" || o.status === "out_for_delivery",
  ).length;
  const deliveredOrders = orderRows.filter((o) => o.status === "delivered").length;
  const revenue = orderRows
    .filter((o) => o.status === "delivered")
    .reduce((s, o) => s + Number(o.total), 0);

  const dishes = await db
    .select()
    .from(dishesTable)
    .where(eq(dishesTable.chefId, chef.id))
    .orderBy(desc(dishesTable.rating))
    .limit(4);

  const avgRating =
    dishes.length > 0
      ? dishes.reduce((s, d) => s + Number(d.rating), 0) / dishes.length
      : 0;

  res.json({
    totalOrders,
    activeOrders,
    deliveredOrders,
    revenue,
    avgRating: Number(avgRating.toFixed(2)),
    topDishes: dishes.map((d) =>
      serializeDish(d, { name: chef.name, kitchenName: chef.kitchenName }),
    ),
  });

  // suppress unused
  void sql;
});

export default router;
