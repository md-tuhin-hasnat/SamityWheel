export type RotationIntervalType = 'DAY' | 'WEEK' | 'BIWEEKLY' | 'MONTH' | 'CUSTOM';

export interface RotationInfo {
  rotationIndex: number;
  startDate: string;
  endDate: string;
  isDrawRotation: boolean;
  drawRoundNumber?: number;
  label: string;
}

export interface CycleMathConfig {
  memberCount: number;
  totalRotations: number;
  intervalType: RotationIntervalType;
  intervalDays: number;
  cycleStartDate: string;
}

/**
 * Validates that total rotations is a multiple of participating members.
 * e.g., If 3 members, rotations can be 3, 6, 9, 12...
 */
export function validateCycleMath(memberCount: number, totalRotations: number): {
  valid: boolean;
  rotationsPerDraw: number;
  multiplier: number;
  error?: string;
} {
  if (memberCount <= 0) {
    return { valid: false, rotationsPerDraw: 0, multiplier: 0, error: 'At least 1 member must be selected.' };
  }

  if (totalRotations > 100) {
    return {
      valid: false,
      rotationsPerDraw: 0,
      multiplier: 0,
      error: `Total rotations (${totalRotations}) exceeds maximum limit of 100.`,
    };
  }

  if (totalRotations < memberCount) {
    return {
      valid: false,
      rotationsPerDraw: 0,
      multiplier: 0,
      error: `Total rotations (${totalRotations}) cannot be less than member count (${memberCount}). Must be a multiple of ${memberCount}.`,
    };
  }

  if (totalRotations % memberCount !== 0) {
    return {
      valid: false,
      rotationsPerDraw: 0,
      multiplier: 0,
      error: `Total rotations (${totalRotations}) must be an exact multiple of member count (${memberCount}), e.g. ${memberCount}, ${memberCount * 2}, ${memberCount * 3}...`,
    };
  }

  const rotationsPerDraw = totalRotations / memberCount;
  return {
    valid: true,
    rotationsPerDraw,
    multiplier: rotationsPerDraw,
  };
}

/**
 * Returns the standard interval in days based on interval type.
 */
export function getIntervalDays(intervalType: RotationIntervalType, customDays?: number): number {
  switch (intervalType) {
    case 'DAY':
      return 1;
    case 'WEEK':
      return 7;
    case 'BIWEEKLY':
      return 14;
    case 'MONTH':
      return 30;
    case 'CUSTOM':
      return Math.max(1, Number(customDays) || 3);
    default:
      return 7;
  }
}

/**
 * Generates the full schedule for all rotations in the cycle.
 */
export function generateCycleSchedule(config: CycleMathConfig): RotationInfo[] {
  const { memberCount, totalRotations, intervalDays, cycleStartDate } = config;
  const validation = validateCycleMath(memberCount, totalRotations);
  const rotationsPerDraw = validation.valid ? validation.rotationsPerDraw : 1;

  const startMs = new Date(cycleStartDate).getTime() || Date.now();
  const schedule: RotationInfo[] = [];

  for (let i = 1; i <= totalRotations; i++) {
    const rotStart = new Date(startMs + (i - 1) * intervalDays * 86400000);
    const rotEnd = new Date(startMs + i * intervalDays * 86400000);
    const isDrawRotation = i % rotationsPerDraw === 0;
    const drawRoundNumber = isDrawRotation ? i / rotationsPerDraw : undefined;

    schedule.push({
      rotationIndex: i,
      startDate: rotStart.toISOString(),
      endDate: rotEnd.toISOString(),
      isDrawRotation,
      drawRoundNumber,
      label: `Rotation ${i}`,
    });
  }

  return schedule;
}

/**
 * Formats remaining time into Days, Hours, Minutes, Seconds.
 */
export function calculateTimeRemaining(targetIsoDate: string) {
  const targetMs = new Date(targetIsoDate).getTime();
  const nowMs = Date.now();
  const diffMs = targetMs - nowMs;

  if (diffMs <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      totalMs: 0,
    };
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const seconds = Math.floor((diffMs / 1000) % 60);

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
    totalMs: diffMs,
  };
}
