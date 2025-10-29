export interface ClaimsQueryFilters {
  memberId?: string;
  startDate?: string;
  endDate?: string;
}

export function validateQueryFilters(q: any): {
  ok: boolean;
  error?: string;
  filters?: ClaimsQueryFilters;
} {
  const { memberId, startDate, endDate } = q ?? {};

  const isValidDate = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d);

  if (startDate && !isValidDate(startDate as string)) {
    return { ok: false, error: "Invalid startDate" };
  }
  if (endDate && !isValidDate(endDate as string)) {
    return { ok: false, error: "Invalid endDate" };
  }
  if (startDate && endDate && startDate > endDate) {
    return { ok: false, error: "startDate cannot be after endDate" };
  }

  return {
    ok: true,
    filters: { memberId, startDate, endDate }
  };
}
