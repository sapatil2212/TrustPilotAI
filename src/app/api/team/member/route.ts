import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/team/member - Update member role
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { memberId, role } = body;

    if (!memberId || !role) {
      return NextResponse.json(
        { error: "Member ID and role are required" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ["ADMIN", "MEMBER", "VIEWER"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // Get the member
    const member = await prisma.teamMember.findUnique({
      where: { id: memberId },
      include: { team: true },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    // Check if user has permission (must be owner or admin)
    const currentUserMember = await prisma.teamMember.findFirst({
      where: {
        teamId: member.teamId,
        userId: session.user.id,
        role: { in: ["OWNER", "ADMIN"] },
      },
    });

    const isOwner = member.team.ownerId === session.user.id;

    if (!currentUserMember && !isOwner) {
      return NextResponse.json(
        { error: "You don't have permission to update member roles" },
        { status: 403 }
      );
    }

    // Can't change owner's role
    if (member.role === "OWNER") {
      return NextResponse.json(
        { error: "Cannot change the owner's role" },
        { status: 400 }
      );
    }

    // Admins can only manage members and viewers, not other admins
    if (currentUserMember?.role === "ADMIN" && member.role === "ADMIN" && !isOwner) {
      return NextResponse.json(
        { error: "Admins cannot change other admin's roles" },
        { status: 403 }
      );
    }

    // Update the role
    const updatedMember = await prisma.teamMember.update({
      where: { id: memberId },
      data: { role: role as "ADMIN" | "MEMBER" | "VIEWER" },
    });

    return NextResponse.json({
      member: updatedMember,
      message: "Member role updated",
    });
  } catch (error) {
    console.error("Error updating member role:", error);
    return NextResponse.json(
      { error: "Failed to update member role" },
      { status: 500 }
    );
  }
}

// DELETE /api/team/member - Remove member from team
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("id");

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    // Get the member
    const member = await prisma.teamMember.findUnique({
      where: { id: memberId },
      include: { team: true },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    // Can't remove owner
    if (member.role === "OWNER") {
      return NextResponse.json(
        { error: "Cannot remove the team owner" },
        { status: 400 }
      );
    }

    // Check if user has permission or is removing themselves
    const isRemovingSelf = member.userId === session.user.id;
    const isOwner = member.team.ownerId === session.user.id;

    if (!isRemovingSelf && !isOwner) {
      const currentUserMember = await prisma.teamMember.findFirst({
        where: {
          teamId: member.teamId,
          userId: session.user.id,
          role: { in: ["OWNER", "ADMIN"] },
        },
      });

      if (!currentUserMember) {
        return NextResponse.json(
          { error: "You don't have permission to remove members" },
          { status: 403 }
        );
      }

      // Admins can only remove members and viewers
      if (currentUserMember.role === "ADMIN" && member.role === "ADMIN") {
        return NextResponse.json(
          { error: "Admins cannot remove other admins" },
          { status: 403 }
        );
      }
    }

    // Remove the member
    await prisma.teamMember.delete({
      where: { id: memberId },
    });

    return NextResponse.json({
      message: isRemovingSelf ? "You have left the team" : "Member removed from team",
    });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}
