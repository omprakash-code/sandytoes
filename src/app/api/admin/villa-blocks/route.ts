import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedAdminIdFromCookies } from "@/services/auth/adminAuth.server";
import {
  createVillaBlock,
  listVillaBlocks,
  removeVillaBlock,
  VillaBlockValidationError,
  VillaDateRangeUnavailableError,
} from "@/services/villa/villa-block.service";

const blockSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  type: z.enum(["OWNER_STAY", "MAINTENANCE", "MANUAL_BLOCK", "PRIVATE_HOLD"]),
  reason: z.string().trim().optional(),
});

export async function GET() {
  try {
    const adminId = await getAuthenticatedAdminIdFromCookies();
    if (!adminId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const blocks = await listVillaBlocks();
    return NextResponse.json({
      success: true,
      data: blocks.map((block) => ({
        id: block.id,
        startDate: block.startDate.toISOString().slice(0, 10),
        endDate: block.endDate.toISOString().slice(0, 10),
        type: block.type,
        reason: block.reason,
        source: block.source,
        createdAt: block.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("GET /api/admin/villa-blocks error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load blocked ranges." },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const adminId = await getAuthenticatedAdminIdFromCookies();
    if (!adminId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const parsed = blockSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "Enter a valid blocked range." }, { status: 400 });
    }

    const block = await createVillaBlock({ ...parsed.data, actorId: adminId });
    return NextResponse.json({
      success: true,
      data: {
        id: block.id,
        startDate: block.startDate.toISOString().slice(0, 10),
        endDate: block.endDate.toISOString().slice(0, 10),
        type: block.type,
        reason: block.reason,
        source: block.source,
      },
    });
  } catch (error) {
    if (error instanceof VillaDateRangeUnavailableError) {
      return NextResponse.json(
        {
          success: false,
          code: "DATES_UNAVAILABLE",
          message: "This block overlaps an unavailable range.",
          unavailableDates: error.unavailableDates,
        },
        { status: 409 },
      );
    }

    if (error instanceof VillaBlockValidationError) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    console.error("POST /api/admin/villa-blocks error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save blocked range." },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const adminId = await getAuthenticatedAdminIdFromCookies();
    if (!adminId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const id = new URL(req.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, message: "Missing blocked range." }, { status: 400 });
    }

    await removeVillaBlock({ id, actorId: adminId });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof VillaBlockValidationError) {
      return NextResponse.json({ success: false, message: error.message }, { status: 404 });
    }

    console.error("DELETE /api/admin/villa-blocks error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to remove blocked range." },
      { status: 500 },
    );
  }
}
