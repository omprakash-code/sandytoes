// src/app/api/products/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ProductCategory } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const locationId = searchParams.get("locationId")?.trim() ?? "";

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category is required" },
        { status: 400 }
      );
    }

    if (!Object.values(ProductCategory).includes(category as ProductCategory)) {
      return NextResponse.json(
        { success: false, message: "Invalid category" },
        { status: 400 }
      );
    }

    const products = await prisma.product.findMany({
      where: {
        category: category as ProductCategory,
        isActive: true,
        ...(locationId
          ? {
              OR: [{ locationId }, { locationId: null }],
            }
          : {}),
      },
      orderBy: { sortOrder: "asc" },
      include: {
        variants: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    // IMPORTANT: map Prisma → UI-safe response
    const normalized = products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      category: p.category,
      image: p.image,
      variants: p.variants.map((v) => {
        const validSalePrice =
          v.salePrice !== null && v.salePrice !== undefined && v.salePrice > 0
            ? v.salePrice
            : null;

        return {
          id: v.id,
          label: v.label,
          regularPrice: v.regularPrice,
          salePrice: validSalePrice,
          stock: v.stock,
          price: validSalePrice ?? v.regularPrice,
          isDefault: v.isDefault,
        };
      }),

    }));

    return NextResponse.json({
      success: true,
      data: normalized,
    });
  } catch (error) {
    console.error("GET /api/products error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load products" },
      { status: 500 }
    );
  }
}
