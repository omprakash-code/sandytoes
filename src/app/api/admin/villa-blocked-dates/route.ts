import { NextResponse } from "next/server";

export async function GET() {
  return deprecatedBlockedDateResponse();
}

export async function POST() {
  return deprecatedBlockedDateResponse();
}

export async function DELETE() {
  return deprecatedBlockedDateResponse();
}

function deprecatedBlockedDateResponse() {
  return NextResponse.json(
    {
      success: false,
      code: "SINGLE_DATE_BLOCKS_DEPRECATED",
      message: "Use villa range blocks instead.",
    },
    { status: 410 },
  );
}
