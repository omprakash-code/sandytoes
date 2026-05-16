/**
 * Admin User Seed Script
 * Creates or updates initial ADMIN account.
 * Safe to run multiple times (upsert).
 *
 * When to use:
 * Run manually only when an environment needs the default admin account
 * created or reset. Not part of the current Noida-only live seed flow.
 */

import { PrismaClient, UserRole } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

/* -----------------------------
   Prisma Setup
------------------------------ */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/* -----------------------------
   Seed Admin
------------------------------ */
async function seedAdmin() {
  console.log("Seeding admin user...");

  const adminEmail = "admin@sandytoes.com";
  const adminPassword = "Admin@123"; // change after first login
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
      phone: "9999999999", // required unique field
      passwordHash: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
      isGuest: false,
    },
  });

  console.log("Admin user seeded successfully");
  console.log("Login Phone:", "9999999999");
  console.log("Login Password:", adminPassword);
}

seedAdmin()
  .catch((e) => {
    console.error("Admin seeding failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
