import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes, createHash } from "crypto";

const API_PERMISSIONS = [
  "reviews:read",
  "reviews:write",
  "businesses:read",
  "businesses:write",
  "analytics:read",
  "ai:generate",
];

// GET /api/api-keys - List user's API keys
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        permissions: true,
        isActive: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Parse permissions JSON
    const parsedKeys = apiKeys.map((key) => ({
      ...key,
      permissions: JSON.parse(key.permissions),
    }));

    return NextResponse.json({ apiKeys: parsedKeys });
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json(
      { error: "Failed to fetch API keys" },
      { status: 500 }
    );
  }
}

// POST /api/api-keys - Create new API key
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, permissions, expiresIn } = body;

    // Validation
    if (!name?.trim()) {
      return NextResponse.json(
        { error: "API key name is required" },
        { status: 400 }
      );
    }

    if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
      return NextResponse.json(
        { error: "At least one permission must be selected" },
        { status: 400 }
      );
    }

    // Validate permissions
    const invalidPermissions = permissions.filter(
      (p: string) => !API_PERMISSIONS.includes(p)
    );
    if (invalidPermissions.length > 0) {
      return NextResponse.json(
        { error: `Invalid permissions: ${invalidPermissions.join(", ")}` },
        { status: 400 }
      );
    }

    // Limit API keys per user
    const existingCount = await prisma.apiKey.count({
      where: { userId: session.user.id },
    });

    if (existingCount >= 5) {
      return NextResponse.json(
        { error: "Maximum of 5 API keys allowed" },
        { status: 400 }
      );
    }

    // Generate API key
    const rawKey = `tpai_${randomBytes(32).toString("hex")}`;
    const keyPrefix = rawKey.substring(0, 12); // e.g., "tpai_a1b2c3d4"
    const hashedKey = createHash("sha256").update(rawKey).digest("hex");

    // Calculate expiry
    let expiresAt: Date | null = null;
    if (expiresIn) {
      expiresAt = new Date();
      switch (expiresIn) {
        case "30d":
          expiresAt.setDate(expiresAt.getDate() + 30);
          break;
        case "90d":
          expiresAt.setDate(expiresAt.getDate() + 90);
          break;
        case "1y":
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
          break;
        default:
          expiresAt = null; // Never expires
      }
    }

    // Create API key
    const apiKey = await prisma.apiKey.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        key: hashedKey,
        keyPrefix,
        permissions: JSON.stringify(permissions),
        expiresAt,
      },
    });

    // Return the raw key only on creation (it won't be shown again)
    return NextResponse.json({
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        key: rawKey, // Only shown once!
        keyPrefix: apiKey.keyPrefix,
        permissions,
        expiresAt: apiKey.expiresAt,
        createdAt: apiKey.createdAt,
      },
      message: "API key created. Make sure to copy it now - it won't be shown again!",
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating API key:", error);
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    );
  }
}
