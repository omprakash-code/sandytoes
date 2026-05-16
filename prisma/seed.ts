/**
 * Master Seed File
 *
 * Current live-safe mode: seeds only Noida location, theatres, slot templates,
 * and generated slots. Pitampura theatres, products, occasions, app settings,
 * and admin data are intentionally not run because they are managed from admin
 * on live and should not be overwritten by deployment seeding.
 *
 * Run with:
 *   npx prisma db seed
 *
 * Optional:
 *   SEED_SLOT_DAYS_AHEAD=1 npx prisma db seed
 *
 * To restore full historical seeding, uncomment the disabled calls in main()
 * only after confirming live data may be overwritten.
 */

import "dotenv/config";
import { PrismaClient, UserRole, ProductCategory } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import { LOCATION_SEED_CONFIGS } from "./seedBackup/location-theatre-config";

/* --------------------------------
   Prisma Setup (ONE INSTANCE ONLY)
--------------------------------- */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const DEFAULT_SLOT_DAYS_TO_GENERATE = 90;
const TARGET_LOCATION_NAMES = ["Noida Sector 144"];
const targetLocationNameSet = new Set<string>(TARGET_LOCATION_NAMES);

/* --------------------------------
   ADMIN USER SEED
--------------------------------- */
async function seedAdmin() {
  console.log("Seeding admin user...");

  const adminEmail = "admin@sandytoes.com";
  const adminPassword = "Admin@123";
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { phone: "9999999999" },
    update: {
      passwordHash: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
      isGuest: false,
    },
    create: {
      name: "Arpan Mittal",
      email: adminEmail,
      phone: "9999999999",
      passwordHash: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
      isGuest: false,
    },
  });

  console.log("Admin user seeded");
}

/* --------------------------------
   LOCATION SEED
--------------------------------- */
async function seedLocations() {
  console.log("Seeding locations...");

  for (const loc of LOCATION_SEED_CONFIGS.filter((location) =>
    targetLocationNameSet.has(location.name)
  )) {
    await prisma.location.upsert({
      where: { name: loc.name },
      update: {
        city: loc.city,
        sortOrder: loc.sortOrder,
        isActive: true,
      },
      create: {
        name: loc.name,
        city: loc.city,
        sortOrder: loc.sortOrder,
        isActive: true,
      },
    });
  }

  console.log(" Locations seeded");
}

/* -----------------------------
   Seed Theatres
------------------------------ */
async function seedTheatres() {
  console.log("Seeding theatres");

  for (const locationConfig of LOCATION_SEED_CONFIGS.filter((location) =>
    targetLocationNameSet.has(location.name)
  )) {
    const location = await prisma.location.findUnique({
      where: { name: locationConfig.name },
    });

    if (!location) {
      throw new Error(`${locationConfig.name} location not found. Seed locations first.`);
    }

    for (const theatre of locationConfig.theatres) {
      await prisma.theatre.upsert({
        where: {
          name_locationId: {
            name: theatre.name,
            locationId: location.id,
          },
        },
        update: {
          images: theatre.images,
          capacity: theatre.capacity,
          baseGuests: theatre.baseGuests,
          hasFood: theatre.hasFood,
          decorationPrice: theatre.decorationPrice,
          extraPersonPrice: theatre.extraPersonPrice,
          menuFile: theatre.menuFile,
          mapUrl: theatre.mapUrl,
          footerMessage: theatre.footerMessage ?? null,
          cardContent: theatre.cardContent ?? undefined,
          sortOrder: theatre.sortOrder,
          isActive: true,
        },
        create: {
          name: theatre.name,
          images: theatre.images,
          capacity: theatre.capacity,
          baseGuests: theatre.baseGuests,
          hasFood: theatre.hasFood,
          decorationPrice: theatre.decorationPrice,
          extraPersonPrice: theatre.extraPersonPrice,
          menuFile: theatre.menuFile,
          mapUrl: theatre.mapUrl,
          footerMessage: theatre.footerMessage ?? null,
          cardContent: theatre.cardContent ?? undefined,
          sortOrder: theatre.sortOrder,
          isActive: true,
          locationId: location.id,
        },
      });
    }
  }

  console.log("Theatres seeded");
}

/* -----------------------------
   Helpers
------------------------------ */
function calculateDuration(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);

  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;

  return endMin > startMin
    ? endMin - startMin
    : endMin + 1440 - startMin;
}

