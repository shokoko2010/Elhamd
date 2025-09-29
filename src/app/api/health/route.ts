interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Good!" });
}