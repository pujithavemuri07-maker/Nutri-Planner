import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";

export const otpsTable = pgTable("otps", {
  phone: varchar("phone", { length: 20 }).primaryKey(),
  code: varchar("code", { length: 10 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export type OtpRow = typeof otpsTable.$inferSelect;