/* -----------------------------
   Seed Slot Templates
------------------------------ */
async function seedSlotTemplates(): Promise<void> {
  console.log("Seeding slot templates");

  for (const locationConfig of LOCATION_SEED_CONFIGS.filter((location) =>
    targetLocationNameSet.has(location.name)
  )) {
    const location = await prisma.location.findUnique({
      where: { name: locationConfig.name },
      select: {
        id: true,
        theatres: {
          where: { isActive: true },
          select: { id: true, name: true },
        },
      },
    });

    if (!location) {
      throw new Error(`${locationConfig.name} location not found. Seed locations first.`);
    }

    const theatreIdByName = new Map(
      location.theatres.map((theatre) => [theatre.name, theatre.id])
    );

    for (const theatreConfig of locationConfig.theatres) {
      const theatreId = theatreIdByName.get(theatreConfig.name);

      if (!theatreId) {
        throw new Error(
          `${theatreConfig.name} not found for ${locationConfig.name}. Seed theatres first.`
        );
      }

      for (const slot of theatreConfig.slotTemplates) {
        const durationMin = calculateDuration(slot.startTime, slot.endTime);

        await prisma.slotTemplate.upsert({
          where: {
            theatreId_startTime_endTime: {
              theatreId,
              startTime: slot.startTime,
              endTime: slot.endTime,
            },
          },
          update: {
            regularPrice: slot.regularPrice,
            salePrice: slot.salePrice ?? null,
            durationMin,
            bufferMin: slot.bufferMin ?? 30,
            decorationMandatory: slot.decorationMandatory ?? false,
            isActive: true,
          },
          create: {
            theatreId,
            startTime: slot.startTime,
            endTime: slot.endTime,
            durationMin,
            bufferMin: slot.bufferMin ?? 30,
            regularPrice: slot.regularPrice,
            salePrice: slot.salePrice ?? null,
            decorationMandatory: slot.decorationMandatory ?? false,
            isActive: true,
          },
        });
      }
    }
  }

  console.log("Slot templates seeded");
}

/* -----------------------------
   Seed Slots
------------------------------ */
function resolveSlotDaysToGenerate() {
  const parsed = Number(process.env.SEED_SLOT_DAYS_AHEAD ?? DEFAULT_SLOT_DAYS_TO_GENERATE);
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_SLOT_DAYS_TO_GENERATE;
  return Math.floor(parsed);
}

function getIstMidnight(date = new Date()) {
  const istDateStr = date.toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });

  return new Date(`${istDateStr}T00:00:00+05:30`);
}

async function seedSlots(): Promise<void> {
  const daysToGenerate = resolveSlotDaysToGenerate();
  console.log(`Syncing slots for next ${daysToGenerate} days`);

  const templates = await prisma.slotTemplate.findMany({
    where: {
      isActive: true,
      theatre: {
        location: {
          name: { in: TARGET_LOCATION_NAMES },
        },
      },
    },
    select: {
      id: true,
      theatreId: true,
      startTime: true,
      endTime: true,
      durationMin: true,
      regularPrice: true,
      salePrice: true,
      decorationMandatory: true,
      theatre: {
        select: {
          id: true,
          baseGuests: true,
        },
      },
    },
  });

  if (templates.length === 0) {
    console.log("No active slot templates found");
    return;
  }

  const baseDate = getIstMidnight();
  let createdCount = 0;
  let updatedCount = 0;
  let skippedBookedCount = 0;

  for (let day = 0; day < daysToGenerate; day += 1) {
    const slotDate = new Date(baseDate);
    slotDate.setDate(baseDate.getDate() + day);

    for (const template of templates) {
      const finalPrice = template.salePrice ?? template.regularPrice;
      const slotMatchWhere = {
        theatreId: template.theatreId,
        slotTemplateId: template.id,
        date: slotDate,
      };
      const slotSyncData = {
        startTime: template.startTime,
        endTime: template.endTime,
        durationMin: template.durationMin,
        baseGuests: template.theatre.baseGuests,
        basePrice: finalPrice,
        regularPrice: template.regularPrice,
        salePrice: template.salePrice,
        finalPrice,
        isSpecial: template.salePrice !== null || template.durationMin === 90,
        decorationMandatory: template.decorationMandatory,
        discountText: template.durationMin === 90 ? "₹750 less" : null,
      };

      const existingSlot = await prisma.slot.findFirst({
        where: slotMatchWhere,
        select: { id: true, status: true },
      });

      if (existingSlot) {
        const updateResult = await prisma.slot.updateMany({
          where: {
            ...slotMatchWhere,
            status: { not: "BOOKED" },
          },
          data: slotSyncData,
        });

        if (updateResult.count > 0) {
          updatedCount += updateResult.count;
        } else {
          skippedBookedCount += 1;
        }
        continue;
      }

      await prisma.slot.create({
        data: {
          theatreId: template.theatreId,
          slotTemplateId: template.id,
          date: slotDate,
          ...slotSyncData,
          status: "AVAILABLE",
        },
      });

      createdCount += 1;
    }
  }

  console.log(
    `Slots synced: created=${createdCount}, updated=${updatedCount}, booked-skipped=${skippedBookedCount}`
  );
}



