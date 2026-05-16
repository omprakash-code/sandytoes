/**
 * Occasions Seed Script
 * Populates the database with initial occasions data.
 * Safe to run multiple times - uses upsert to prevent duplicates.
 * Last Updated: 01-jan-2026 07:50 PM
 * Last seeded to database: 05-jan-2026 02:55 PM
 *
 * When to use:
 * Run only when occasion defaults should be restored or deployed to a fresh
 * environment. Keep disabled if live occasions are admin-managed.
 */

import { PrismaClient } from "@prisma/client";
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
   Run
------------------------------ */
seedOccasions()
  .catch((e) => {
    console.error("Occasion seeding failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
