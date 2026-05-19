import { NextResponse } from "next/server";
import { parseDateKey } from "@/lib/villa-booking";
import { getVillaAvailability } from "@/services/villa/villa-availability.service";
import {
  DEFAULT_VILLA_SLUG,
  getRequiredVillaBySlug,
  VillaNotFoundError,
} from "@/services/villa/villa.service";

function badRequest(message: string) {
  return NextResponse.json({ success: false, message }, { status: 400 });
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const villaSlug = url.searchParams.get("villaSlug") ?? DEFAULT_VILLA_SLUG;
    const checkIn = parseDateKey(url.searchParams.get("checkIn") ?? "");
    const checkOut = parseDateKey(url.searchParams.get("checkOut") ?? "");

    if (!checkIn || !checkOut) {
      return badRequest("Enter valid check-in and check-out dates.");
    }

    if (checkOut <= checkIn) {
      return badRequest("Check-out must be after check-in.");
    }

    const villa = await getRequiredVillaBySlug(villaSlug);
    const availability = await getVillaAvailability({
      villaId: villa.id,
      checkIn,
      checkOut,
    });

    return NextResponse.json({
      success: true,
      data: availability,
    });
  } catch (error) {
    if (error instanceof VillaNotFoundError) {
      return NextResponse.json(
        { success: false, message: "Villa is not available." },
        { status: 404 },
      );
    }

    console.error("GET /api/villa-bookings/availability error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to check availability." },
      { status: 500 },
    );
  }
}
