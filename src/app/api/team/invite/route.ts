import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { sendEmail } from "@/lib/email";

// POST /api/team/invite - Send invitation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, role = "MEMBER" } = body;

    if (!email?.trim()) {
      return NextResponse.json(
        { error: "Email is required" },
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

    // Get user's team
    const team = await prisma.team.findFirst({
      where: {
        OR: [
          { ownerId: session.user.id },
          { members: { some: { userId: session.user.id, role: { in: ["OWNER", "ADMIN"] } } } },
        ],
      },
    });

    if (!team) {
      return NextResponse.json(
        { error: "You don't have permission to invite members" },
        { status: 403 }
      );
    }

    // Check if email is already a member
    await prisma.teamMember.findFirst({
      where: {
        teamId: team.id,
        // Need to find user by email first
      },
    });

    const userWithEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (userWithEmail) {
      const isMember = await prisma.teamMember.findFirst({
        where: {
          teamId: team.id,
          userId: userWithEmail.id,
        },
      });

      if (isMember) {
        return NextResponse.json(
          { error: "This user is already a team member" },
          { status: 400 }
        );
      }
    }

    // Check for existing pending invite
    const existingInvite = await prisma.teamInvite.findFirst({
      where: {
        teamId: team.id,
        email: email.toLowerCase().trim(),
        status: "PENDING",
      },
    });

    if (existingInvite) {
      return NextResponse.json(
        { error: "An invitation has already been sent to this email" },
        { status: 400 }
      );
    }

    // Create invitation token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    // Create invitation
    const invite = await prisma.teamInvite.create({
      data: {
        teamId: team.id,
        email: email.toLowerCase().trim(),
        role: role as "ADMIN" | "MEMBER" | "VIEWER",
        token,
        invitedById: session.user.id,
        expiresAt,
      },
    });

    // Get inviter info
    const inviter = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    });

    // Send invitation email
    const inviteUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/invite/${token}`;
    
    try {
      await sendEmail({
        to: email.toLowerCase().trim(),
        subject: `You've been invited to join ${team.name} on TrustPilotAI`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Team Invitation</h2>
            <p>Hi,</p>
            <p><strong>${inviter?.name || "A team member"}</strong> has invited you to join <strong>${team.name}</strong> on TrustPilotAI as a <strong>${role.toLowerCase()}</strong>.</p>
            <p style="margin: 30px 0;">
              <a href="${inviteUrl}" style="background: linear-gradient(to right, #6366f1, #8b5cf6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                Accept Invitation
              </a>
            </p>
            <p style="color: #666; font-size: 14px;">This invitation expires in 7 days.</p>
            <p style="color: #666; font-size: 14px;">If you didn't expect this invitation, you can ignore this email.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send invitation email:", emailError);
      // Continue even if email fails - we'll show the invite link
    }

    return NextResponse.json({
      invite: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expiresAt,
        inviteUrl,
      },
      message: "Invitation sent successfully",
    }, { status: 201 });
  } catch (error) {
    console.error("Error sending invitation:", error);
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}

// DELETE /api/team/invite - Cancel invitation
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const inviteId = searchParams.get("id");

    if (!inviteId) {
      return NextResponse.json(
        { error: "Invite ID is required" },
        { status: 400 }
      );
    }

    // Verify user has permission
    const invite = await prisma.teamInvite.findUnique({
      where: { id: inviteId },
      include: { team: true },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    // Check if user is team owner or admin
    const member = await prisma.teamMember.findFirst({
      where: {
        teamId: invite.teamId,
        userId: session.user.id,
        role: { in: ["OWNER", "ADMIN"] },
      },
    });

    if (!member && invite.team.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to cancel this invitation" },
        { status: 403 }
      );
    }

    // Cancel the invitation
    await prisma.teamInvite.update({
      where: { id: inviteId },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({ message: "Invitation cancelled" });
  } catch (error) {
    console.error("Error cancelling invitation:", error);
    return NextResponse.json(
      { error: "Failed to cancel invitation" },
      { status: 500 }
    );
  }
}
