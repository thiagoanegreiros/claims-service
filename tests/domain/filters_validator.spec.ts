import { validateQueryFilters } from "../../src/domain/validators/filters_validator";

describe("validateQueryFilters", () => {
  it("returns ok=true for valid filters", () => {
    const result = validateQueryFilters({
      memberId: "MBR001",
      startDate: "2025-05-01",
      endDate: "2025-05-20"
    });

    expect(result.ok).toBe(true);
    expect(result.filters).toEqual({
      memberId: "MBR001",
      startDate: "2025-05-01",
      endDate: "2025-05-20"
    });
  });

  it("returns error for invalid startDate format", () => {
    const result = validateQueryFilters({
      startDate: "05-01-2025"
    });

    expect(result.ok).toBe(false);
    expect(result.error).toBe("Invalid startDate");
  });

  it("returns error for invalid endDate format", () => {
    const result = validateQueryFilters({
      endDate: "20/05/2025"
    });

    expect(result.ok).toBe(false);
    expect(result.error).toBe("Invalid endDate");
  });

  it("returns ok=true and empty filters when called with undefined", () => {
    const result = validateQueryFilters(undefined as any);

    expect(result.ok).toBe(true);
    expect(result.filters).toEqual({
      memberId: undefined,
      startDate: undefined,
      endDate: undefined
    });
  });

  it("returns error when startDate is after endDate", () => {
    const result = validateQueryFilters({
      startDate: "2025-06-01",
      endDate: "2025-05-01"
    });

    expect(result.ok).toBe(false);
    expect(result.error).toBe("startDate cannot be after endDate");
  });
});
