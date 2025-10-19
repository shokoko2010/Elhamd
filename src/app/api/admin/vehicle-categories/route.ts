import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSimpleUser } from "@/lib/auth";

// GET /api/admin/vehicle-categories - Get all vehicle categories
export async function GET(request: NextRequest) {
  try {
    const user = await getSimpleUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categories = await db.vehicleCategory.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Failed to fetch vehicle categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicle categories" },
      { status: 500 }
    );
  }
}

// POST /api/admin/vehicle-categories - Create new vehicle category
export async function POST(request: NextRequest) {
  try {
    const user = await getSimpleUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const category = await db.vehicleCategory.create({
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Failed to create vehicle category:", error);
    return NextResponse.json(
      { error: "Failed to create vehicle category" },
      { status: 500 }
    );
  }
}