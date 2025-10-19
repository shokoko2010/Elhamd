import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSimpleUser } from "@/lib/auth";
import { UserRole } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/vehicles/[id] - Get single vehicle
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await getSimpleUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const vehicle = await db.vehicle.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { displayOrder: "asc" },
        },
        category: true,
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error("Failed to fetch vehicle:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicle" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/vehicles/[id] - Update vehicle
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
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

    const { id } = await params;
    const body = await request.json();

    const vehicle = await db.vehicle.update({
      where: { id },
      data: body,
      include: {
        category: true,
        images: true,
      },
    });

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error("Failed to update vehicle:", error);
    return NextResponse.json(
      { error: "Failed to update vehicle" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/vehicles/[id] - Delete vehicle
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
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

    const { id } = await params;

    // Delete vehicle images first
    await db.vehicleImage.deleteMany({
      where: { vehicleId: id },
    });

    // Delete vehicle
    await db.vehicle.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    console.error("Failed to delete vehicle:", error);
    return NextResponse.json(
      { error: "Failed to delete vehicle" },
      { status: 500 }
    );
  }
}