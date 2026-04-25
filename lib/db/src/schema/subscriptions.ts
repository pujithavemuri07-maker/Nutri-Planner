import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const subscriptionsTable = pgTable("subscriptions", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  planId: text("plan_id").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  startDate: timestamp("start_date", { withTimezone: true })
    .notNull()
    .defaultNow(),
  active: boolean("active").notNull().default(true),
});

export type SubscriptionRow = typeof subscriptionsTable.$inferSelect;
