import { db, usersTable, dishesTable, ordersTable } from "@workspace/db";

async function seed() {
  console.log("Clearing existing seed data…");
  await db.delete(ordersTable);
  await db.delete(dishesTable);
  await db.delete(usersTable);

  console.log("Creating chefs…");
  const chefs = await db
    .insert(usersTable)
    .values([
      {
        phone: "9000000001",
        name: "Meera Sharma",
        role: "chef",
        kitchenName: "Meera's Rasoi",
        bio: "Traditional Rajasthani recipes from my grandmother's kitchen. 14 years cooking for the neighbourhood.",
        address: "Indiranagar, Bengaluru",
      },
      {
        phone: "9000000002",
        name: "Lakshmi Iyer",
        role: "chef",
        kitchenName: "Iyer Tiffin Centre",
        bio: "South Indian breakfast and tiffins, fresh batter every morning.",
        address: "Koramangala, Bengaluru",
      },
      {
        phone: "9000000003",
        name: "Sunita Patel",
        role: "chef",
        kitchenName: "Sunita's Healthy Bites",
        bio: "Diet-friendly, low-oil meals for busy professionals.",
        address: "HSR Layout, Bengaluru",
      },
      {
        phone: "9000000004",
        name: "Rohan Desai",
        role: "chef",
        kitchenName: "Protein Dabba",
        bio: "Macro-counted, high-protein meals for fitness folks.",
        address: "Whitefield, Bengaluru",
      },
      {
        phone: "9000000005",
        name: "Aruna Nair",
        role: "chef",
        kitchenName: "Aruna's Soft Meals",
        bio: "Gentle, low-spice meals designed for elderly parents.",
        address: "Jayanagar, Bengaluru",
      },
    ])
    .returning();

  const [meera, lakshmi, sunita, rohan, aruna] = chefs;

  console.log("Creating customer…");
  await db
    .insert(usersTable)
    .values({
      phone: "9999999999",
      name: "Demo Customer",
      role: "customer",
      address: "Flat 304, MG Road, Bengaluru — 560001",
    });

  console.log("Creating dishes…");
  const dishes = [
    {
      chefId: meera.id,
      name: "Dal Bati Churma",
      description:
        "Slow-cooked panchmel dal with crisp baked baati, ghee, and sweet churma — eaten by hand the way mum taught us.",
      price: "249",
      category: "veg" as const,
      tags: ["healthy"] as const,
      prepMinutes: 35,
      calories: 620,
      proteinGrams: 22,
      imageUrl:
        "https://images.unsplash.com/photo-1626132647523-66f6bb6ed414?w=800&q=70&auto=format&fit=crop",
      rating: "4.8",
      reviewCount: 142,
    },
    {
      chefId: meera.id,
      name: "Gatte ki Sabzi with Roti",
      description:
        "Soft besan dumplings simmered in spiced yogurt gravy. Served with two phulka rotis hot off the tawa.",
      price: "189",
      category: "veg" as const,
      tags: ["healthy"] as const,
      prepMinutes: 25,
      calories: 480,
      proteinGrams: 18,
      imageUrl:
        "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&q=70&auto=format&fit=crop",
      rating: "4.6",
      reviewCount: 87,
    },
    {
      chefId: lakshmi.id,
      name: "Idli Sambhar with Coconut Chutney",
      description:
        "Three soft idlis steamed fresh, hot sambhar with drumsticks, and creamy coconut chutney.",
      price: "129",
      category: "tiffin" as const,
      tags: ["healthy", "tiffin"] as const,
      prepMinutes: 15,
      calories: 320,
      proteinGrams: 14,
      imageUrl:
        "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=70&auto=format&fit=crop",
      rating: "4.9",
      reviewCount: 312,
    },
    {
      chefId: lakshmi.id,
      name: "Crispy Masala Dosa",
      description:
        "Golden, paper-thin dosa wrapped around spiced potato masala. With sambhar and red chutney.",
      price: "149",
      category: "tiffin" as const,
      tags: ["healthy"] as const,
      prepMinutes: 20,
      calories: 410,
      proteinGrams: 11,
      imageUrl:
        "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&q=70&auto=format&fit=crop",
      rating: "4.7",
      reviewCount: 198,
    },
    {
      chefId: sunita.id,
      name: "Sprouts Moong Khichdi",
      description:
        "One-pot moong dal khichdi with sprouts, vegetables, ghee tadka and a side of curd.",
      price: "169",
      category: "diet" as const,
      tags: ["healthy", "low_calorie"] as const,
      prepMinutes: 25,
      calories: 380,
      proteinGrams: 19,
      imageUrl:
        "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=70&auto=format&fit=crop",
      rating: "4.7",
      reviewCount: 96,
    },
    {
      chefId: sunita.id,
      name: "Ragi Java with Jaggery",
      description:
        "Warm, gut-friendly ragi porridge sweetened with jaggery, topped with crushed almonds.",
      price: "99",
      category: "diet" as const,
      tags: ["healthy", "low_calorie"] as const,
      prepMinutes: 12,
      calories: 240,
      proteinGrams: 8,
      imageUrl:
        "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=800&q=70&auto=format&fit=crop",
      rating: "4.5",
      reviewCount: 64,
    },
    {
      chefId: sunita.id,
      name: "Quinoa Vegetable Pulao",
      description:
        "Light quinoa pulao with seasonal vegetables, low oil, finished with raisins and cashews.",
      price: "199",
      category: "diet" as const,
      tags: ["healthy", "low_calorie"] as const,
      prepMinutes: 20,
      calories: 360,
      proteinGrams: 13,
      imageUrl:
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=70&auto=format&fit=crop",
      rating: "4.6",
      reviewCount: 71,
    },
    {
      chefId: rohan.id,
      name: "Paneer Bhurji with 4 Phulkas",
      description:
        "Scrambled paneer bhurji loaded with capsicum and onions. Four whole-wheat phulkas. 38g protein.",
      price: "229",
      category: "gym" as const,
      tags: ["protein"] as const,
      prepMinutes: 18,
      calories: 540,
      proteinGrams: 38,
      imageUrl:
        "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=800&q=70&auto=format&fit=crop",
      rating: "4.8",
      reviewCount: 154,
    },
    {
      chefId: rohan.id,
      name: "Grilled Chicken & Brown Rice Bowl",
      description:
        "Tandoori-spiced grilled chicken breast, brown rice, sautéed beans and a wedge of lemon.",
      price: "289",
      category: "non_veg" as const,
      tags: ["protein"] as const,
      prepMinutes: 25,
      calories: 580,
      proteinGrams: 45,
      imageUrl:
        "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=70&auto=format&fit=crop",
      rating: "4.7",
      reviewCount: 121,
    },
    {
      chefId: rohan.id,
      name: "Egg White Bhurji & Multigrain Toast",
      description:
        "Egg-white bhurji with onion-tomato masala and two slices of multigrain toast. 32g protein.",
      price: "179",
      category: "gym" as const,
      tags: ["protein", "low_calorie"] as const,
      prepMinutes: 12,
      calories: 320,
      proteinGrams: 32,
      imageUrl:
        "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=70&auto=format&fit=crop",
      rating: "4.6",
      reviewCount: 88,
    },
    {
      chefId: aruna.id,
      name: "Soft Khichdi with Ghee",
      description:
        "Easy-to-chew rice and dal khichdi, mildly spiced, with a spoonful of pure ghee.",
      price: "139",
      category: "elderly" as const,
      tags: ["healthy"] as const,
      prepMinutes: 20,
      calories: 380,
      proteinGrams: 14,
      imageUrl:
        "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=70&auto=format&fit=crop",
      rating: "4.9",
      reviewCount: 78,
    },
    {
      chefId: aruna.id,
      name: "Vegetable Daliya Upma",
      description:
        "Light broken-wheat upma with carrots, peas and beans. Easy on digestion, perfect for evenings.",
      price: "119",
      category: "elderly" as const,
      tags: ["healthy", "low_calorie"] as const,
      prepMinutes: 15,
      calories: 280,
      proteinGrams: 11,
      imageUrl:
        "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800&q=70&auto=format&fit=crop",
      rating: "4.7",
      reviewCount: 52,
    },
    {
      chefId: lakshmi.id,
      name: "Lemon Rice with Papad",
      description:
        "Tangy lemon rice with peanuts, curry leaves and a crisp papad on the side.",
      price: "139",
      category: "tiffin" as const,
      tags: ["tiffin"] as const,
      prepMinutes: 15,
      calories: 420,
      proteinGrams: 9,
      imageUrl:
        "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=70&auto=format&fit=crop",
      rating: "4.5",
      reviewCount: 74,
    },
    {
      chefId: meera.id,
      name: "Aloo Paratha with Curd & Pickle",
      description:
        "Two stuffed aloo parathas roasted with desi ghee, with chilled curd and lemon pickle.",
      price: "169",
      category: "veg" as const,
      tags: ["tiffin"] as const,
      prepMinutes: 18,
      calories: 560,
      proteinGrams: 16,
      imageUrl:
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=70&auto=format&fit=crop",
      rating: "4.8",
      reviewCount: 203,
    },
  ];

  await db.insert(dishesTable).values(
    dishes.map((d) => ({
      ...d,
      tags: [...d.tags],
      ecoFriendly: true,
      available: true,
    })),
  );

  console.log(`Seeded ${chefs.length} chefs and ${dishes.length} dishes.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
