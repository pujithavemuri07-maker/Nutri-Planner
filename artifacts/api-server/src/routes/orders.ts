import { Router, type IRouter } from "express";
import { and, eq, desc, inArray, or } from "drizzle-orm";
import { db, dishesTable, ordersTable, usersTable, type OrderItemRow } from "@workspace/db";
import { CreateOrderBody, GetOrderParams } from "@workspace/api-zod";
import { attachUser, requireAuth } from "../lib/auth";
import { serializeOrder } from "../lib/serializers";

const router: IRouter = Router();

router.use(attachUser, requireAuth);

router.get("/orders", async (req, res): Promise<void> => {
  const user = req.currentUser!;
  const rows = await db
    .select({
      order: ordersTable,
      customer: usersTable,
    })
    .from(ordersTable)
    .innerJoin(usersTable, eq(ordersTable.customerId, usersTable.id))
    .where(eq(ordersTable.customerId, user.id))
    .orderBy(desc(ordersTable.placedAt));

  // Need chef per order
  const chefIds = Array.from(new Set(rows.map((r) => r.order.chefId)));
  const chefs = chefIds.length
    ? await db.select().from(usersTable).where(inArray(usersTable.id, chefIds))
    : [];
  const chefMap = new Map(chefs.map((c) => [c.id, c]));

  res.json(
    rows
      .map((r) => {
        const chef = chefMap.get(r.order.chefId);
        if (!chef) return null;
        return serializeOrder(r.order, r.customer, chef);
      })
      .filter((o): o is NonNullable<typeof o> => o !== null),
  );
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const user = req.currentUser!;
  const data = parsed.data;

  if (!data.items.length) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }

  const dishIds = data.items.map((i) => i.dishId);
  const dishRows = await db
    .select()
    .from(dishesTable)
    .where(inArray(dishesTable.id, dishIds));

  if (dishRows.length === 0) {
    res.status(400).json({ error: "No valid dishes" });
    return;
  }

  // Use first dish's chef (single-chef cart). If multi, group by chef into separate orders -- demo: single order, take first chef.
  const chefId = dishRows[0]!.chefId;

  const items: OrderItemRow[] = data.items.map((i) => {
    const dish = dishRows.find((d) => d.id === i.dishId);
    if (!dish) throw new Error(`Dish ${i.dishId} not found`);
    return {
      dishId: dish.id,
      dishName: dish.name,
      quantity: i.quantity,
      unitPrice: Number(dish.price),
    };
  });

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const deliveryFee = subtotal > 500 ? 0 : 30;
  const total = subtotal + deliveryFee;
  const estimatedMinutes = 30 + Math.floor(Math.random() * 16);

  const [order] = await db
    .insert(ordersTable)
    .values({
      customerId: user.id,
      chefId,
      items,
      subtotal: subtotal.toFixed(2),
      deliveryFee: deliveryFee.toFixed(2),
      total: total.toFixed(2),
      address: data.address,
      notes: data.notes ?? null,
      isCorporate: data.isCorporate ?? false,
      scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
      estimatedMinutes,
      status: "placed",
    })
    .returning();

  const [chef] = await db.select().from(usersTable).where(eq(usersTable.id, chefId));
  res.json(serializeOrder(order, user, chef));
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const user = req.currentUser!;

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(
      and(
        eq(ordersTable.id, params.data.id),
        or(
          eq(ordersTable.customerId, user.id),
          eq(ordersTable.chefId, user.id),
        ),
      ),
    );
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  const [customer] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, order.customerId));
  const [chef] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, order.chefId));
  res.json(serializeOrder(order, customer, chef));
});

export default router;
