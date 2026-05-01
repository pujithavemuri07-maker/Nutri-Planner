import { Router, type IRouter } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db, dishesTable, usersTable } from "@workspace/db";
import { serializeDish } from "../lib/serializers";

const router: IRouter = Router();

router.get("/home/featured", async (_req, res): Promise<void> => {
  const featuredRows = await db
    .select({ dish: dishesTable, chef: usersTable })
    .from(dishesTable)
    .innerJoin(usersTable, eq(dishesTable.chefId, usersTable.id))
    .where(eq(dishesTable.available, true))
    .orderBy(desc(dishesTable.rating))
    .limit(8);

  const chefRows = await db
    .select({
      chef: usersTable,
      dishCount: sql<number>`count(${dishesTable.id})::int`,
    })
    .from(usersTable)
    .leftJoin(dishesTable, eq(dishesTable.chefId, usersTable.id))
    .where(eq(usersTable.role, "chef"))
    .groupBy(usersTable.id)
    .orderBy(desc(sql`count(${dishesTable.id})`))
    .limit(6);

  const allDishes = await db.select().from(dishesTable).where(eq(dishesTable.available, true));
  const categoryCounts: Record<string, number> = {};
  for (const d of allDishes) {
    categoryCounts[d.category] = (categoryCounts[d.category] ?? 0) + 1;
  }

  res.json({
    featuredDishes: featuredRows.map((r) =>
      serializeDish(r.dish, {
        name: r.chef.name,
        kitchenName: r.chef.kitchenName,
      }),
    ),
    topRatedDishes: featuredRows.map((r) =>
      serializeDish(r.dish, {
        name: r.chef.name,
        kitchenName: r.chef.kitchenName,
      }),
    ),
    topChefs: chefRows.map((c) => ({
      id: c.chef.id,
      phone: c.chef.phone,
      name: c.chef.name,
      role: c.chef.role,
      kitchenName: c.chef.kitchenName,
      bio: c.chef.bio,
      address: c.chef.address,
      createdAt: c.chef.createdAt,
    })),
    categoryCounts: [
      { category: "veg" as const, count: categoryCounts.veg ?? 0 },
      { category: "non_veg" as const, count: categoryCounts.non_veg ?? 0 },
      { category: "diet" as const, count: categoryCounts.diet ?? 0 },
      { category: "gym" as const, count: categoryCounts.gym ?? 0 },
      { category: "elderly" as const, count: categoryCounts.elderly ?? 0 },
      { category: "tiffin" as const, count: categoryCounts.tiffin ?? 0 },
    ],
  });
});

export default router;
