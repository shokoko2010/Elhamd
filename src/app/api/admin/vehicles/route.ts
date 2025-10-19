import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSimpleUser } from "@/lib/auth";
import { UserRole } from "@/lib/db";
import { z } from "zod";

const createVehicleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  specifications: z.record(z.any()),
  highlights: z.array(z.any()),
  features: z.array(z.string()),
});

// GET /api/admin/vehicles - Get all vehicles
export async function GET(request: NextRequest) {
  try {
    const user = await getSimpleUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vehicles = await db.vehicle.findMany({
      include: {
        images: {
          orderBy: { displayOrder: "asc" },
        },
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error("Failed to fetch vehicles:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 }
    );
  }
}

// POST /api/admin/vehicles - Create new vehicle
export async function POST(request: NextRequest) {
  try {
    const user = await getSimpleUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions
    const canManageVehicles = user.role === UserRole.SUPER_ADMIN || 
      user.permissions?.includes("manage_vehicles");
    
    if (!canManageVehicles) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createVehicleSchema.parse(body);

    // Verify category exists
    const category = await db.vehicleCategory.findUnique({
      where: { id: validatedData.category },
    });

    if (!category) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const vehicle = await db.vehicle.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        specifications: validatedData.specifications,
        highlights: validatedData.highlights,
        features: validatedData.features,
        status: "ACTIVE",
      },
      include: {
        category: true,
        images: true,
      },
    });

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    console.error("Failed to create vehicle:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create vehicle" },
      { status: 500 }
    );
  }
}