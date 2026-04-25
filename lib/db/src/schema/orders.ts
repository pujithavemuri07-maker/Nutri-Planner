import {
  pgTable,
  text,
  numeric,
  integer,
  timestamp,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export type OrderItemRow = {
  dishId: string;
  dishName: string;
  quantity: number;
  unitPrice: number;
};

export const ordersTable = pgTable("orders", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  customerId: text("customer_id").notNull(),
  chefId: text("chef_id").notNull(),
  items: jsonb("items").$type<OrderItemRow[]>().notNull(),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: numeric("delivery_fee", { precision: 10, scale: 2 })
    .notNull()
    .default("30"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status", {
    enum: ["placed", "preparing", "out_for_delivery", "delivered", "cancelled"],
  })
    .notNull()
    .default("placed"),
  address: text("address").notNull(),
  notes: text("notes"),
  estimatedMinutes: integer("estimated_minutes").notNull().default(35),
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
  isCorporate: boolean("is_corporate").notNull().default(false),
  placedAt: timestamp("placed_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type OrderRow = typeof ordersTable.$inferSelect;
