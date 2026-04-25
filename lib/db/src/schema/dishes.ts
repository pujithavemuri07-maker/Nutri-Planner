import {
  pgTable,
  text,
  numeric,
  integer,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const dishesTable = pgTable("dishes", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  chefId: text("chef_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category", {
    enum: ["veg", "non_veg", "diet", "gym", "elderly", "tiffin"],
  }).notNull(),
  tags: text("tags").array().notNull().default(sql`ARRAY[]::text[]`),
  prepMinutes: integer("prep_minutes").notNull(),
  calories: integer("calories"),
  proteinGrams: integer("protein_grams"),
  imageUrl: text("image_url"),
  rating: numeric("rating", { precision: 3, scale: 2 }).notNull().default("4.7"),
  reviewCount: integer("review_count").notNull().default(0),
  ecoFriendly: boolean("eco_friendly").notNull().default(true),
  available: boolean("available").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type DishRow = typeof dishesTable.$inferSelect;
