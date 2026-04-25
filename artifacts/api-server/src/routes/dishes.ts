import { Router, type IRouter } from "express";
import { and, eq, ilike, or, desc } from "drizzle-orm";
import { db, dishesTable, usersTable } from "@workspace/db";
import { ListDishesQueryParams, GetDishParams } from "@workspace/api-zod";
import { serializeDish } from "../lib/serializers";

const router: IRouter = Router();

router.get("/dishes", async (req, res): Promise<void> => {
  const parsed = ListDishesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { q, category, tag, chefId } = parsed.data;

  const conditions = [eq(dishesTable.available, true)];
  if (q && q.trim()) {
    const like = `%${q.trim()}%`;
    conditions.push(
      or(ilike(dishesTable.name, like), ilike(dishesTable.description, like))!,
    );
  }
  if (category) conditions.push(eq(dishesTable.category, category));
  if (chefId) conditions.push(eq(dishesTable.chefId, chefId));

  const rows = await db
    .select({ dish: dishesTable, chef: usersTable })
    .from(dishesTable)
    .innerJoin(usersTable, eq(dishesTable.chefId, usersTable.id))
    .where(and(...conditions))
    .orderBy(desc(dishesTable.rating));

  let dishes = rows.map((r) =>
    serializeDish(r.dish, { name: r.chef.name, kitchenName: r.chef.kitchenName }),
  );

  if (tag) {
    dishes = dishes.filter((d) => d.tags.includes(tag));
  }

  res.json(dishes);
});

router.get("/dishes/:id", async (req, res): Promise<void> => {
  const parsed = GetDishParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db
    .select({ dish: dishesTable, chef: usersTable })
    .from(dishesTable)
    .innerJoin(usersTable, eq(dishesTable.chefId, usersTable.id))
    .where(eq(dishesTable.id, parsed.data.id))
    .limit(1);

  if (!row) {
    res.status(404).json({ error: "Dish not found" });
    return;
  }

  res.json(
    serializeDish(row.dish, {
      name: row.chef.name,
      kitchenName: row.chef.kitchenName,
    }),
  );
});

export default router;
