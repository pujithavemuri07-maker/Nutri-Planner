export const SUBSCRIPTION_PLANS = [
  {
    id: "plan-tiffin-weekly",
    name: "Daily Tiffin — Weekly",
    description:
      "5 home-cooked lunch tiffins delivered to your door every weekday. Rotating menu of dal, sabzi, roti, rice and salad.",
    pricePerMeal: 159,
    mealsPerWeek: 5,
    frequency: "weekly" as const,
    category: "tiffin" as const,
    forCorporate: false,
    highlights: [
      "Rotating weekly menu",
      "Eco-friendly tiffin packaging",
      "Free delivery up to 5 km",
    ],
  },
  {
    id: "plan-protein-weekly",
    name: "Protein Power — Weekly",
    description:
      "High-protein meals (40g+) cooked by gym-friendly home chefs. Paneer, sprouts, dal, lean curries.",
    pricePerMeal: 219,
    mealsPerWeek: 5,
    frequency: "weekly" as const,
    category: "gym" as const,
    forCorporate: false,
    highlights: ["40g+ protein per meal", "Macros on every label", "Pause anytime"],
  },
  {
    id: "plan-elderly-monthly",
    name: "Elderly Care — Monthly",
    description:
      "Soft, low-spice, home-style meals designed for elderly parents — twice a day for 30 days.",
    pricePerMeal: 139,
    mealsPerWeek: 14,
    frequency: "monthly" as const,
    category: "elderly" as const,
    forCorporate: false,
    highlights: ["Easy to chew", "Low oil & low spice", "Twice-daily delivery"],
  },
  {
    id: "plan-corp-lunch",
    name: "Office Lunch — Corporate",
    description:
      "Bulk lunch program for offices: 25-200 meals daily, scheduled drop-off, single invoice.",
    pricePerMeal: 129,
    mealsPerWeek: 5,
    frequency: "weekly" as const,
    category: "tiffin" as const,
    forCorporate: true,
    highlights: ["Single invoice", "Veg + Non-veg options", "Scheduled delivery windows"],
  },
  {
    id: "plan-corp-events",
    name: "Corporate Events — Monthly",
    description:
      "Monthly retainer for board lunches, all-hands and offsites. Curated chef menus.",
    pricePerMeal: 249,
    mealsPerWeek: 8,
    frequency: "monthly" as const,
    category: "veg" as const,
    forCorporate: true,
    highlights: ["Curated by partner chefs", "Setup + servers included", "Custom menus"],
  },
];

export type SubscriptionPlanRow = (typeof SUBSCRIPTION_PLANS)[number];
