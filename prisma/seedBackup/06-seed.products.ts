/**
 * Product Seed Script
 *
 * Purpose:
 * Seeds the historical product catalog: cakes, decorations, gifts, and variants.
 *
 * When to use:
 * Use only for a fresh environment or when you intentionally want to restore
 * products from code. Do not run on live while products are maintained through
 * the admin panel, because it can overwrite admin-updated product data.
 */

import { PrismaClient, ProductCategory } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

/* -----------------------------
   Prisma Setup
------------------------------ */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/* -----------------------------
   Seed Products
------------------------------ */
async function seedProducts(locationId: string): Promise<void> {
  console.log("Seeding products");

  const products = [
    /* ================= CAKES ================= */
    {
      name: "Black Forest",
      slug: "black-forest",
      image: "/media/booking/products/cake/blackforest.webp",
      description: "Classic black forest layered with chocolate cream and cherries.",
      category: ProductCategory.CAKE,
      sortOrder: 1,
      variants: [
        { label: "500g", regularPrice: 550, sortOrder: 1, isDefault: true },
        { label: "1kg", regularPrice: 1050, sortOrder: 2, isDefault: false },
      ],
    },
    {
      name: "Chocolate Brownie",
      slug: "chocolate-brownie",
      image: "/media/booking/products/cake/chocolate-brownie.webp",
      description: "Rich and fudgy chocolate brownie with deep cocoa flavor.",
      category: ProductCategory.CAKE,
      sortOrder: 2,
      variants: [
        { label: "500g", regularPrice: 650, sortOrder: 1, isDefault: true },
      ],
    },
    {
      name: "White Forest",
      slug: "white-forest",
      image: "/media/booking/products/cake/whiteforest.webp",
      description: "Soft vanilla sponge layered with fresh cream and cherries.",
      category: ProductCategory.CAKE,
      sortOrder: 3,
      variants: [
        { label: "500g", regularPrice: 700, sortOrder: 1, isDefault: true },
      ],
    },
    {
      name: "Mango",
      slug: "mango",
      image: "/media/booking/products/cake/mango.webp",
      description: "Fresh mango-flavored cake with smooth cream and soft layers.",
      category: ProductCategory.CAKE,
      sortOrder: 4,
      variants: [
        { label: "500g", regularPrice: 600, sortOrder: 1, isDefault: true },
      ],
    },
    {
      name: "Pineapple",
      slug: "pineapple",
      image: "/media/booking/products/cake/pineapple.webp",
      description: "Light pineapple cake topped with whipped cream and fruit glaze.",
      category: ProductCategory.CAKE,
      sortOrder: 5,
      variants: [
        { label: "350g", regularPrice: 450, sortOrder: 1, isDefault: true },
        { label: "500g", regularPrice: 550, sortOrder: 2, isDefault: false },
      ],
    },
    {
      name: "Butterscotch",
      slug: "butterscotch",
      image: "/media/booking/products/cake/butterscotch.webp",
      description: "Crunchy butterscotch with caramel flavor and creamy layers.",
      category: ProductCategory.CAKE,
      sortOrder: 6,
      variants: [
        { label: "500g", regularPrice: 600, sortOrder: 1, isDefault: true },
      ],
    },
    {
      name: "Fresh Fruit",
      slug: "fresh-fruit",
      image: "/media/booking/products/cake/fruit-cake.webp",
      description: "Loaded with fresh fruits and rich cream on soft sponge.",
      category: ProductCategory.CAKE,
      sortOrder: 7,
      variants: [
        { label: "500g", regularPrice: 650, sortOrder: 1, isDefault: true },
      ],
    },
    {
      name: "Red Velvet",
      slug: "red-velvet",
      image: "/media/booking/products/cake/red-velvet.webp",
      description: "Classic red velvet with smooth cream cheese frosting.",
      category: ProductCategory.CAKE,
      sortOrder: 8,
      variants: [
        { label: "350g", regularPrice: 500, sortOrder: 1, isDefault: true },
        { label: "500g", regularPrice: 700, sortOrder: 2, isDefault: false },
      ],
    },
    {
      name: "Classic Chocolate",
      slug: "classic-chocolate",
      image: "/media/booking/products/cake/chocolate.webp",
      description: "Moist chocolate sponge with rich creamy frosting.",
      category: ProductCategory.CAKE,
      sortOrder: 9,
      variants: [
        { label: "500g", regularPrice: 750, sortOrder: 1, isDefault: true },
      ],
    },

    /* ================= DECORATION ================= */
    {
      name: "Candle Path",
      slug: "candle-path",
      image: "/media/booking/products/decoration/candle-path.webp",
      description: "Beautiful candle path setup to enhance the entry ambiance.",
      category: ProductCategory.DECORATION,
      sortOrder: 1,
      variants: [{ label: "Standard", regularPrice: 300, sortOrder: 1, isDefault: true }],
    },
    {
      name: "LED Number",
      slug: "led-number",
      image: "/media/booking/products/decoration/led-number.webp",
      description: "Illuminated LED numbers perfect for birthdays and milestones.",
      category: ProductCategory.DECORATION,
      sortOrder: 2,
      variants: [{ label: "Standard", regularPrice: 100, sortOrder: 1, isDefault: true }],
    },
    {
      name: "Rose Heart",
      slug: "rose-heart",
      image: "/media/booking/products/decoration/rose-heart.webp",
      description: "Elegant heart-shaped rose decoration for a romantic setup.",
      category: ProductCategory.DECORATION,
      sortOrder: 3,
      variants: [{ label: "Standard", regularPrice: 300, sortOrder: 1, isDefault: true }],
    },
    {
      name: "Fog Entry (2 Matka)",
      slug: "fog-entry-2-matka",
      image: "/media/booking/products/decoration/fog-entry-matka-2.webp",
      description: "Grand fog entry effect using two matkas.",
      category: ProductCategory.DECORATION,
      sortOrder: 4,
      variants: [{ label: "Standard", regularPrice: 500, sortOrder: 1, isDefault: true }],
    },
    {
      name: "Fog Entry (1 Matka)",
      slug: "fog-entry-1-matka",
      image: "/media/booking/products/decoration/fog-entry-matka-1.webp",
      description: "Subtle fog entry setup with a single matka.",
      category: ProductCategory.DECORATION,
      sortOrder: 5,
      variants: [{ label: "Standard", regularPrice: 300, sortOrder: 1, isDefault: true }],
    },
    {
      name: "Bouquet",
      slug: "bouquet",
      image: "/media/booking/products/decoration/bouquet.webp",
      description: "Fresh and vibrant bouquet to complement any celebration.",
      category: ProductCategory.DECORATION,
      sortOrder: 6,
      variants: [{ label: "Standard", regularPrice: 400, sortOrder: 1, isDefault: true }],
    },
    {
      name: "Bubble Entry",
      slug: "bubble-entry",
      image: "/media/booking/products/decoration/bubble-entry.webp",
      description: "Fun and lively bubble entry setup.",
      category: ProductCategory.DECORATION,
      sortOrder: 7,
      variants: [{ label: "Standard", regularPrice: 300, sortOrder: 1, isDefault: true }],
    },
    {
      name: "Number Balloon Tower",
      slug: "number-balloon-tower",
      image: "/media/booking/products/decoration/number-balloon-tower.webp",
      description: "Eye-catching balloon tower shaped with numbers.",
      category: ProductCategory.DECORATION,
      sortOrder: 8,
      variants: [{ label: "Standard", regularPrice: 200, sortOrder: 1, isDefault: true }],
    },

    /* ================= GIFTS ================= */
    {
      name: "Eiffel Tower Rose Bottle",
      slug: "eiffel-rose-bottle",
      image: "/media/booking/products/gift/eiffel-rose-bottle.webp",
      description: "Elegant Eiffel tower showpiece with heart-shaped rose bottle.",
      category: ProductCategory.GIFT,
      sortOrder: 1,
      variants: [{ label: "Standard", regularPrice: 300, sortOrder: 1, isDefault: true }],
    },
    {
      name: "Golden Rose",
      slug: "golden-rose",
      image: "/media/booking/products/gift/golden-rose.webp",
      description: "Premium golden rose symbolizing everlasting love.",
      category: ProductCategory.GIFT,
      sortOrder: 2,
      variants: [{ label: "Standard", regularPrice: 200, sortOrder: 1, isDefault: true }],
    },
    {
      name: "Teddy with Mystery Box",
      slug: "teddy-mystery-box",
      image: "/media/booking/products/gift/teddy-mystery-box.webp",
      description: "Cute teddy paired with a surprise mystery box.",
      category: ProductCategory.GIFT,
      sortOrder: 3,
      variants: [{ label: "Standard", regularPrice: 449, sortOrder: 1, isDefault: true }],
    },
    {
      name: "Vintage Wind-Up Music Box",
      slug: "vintage-music-box",
      image: "/media/booking/products/gift/vintage-music-box.webp",
      description: "Classic wind-up music box with elegant vintage look.",
      category: ProductCategory.GIFT,
      sortOrder: 4,
      variants: [{ label: "Standard", regularPrice: 1299, sortOrder: 1, isDefault: true }],
    },
    {
      name: "Love Box with Gold Rose",
      slug: "love-box-gold-rose",
      image: "/media/booking/products/gift/love-box-gold-rose.webp",
      description: "Beautiful love box featuring a premium gold rose.",
      category: ProductCategory.GIFT,
      sortOrder: 5,
      variants: [{ label: "Standard", regularPrice: 250, sortOrder: 1, isDefault: true }],
    },
    {
      name: "Cute Couple on Bench",
      slug: "couple-bench",
      image: "/media/booking/products/gift/couple-bench.webp",
      description: "Adorable couple figurine sitting on a bench.",
      category: ProductCategory.GIFT,
      sortOrder: 6,
      variants: [{ label: "Standard", regularPrice: 499, sortOrder: 1, isDefault: true }],
    },
    {
      name: "Teddy Panda",
      slug: "teddy-panda",
      image: "/media/booking/products/gift/teddy-panda.webp",
      description: "Soft and cuddly panda teddy bear.",
      category: ProductCategory.GIFT,
      sortOrder: 7,
      variants: [{ label: "Standard", regularPrice: 500, sortOrder: 1, isDefault: true }],
    },
    {
      name: "Chocolate",
      slug: "chocolate",
      image: "/media/booking/products/gift/chocolate.webp",
      description: "Delicious chocolate perfect for gifting.",
      category: ProductCategory.GIFT,
      sortOrder: 8,
      variants: [{ label: "Standard", regularPrice: 210, sortOrder: 1, isDefault: true }],
    },
    {
      name: "Mystery Gramophone Music Box",
      slug: "gramophone-music-box",
      image: "/media/booking/products/gift/gramophone-music-box.webp",
      description: "Premium gramophone-style mystery music box.",
      category: ProductCategory.GIFT,
      sortOrder: 9,
      variants: [{ label: "Standard", regularPrice: 1199, sortOrder: 1, isDefault: true }],
    },
    {
      name: "Rose Teddy Bear",
      slug: "rose-teddy",
      image: "/media/booking/products/gift/rose-teddy.webp",
      description: "Luxury teddy bear crafted with rose petals.",
      category: ProductCategory.GIFT,
      sortOrder: 10,
      variants: [{ label: "Standard", regularPrice: 1600, sortOrder: 1, isDefault: true }],
    },
    {
      name: "Anime Figure",
      slug: "anime-figure",
      image: "/media/booking/products/gift/anime-figure.webp",
      description: "High-quality anime collectible figure.",
      category: ProductCategory.GIFT,
      sortOrder: 11,
      variants: [{ label: "Standard", regularPrice: 1000, sortOrder: 1, isDefault: true }],
    },
    {
      name: "Silver Bangle",
      slug: "silver-bangle",
      image: "/media/booking/products/gift/silver-bangle.webp",
      description: "Elegant silver bangle suitable for everyday wear.",
      category: ProductCategory.GIFT,
      sortOrder: 12,
      variants: [{ label: "Standard", regularPrice: 199, sortOrder: 1, isDefault: true }],
    },
    {
      name: "Bracelet & Watch Combo",
      slug: "bracelet-watch-combo",
      image: "/media/booking/products/gift/bracelet-watch-combo.webp",
      description: "Stylish bracelet and watch combo gift set.",
      category: ProductCategory.GIFT,
      sortOrder: 13,
      variants: [{ label: "Standard", regularPrice: 799, sortOrder: 1, isDefault: true }],
    },
  ];

  for (const product of products) {
    const savedProduct = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        image: product.image,
        description: product.description,
        category: product.category,
        sortOrder: product.sortOrder,
        isActive: true,
      },
      create: {
        name: product.name,
        slug: product.slug,
        image: product.image,
        description: product.description,
        category: product.category,
        locationId,
        sortOrder: product.sortOrder,
        isActive: true,
      },
    });

    await prisma.productVariant.deleteMany({
      where: { productId: savedProduct.id },
    });

    await prisma.productVariant.createMany({
      data: product.variants.map((v) => ({
        productId: savedProduct.id,
        label: v.label,
        regularPrice: v.regularPrice,
        salePrice: null,
        sortOrder: v.sortOrder,
        isDefault: v.isDefault,
        isActive: true,
      })),
    });
  }

  console.log("Products seeded");
}

/* -----------------------------
   Main
------------------------------ */
async function main(): Promise<void> {
  const location = await prisma.location.findFirst({
    where: { name: "Pitampura" },
  });

  if (!location) {
    throw new Error("Pitampura location not found. Seed locations first.");
  }

  await seedProducts(location.id);
}

main()
  .catch((e) => {
    console.error("Product seeding failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
