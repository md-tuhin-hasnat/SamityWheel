import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserSession } from '@/lib/session';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: samityId } = await params;
    const session = await getCurrentUserSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is Admin of this Samity
    const admin = await db.samityMember.findFirst({
      where: {
        samityId,
        userId: session.userId,
        role: 'ADMIN',
      },
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Only Samity Admin can configure savings cycles and draw schedules' },
        { status: 403 }
      );
    }

    const {
      participatingMemberIds,
      drawDayOfMonth,
      totalRotations: inputTotalRotations,
      rotationIntervalType: inputIntervalType,
      rotationIntervalDays: inputIntervalDays,
      cycleStartDate: inputStartDate,
      currentRotationIndex: inputCurrentRotation,
      resetCycle,
    } = await req.json();

    await db.$transaction(async (tx) => {
      // 1. Update cycle membership selection if provided
      let memberCount = 0;
      if (Array.isArray(participatingMemberIds)) {
        memberCount = participatingMemberIds.length;
        await tx.samityMember.updateMany({
          where: {
            samityId,
            id: { in: participatingMemberIds },
          },
          data: {
            inActiveCycle: true,
          },
        });
        await tx.samityMember.updateMany({
          where: {
            samityId,
            id: { notIn: participatingMemberIds },
          },
          data: {
            inActiveCycle: false,
          },
        });
      } else {
        memberCount = await tx.samityMember.count({
          where: { samityId, inActiveCycle: true },
        });
      }

      // 2. Validate Rotation Math (Rotations must be a multiple of member count)
      const currentSamity = await tx.samity.findUnique({ where: { id: samityId } });
      const totalRotations = typeof inputTotalRotations === 'number'
        ? inputTotalRotations
        : (currentSamity?.totalRotations || Math.max(memberCount * 2, memberCount));

      if (memberCount > 0 && totalRotations % memberCount !== 0) {
        throw new Error(
          `Total rotations (${totalRotations}) must be an exact multiple of participating members (${memberCount}), e.g. ${memberCount}, ${memberCount * 2}, ${memberCount * 3}.`
        );
      }

      const rotationsPerDraw = memberCount > 0 ? Math.floor(totalRotations / memberCount) : 1;
      const intervalType = inputIntervalType || currentSamity?.rotationIntervalType || 'WEEK';
      const intervalDays = typeof inputIntervalDays === 'number'
        ? inputIntervalDays
        : (currentSamity?.rotationIntervalDays || 7);

      const cycleStartDate = inputStartDate ? new Date(inputStartDate) : (currentSamity?.cycleStartDate || new Date());
      const currentRotationIndex = typeof inputCurrentRotation === 'number'
        ? inputCurrentRotation
        : (currentSamity?.currentRotationIndex || 1);

      // Compute schedule & next rotation deadline
      const startMs = cycleStartDate.getTime();
      const nextDeadline = new Date(startMs + currentRotationIndex * intervalDays * 86400000);

      const schedule = [];
      for (let i = 1; i <= totalRotations; i++) {
        const rotEnd = new Date(startMs + i * intervalDays * 86400000);
        const isDraw = i % rotationsPerDraw === 0;
        schedule.push({
          round: i,
          rotationIndex: i,
          drawDate: rotEnd.toISOString(),
          isDrawRotation: isDraw,
          drawRoundNumber: isDraw ? i / rotationsPerDraw : null,
          label: `Rotation ${i}`,
        });
      }

      // 3. If resetting cycle, clear won flags
      if (resetCycle) {
        await tx.samityMember.updateMany({
          where: { samityId },
          data: {
            hasWonInCurrentCycle: false,
            wonMonth: null,
            wonAmount: null,
          },
        });
      }

      // 4. Update Samity settings
      const samityData: {
        drawDayOfMonth?: number;
        drawSchedule?: string;
        cycleActive?: boolean;
        totalRotations?: number;
        rotationsPerDraw?: number;
        currentRotationIndex?: number;
        rotationIntervalType?: string;
        rotationIntervalDays?: number;
        cycleStartDate?: Date;
        nextRotationDeadline?: Date;
      } = {
        cycleActive: true,
        totalRotations,
        rotationsPerDraw,
        currentRotationIndex,
        rotationIntervalType: intervalType,
        rotationIntervalDays: intervalDays,
        cycleStartDate,
        nextRotationDeadline: nextDeadline,
        drawSchedule: JSON.stringify(schedule),
      };

      if (typeof drawDayOfMonth === 'number') {
        samityData.drawDayOfMonth = drawDayOfMonth;
      }

      await tx.samity.update({
        where: { id: samityId },
        data: samityData,
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Cycle schedule and rotation math configured successfully',
    });
  } catch (error: any) {
    console.error('Error configuring cycle schedule:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to configure cycle' },
      { status: 400 }
    );
  }
}