/* -----------------------------
   Seed Occasions
------------------------------ */
async function seedOccasions(): Promise<void> {
  console.log("Seeding occasions");

  const occasions = [
    {
      key: "BIRTHDAY",
      label: "Birthday",
      icon: "/media/booking/occasions/birthday.png",
      subtext: "Celebrate a memorable birthday",
      sortOrder: 1,
      fields: [
        {
          fieldKey: "celebrant_name",
          label: "Birthday Person Name",
          placeholder: "Enter name",
          isRequired: true,
          sortOrder: 1,
        },
        {
          fieldKey: "message",
          label: "Message on Decoration",
          placeholder: "Happy Birthday",
          isRequired: false,
          sortOrder: 2,
        },
      ],
    },

    {
      key: "ANNIVERSARY",
      label: "Anniversary",
      icon: "/media/booking/occasions/anniversary.png",
      subtext: "Celebrate years of togetherness",
      sortOrder: 2,
      fields: [
        {
          fieldKey: "partner1_name",
          label: "Partner 1 Name",
          placeholder: "Enter name",
          isRequired: true,
          sortOrder: 1,
        },
        {
          fieldKey: "partner2_name",
          label: "Partner 2 Name",
          placeholder: "Enter name",
          isRequired: true,
          sortOrder: 2,
        },
        {
          fieldKey: "message",
          label: "Message on Decoration",
          placeholder: "Happy Anniversary",
          isRequired: false,
          sortOrder: 3,
        },
      ],
    },

    {
      key: "ROMANTIC_DATE",
      label: "Romantic Date",
      icon: "/media/booking/occasions/romantic.png",
      subtext: "A private and romantic experience",
      sortOrder: 3,
      fields: [
        {
          fieldKey: "partner1_name",
          label: "Partner 1 Name",
          placeholder: "Enter name",
          isRequired: true,
          sortOrder: 1,
        },
        {
          fieldKey: "partner2_name",
          label: "Partner 2 Name",
          placeholder: "Enter name",
          isRequired: true,
          sortOrder: 2,
        },
        {
          fieldKey: "message",
          label: "Special Message",
          placeholder: "Forever with you",
          isRequired: false,
          sortOrder: 3,
        },
      ],
    },

    {
      key: "MARRIAGE_PROPOSAL",
      label: "Marriage Proposal",
      icon: "/media/booking/occasions/proposal.png",
      subtext: "Plan the perfect proposal",
      sortOrder: 4,
      fields: [
        {
          fieldKey: "partner1_name",
          label: "Partner 1 Name",
          placeholder: "Enter name",
          isRequired: true,
          sortOrder: 1,
        },
        {
          fieldKey: "partner2_name",
          label: "Partner 2 Name",
          placeholder: "Enter name",
          isRequired: true,
          sortOrder: 2,
        },
        {
          fieldKey: "proposal_message",
          label: "Proposal Message",
          placeholder: "Will you marry me",
          isRequired: true,
          sortOrder: 3,
        },
      ],
    },

    {
      key: "BRIDE_TO_BE",
      label: "Bride to Be",
      icon: "/media/booking/occasions/bride.png",
      subtext: "Celebrate the bride-to-be",
      sortOrder: 5,
      fields: [
        {
          fieldKey: "bride_name",
          label: "Bride Name",
          placeholder: "Enter bride name",
          isRequired: true,
          sortOrder: 1,
        },
        {
          fieldKey: "message",
          label: "Message on Decoration",
          placeholder: "Bride to be",
          isRequired: false,
          sortOrder: 2,
        },
      ],
    },

    {
      key: "FAREWELL",
      label: "Farewell",
      icon: "/media/booking/occasions/farewell.png",
      subtext: "A warm farewell celebration",
      sortOrder: 6,
      fields: [
        {
          fieldKey: "person_name",
          label: "Person Name",
          placeholder: "Enter name",
          isRequired: true,
          sortOrder: 1,
        },
        {
          fieldKey: "message",
          label: "Farewell Message",
          placeholder: "Best wishes",
          isRequired: false,
          sortOrder: 2,
        },
      ],
    },

    {
      key: "CONGRATULATIONS",
      label: "Congratulations",
      icon: "/media/booking/occasions/congratulations.png",
      subtext: "Celebrate a special achievement",
      sortOrder: 7,
      fields: [
        {
          fieldKey: "celebrated_for",
          label: "Person Name",
          placeholder: "Enter name",
          isRequired: true,
          sortOrder: 1,
        },
        {
          fieldKey: "message",
          label: "Message",
          placeholder: "Congratulations",
          isRequired: false,
          sortOrder: 2,
        },
      ],
    },

    {
      key: "BABY_SHOWER",
      label: "Baby Shower",
      icon: "/media/booking/occasions/baby.png",
      subtext: "Celebrate the upcoming arrival",
      sortOrder: 8,
      fields: [
        {
          fieldKey: "parent_name",
          label: "Parent Name",
          placeholder: "Enter name",
          isRequired: true,
          sortOrder: 1,
        },
        {
          fieldKey: "message",
          label: "Message on Decoration",
          placeholder: "Welcome baby",
          isRequired: false,
          sortOrder: 2,
        },
      ],
    },
  ];

  for (const occasion of occasions) {
    const savedOccasion = await prisma.occasion.upsert({
      where: { key: occasion.key },
      update: {
        label: occasion.label,
        icon: occasion.icon,
        subtext: occasion.subtext,
        sortOrder: occasion.sortOrder,
        isActive: true,
      },
      create: {
        key: occasion.key,
        label: occasion.label,
        icon: occasion.icon,
        subtext: occasion.subtext,
        sortOrder: occasion.sortOrder,
        isActive: true,
      },
    });

    await prisma.occasionField.deleteMany({
      where: { occasionId: savedOccasion.id },
    });

    await prisma.occasionField.createMany({
      data: occasion.fields.map((field) => ({
        occasionId: savedOccasion.id,
        fieldKey: field.fieldKey,
        label: field.label,
        placeholder: field.placeholder,
        isRequired: field.isRequired,
        sortOrder: field.sortOrder,
      })),
    });
  }

  console.log("Occasions seeded");
}

