import { validateRowToClaim } from "../../src/domain/validators/claim_validator";
import { type Clock } from "../../src/infrastructure/time/clock";

// Fake clock to control "today"
class FakeClock implements Clock {
  constructor(private readonly today: string) {}
  todayISO(): string {
    return this.today;
  }
}

describe("validateRowToClaim", () => {
  const clock = new FakeClock("2025-05-20");

  it("should return ok=true for a valid row", () => {
    const row = {
      claimId: "CLM001",
      memberId: "MBR001",
      provider: "HealthCare Inc",
      serviceDate: "2025-05-14",
      totalAmount: "12500",
      diagnosisCodes: "R51;K21.9"
    };

    const result = validateRowToClaim(row, clock);

    expect(result.ok).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.claim).toEqual({
      claimId: "CLM001",
      memberId: "MBR001",
      provider: "HealthCare Inc",
      serviceDate: "2025-05-14",
      totalAmount: 12500,
      diagnosisCodes: ["R51", "K21.9"]
    });
  });

  it("should reject if memberId is missing", () => {
    const row = {
      claimId: "CLM002",
      memberId: "",
      provider: "Clinic X",
      serviceDate: "2025-05-14",
      totalAmount: "1000",
      diagnosisCodes: ""
    };

    const result = validateRowToClaim(row, clock);

    expect(result.ok).toBe(false);
    expect(result.error).toBe("Missing memberId");
  });

  it("should reject negative or non-positive totalAmount", () => {
    const row = {
      claimId: "CLM003",
      memberId: "MBR123",
      provider: "Clinic Y",
      serviceDate: "2025-05-14",
      totalAmount: "-5000",
      diagnosisCodes: "R10.9"
    };

    const result = validateRowToClaim(row, clock);

    expect(result.ok).toBe(false);
    expect(result.error).toBe("Invalid totalAmount (not a positive integer)");
  });

  it("should reject serviceDate in the future", () => {
    const row = {
      claimId: "CLM004",
      memberId: "MBR123",
      provider: "Clinic Z",
      serviceDate: "2025-05-30", // > 2025-05-20
      totalAmount: "30000",
      diagnosisCodes: "M54.5"
    };

    const result = validateRowToClaim(row, clock);

    expect(result.ok).toBe(false);
    expect(result.error).toBe("serviceDate cannot be in the future");
  });

  it("should parse empty diagnosisCodes to empty array", () => {
    const row = {
      claimId: "CLM005",
      memberId: "MBR200",
      provider: "QuickMed",
      serviceDate: "2025-05-13",
      totalAmount: "7550",
      diagnosisCodes: ""
    };

    const result = validateRowToClaim(row, clock);

    expect(result.ok).toBe(true);
    expect(result.claim?.diagnosisCodes).toEqual([]);
  });
});

it("should safely handle undefined rawRow (covers fallback rawRow ?? {})", () => {
  const clock = new FakeClock("2025-05-20");

  // chamando com undefined dispara o caminho da linha 18
  const result = validateRowToClaim(undefined as any, clock);

  // Como claimId é undefined, já cai direto na linha 20 ("Missing claimId")
  expect(result.ok).toBe(false);
  expect(result.error).toBe("Missing claimId");
});

it("should reject when claimId is missing", () => {
  const clock = new FakeClock("2025-05-20");

  const row = {
    // claimId ausente
    memberId: "MBR001",
    provider: "HealthCare Inc",
    serviceDate: "2025-05-14",
    totalAmount: "12500",
    diagnosisCodes: "R51;K21.9"
  };

  const result = validateRowToClaim(row, clock);

  expect(result.ok).toBe(false);
  expect(result.error).toBe("Missing claimId"); // cobre linha 20
});

it("should reject when provider is missing", () => {
  const clock = new FakeClock("2025-05-20");

  const row = {
    claimId: "CLM100",
    memberId: "MBR001",
    // provider ausente
    serviceDate: "2025-05-14",
    totalAmount: "12500",
    diagnosisCodes: "R51;K21.9"
  };

  const result = validateRowToClaim(row, clock);

  expect(result.ok).toBe(false);
  expect(result.error).toBe("Missing provider"); // cobre linha 22
});

it("should reject when serviceDate is missing", () => {
  const clock = new FakeClock("2025-05-20");

  const row = {
    claimId: "CLM101",
    memberId: "MBR001",
    provider: "HealthCare Inc",
    // serviceDate ausente
    totalAmount: "12500",
    diagnosisCodes: "R51;K21.9"
  };

  const result = validateRowToClaim(row, clock);

  expect(result.ok).toBe(false);
  expect(result.error).toBe("Missing serviceDate"); // cobre linha 23
});

it("should reject invalid serviceDate format", () => {
  const clock = new FakeClock("2025-05-20");
  const row = {
    claimId: "CLM009",
    memberId: "MBR001",
    provider: "Weird Hospital",
    serviceDate: "14/05/2025", // wrong format
    totalAmount: "12500",
    diagnosisCodes: "A00"
  };

  const result = validateRowToClaim(row, clock);

  expect(result.ok).toBe(false);
  expect(result.error).toBe("Invalid serviceDate format");
});

it("should reject if totalAmount is missing", () => {
  const clock = new FakeClock("2025-05-20");

  const row = {
    claimId: "CLM010",
    memberId: "MBR999",
    provider: "NoMoney Health",
    serviceDate: "2025-05-14"
    // totalAmount ausente
    // diagnosisCodes tanto faz
  };

  const result = validateRowToClaim(row, clock);

  expect(result.ok).toBe(false);
  expect(result.error).toBe("Missing totalAmount");
});
