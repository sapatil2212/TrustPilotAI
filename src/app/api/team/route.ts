import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/team - Get user's team and members
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find team where user is owner or member
    let team = await prisma.team.findFirst({
      where: {
        OR: [
          { ownerId: session.user.id },
          { members: { some: { userId: session.user.id } } },
        ],
      },
      include: {
        members: {
          include: {
            // We need to get user details - will do a separate query
          },
        },
        invites: {
          where: { status: "PENDING" },
          select: {
            id: true,
            email: true,
            role: true,
            expiresAt: true,
            createdAt: true,
          },
        },
      },
    });

    // If no team exists, create one for the user
    if (!team) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true },
      });

      team = await prisma.team.create({
        data: {
          name: `${user?.name || "My"}'s Team`,
          ownerId: session.user.id,
          members: {
            create: {
              userId: session.user.id,
              role: "OWNER",
            },
          },
        },
        include: {
          members: true,
          invites: {
            where: { status: "PENDING" },
            select: {
              id: true,
              email: true,
              role: true,
              expiresAt: true,
              createdAt: true,
            },
          },
        },
      });
    }

    // Get user details for each member
    const memberUserIds = team.members.map((m) => m.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: memberUserIds } },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const membersWithDetails = team.members.map((member) => {
      const user = userMap.get(member.userId);
      return {
        id: member.id,
        userId: member.userId,
        name: user?.name || "Unknown",
        email: user?.email || "",
        role: member.role,
        isOwner: member.role === "OWNER",
        joinedAt: member.joinedAt,
      };
    });

    return NextResponse.json({
      team: {
        id: team.id,
        name: team.name,
        ownerId: team.ownerId,
        createdAt: team.createdAt,
      },
      members: membersWithDetails,
      pendingInvites: team.invites,
    });
  } catch (error) {
    console.error("Error fetching team:", error);
    return NextResponse.json(
      { error: "Failed to fetch team" },
      { status: 500 }
    );
  }
}

// POST /api/team - Create a team or update team name
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Team name is required" },
        { status: 400 }
      );
    }

    // Check if user already has a team
    let team = await prisma.team.findFirst({
      where: { ownerId: session.user.id },
    });

    if (team) {
      // Update existing team name
      team = await prisma.team.update({
        where: { id: team.id },
        data: { name: name.trim() },
      });
    } else {
      // Create new team
      team = await prisma.team.create({
        data: {
          name: name.trim(),
          ownerId: session.user.id,
          members: {
            create: {
              userId: session.user.id,
              role: "OWNER",
            },
          },
        },
      });
    }

    return NextResponse.json({ team });
  } catch (error) {
    console.error("Error creating/updating team:", error);
    return NextResponse.json(
      { error: "Failed to create/update team" },
      { status: 500 }
    );
  }
}