/* -----------------------------
   Seed Products
------------------------------ */
async function seedProducts(): Promise<void> {
  console.log("Seeding products");

  const DEFAULT_VARIANT_STOCK = 100;

  type SeedVariant = {
    label: string;
    regularPrice: number;
    salePrice?: number | null;
    stock?: number;
    sortOrder: number;
    isDefault: boolean;
  };

  type SeedProduct = {
    name: string;
    slug: string;
    image: string;
    description: string;
    category: ProductCategory;
    sortOrder: number;
    variants: SeedVariant[];
  };

  const products: SeedProduct[] = [
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
        locationId: null,
        sortOrder: product.sortOrder,
        isActive: true,
      },
      create: {
        name: product.name,
        slug: product.slug,
        image: product.image,
        description: product.description,
        category: product.category,
        locationId: null,
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
        salePrice: v.salePrice ?? null,
        stock: Number.isFinite(v.stock) ? Number(v.stock) : DEFAULT_VARIANT_STOCK,
        sortOrder: v.sortOrder,
        isDefault: v.isDefault,
        isActive: true,
      })),
    });
  }

  console.log("Products seeded");
}

/* -----------------------------
   Seed App Settings
------------------------------ */
async function seedAppSettings() {
  console.log("Seeding app settings");

  const settings = [
    {
      key: "SPECIAL_SLOT_TEXT",
      value: "Special Price",
    },
    {
      key: "ADVANCE_PAYMENT_AMOUNT",
      value: "750",
    },
    {
      key: "BOOKING_LOCK_MINUTES",
      value: "10",
    },
    {
      key: "SLOT_EXPIRY_MODE",
      value: "START_TIME",
    },
    {
      key: "SLOT_EXPIRY_GRACE_MINUTES",
      value: "30",
    },
  ];

  for (const setting of settings) {
    await prisma.appSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: {
        key: setting.key,
        value: setting.value,
      },
    });
  }

  console.log("App settings seeded");
}


/* --------------------------------
   MAIN RUNNER
--------------------------------- */
// These full-seed steps are intentionally retained for manual restoration,
// but are disabled in the Noida-only live seed flow below.
void seedAdmin;
void seedOccasions;
void seedProducts;
void seedAppSettings;

async function main(): Promise<void>  {
  console.log("Starting Noida-only database seed...");

  // Keep existing live/admin data untouched.
  // await seedAdmin();
  await seedLocations();
  await seedTheatres();
  await seedSlotTemplates();
  await seedSlots();

  // These are already managed/updated on live and should not be overwritten.
  // await seedOccasions();
  // await seedProducts();
  // await seedAppSettings();

  console.log("Noida-only seed completed successfully");
}

/* --------------------------------
   EXECUTE
--------------------------------- */
main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
