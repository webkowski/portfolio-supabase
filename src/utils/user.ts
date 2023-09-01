import dayjs from 'utils/dayjs';

export function validateToken(createdAt: Date, validPeriod: number): boolean {
  if (!createdAt || !validPeriod) {
    return false;
  }

  const userEndDate = dayjs(createdAt).add(validPeriod, 'day');
  const now = dayjs();
  const isExpired = now.isAfter(userEndDate);

  return !isExpired;
}

export function calculateRemainingPeriod(createdAt: Date, validPeriod: number): number {
  if (!createdAt || !validPeriod) {
    return 0;
  }

  const userEndDate = dayjs(createdAt).add(validPeriod, 'day');
  const now = dayjs();
  const isExpired = now.isAfter(userEndDate);

  if (isExpired) {
    return 0;
  }

  return userEndDate.diff(now, 'day');
}
