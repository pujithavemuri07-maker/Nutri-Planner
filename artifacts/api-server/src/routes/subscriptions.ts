import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, subscriptionsTable } from "@workspace/db";
import { CreateSubscriptionBody } from "@workspace/api-zod";
import { attachUser, requireAuth } from "../lib/auth";
import { SUBSCRIPTION_PLANS } from "../lib/plans";

const router: IRouter = Router();

router.get("/subscriptions/plans", async (_req, res): Promise<void> => {
  res.json(SUBSCRIPTION_PLANS);
});

router.get(
  "/subscriptions/mine",
  attachUser,
  requireAuth,
  async (req, res): Promise<void> => {
    const user = req.currentUser!;
    const rows = await db
      .select()
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.userId, user.id))
      .orderBy(desc(subscriptionsTable.startDate));
    res.json(
      rows.map((s) => ({
        id: s.id,
        userId: s.userId,
        planId: s.planId,
        planName: SUBSCRIPTION_PLANS.find((p) => p.id === s.planId)?.name ?? s.planId,
        deliveryAddress: s.deliveryAddress,
        startDate: s.startDate.toISOString(),
        active: s.active,
      })),
    );
  },
);

router.post(
  "/subscriptions",
  attachUser,
  requireAuth,
  async (req, res): Promise<void> => {
    const parsed = CreateSubscriptionBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const user = req.currentUser!;
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === parsed.data.planId);
    if (!plan) {
      res.status(400).json({ error: "Unknown plan" });
      return;
    }
    const [created] = await db
      .insert(subscriptionsTable)
      .values({
        userId: user.id,
        planId: plan.id,
        deliveryAddress: parsed.data.deliveryAddress,
        startDate: new Date(),
        active: true,
      })
      .returning();
    res.json({
      id: created.id,
      userId: created.userId,
      planId: created.planId,
      planName: plan.name,
      deliveryAddress: created.deliveryAddress,
      startDate: created.startDate.toISOString(),
      active: created.active,
    });
  },
);

export default router;
