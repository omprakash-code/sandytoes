import { NextResponse } from "next/server";
import { getAuthenticatedAdminIdFromCookies } from "@/services/auth/adminAuth.server";
import { getVillaAdminCalendar } from "@/services/villa/villa-admin-calendar.service";

export async function GET(req: Request) {
  try {
    const adminId = await getAuthenticatedAdminIdFromCookies();
    if (!adminId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const now = new Date();
    const year = Number(url.searchParams.get("year") ?? now.getUTCFullYear());
    const month = Number(url.searchParams.get("month") ?? now.getUTCMonth() + 1);
    const data = await getVillaAdminCalendar({ year, month });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/admin/villa-calendar error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load villa calendar." },
      { status: 500 },
    );
  }
}
