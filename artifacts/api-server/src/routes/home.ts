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
    topChefs: chefRows
      .filter((c) => c.dishCount > 0)
      .map((c) => ({
        id: c.chef.id,
        name: c.chef.name,
        kitchenName: c.chef.kitchenName,
        bio: c.chef.bio,
        dishCount: c.dishCount,
      })),
    categories: [
      { id: "veg", label: "Pure Veg", count: categoryCounts.veg ?? 0 },
      { id: "non_veg", label: "Non-Veg", count: categoryCounts.non_veg ?? 0 },
      { id: "diet", label: "Diet Meals", count: categoryCounts.diet ?? 0 },
      { id: "gym", label: "High Protein", count: categoryCounts.gym ?? 0 },
      { id: "elderly", label: "Elderly Care", count: categoryCounts.elderly ?? 0 },
      { id: "tiffin", label: "Daily Tiffin", count: categoryCounts.tiffin ?? 0 },
    ],
    stats: {
      totalDishes: allDishes.length,
      totalChefs: chefRows.length,
    },
  });
});

export default router;
