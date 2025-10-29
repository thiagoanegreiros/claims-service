import { IngestClaimsService } from "../../src/application/services/ingest_claims_service";
import { type ClaimsRepositoryPort } from "../../src/domain/ports/claims_repository_port";
import { type Clock } from "../../src/infrastructure/time/clock";

import { parseCsvToObjects } from "../../src/infrastructure/csv/csv_parser";
import { type Claim } from "../../src/domain/entities/claim";

// Fake in-memory repo implementing the port
class FakeRepo implements ClaimsRepositoryPort {
  public saved: Claim[] = [];

  async saveMany(claims: Claim[]): Promise<void> {
    this.saved.push(...claims);
  }

  async findAll(): Promise<Claim[]> {
    throw new Error("not needed for this test");
  }

  async findById(): Promise<Claim> {
    throw new Error("not needed for this test");
  }
}

// Deterministic clock for validation logic
class FakeClock implements Clock {
  constructor(private readonly today: string) {}
  todayISO(): string {
    return this.today;
  }
}

// Mock the CSV parser module that IngestClaimsService depends on
jest.mock("../../src/infrastructure/csv/csv_parser", () => ({
  parseCsvToObjects: jest.fn()
}));

describe("IngestClaimsService", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("ingests valid rows and reports invalid rows", async () => {
    const fakeRepo = new FakeRepo();
    const clock = new FakeClock("2025-05-20");

    // Simulate parsed CSV rows:
    //  - first row valid
    //  - second row has future serviceDate (should fail)
    //  - third row has invalid totalAmount (should fail)
    (parseCsvToObjects as jest.Mock).mockResolvedValue([
      {
        claimId: "CLM001",
        memberId: "MBR001",
        provider: "HealthCare Inc",
        serviceDate: "2025-05-14",
        totalAmount: "12500",
        diagnosisCodes: "R51;K21.9"
      },
      {
        claimId: "CLM_BAD_FUTURE",
        memberId: "MBR999",
        provider: "Evil Clinic",
        serviceDate: "2025-12-31", // > today (2025-05-20), should be rejected
        totalAmount: "5000",
        diagnosisCodes: "X01"
      },
      {
        claimId: "CLM_BAD_AMOUNT",
        memberId: "MBR777",
        provider: "Bad Amount Clinic",
        serviceDate: "2025-05-10",
        totalAmount: "-10", // invalid
        diagnosisCodes: "R10.9"
      }
    ]);

    const svc = new IngestClaimsService(fakeRepo, clock);

    const summary = await svc.execute("dummy csv input");

    // Verify summary counts
    expect(summary.successCount).toBe(1);
    expect(summary.errorCount).toBe(2);

    // Each invalid row should appear with row index = (idx + 2)
    // idx=1 => row=3, idx=2 => row=4
    expect(summary.errors).toContainEqual({
      row: 3,
      message: "serviceDate cannot be in the future"
    });

    expect(summary.errors).toContainEqual({
      row: 4,
      message: "Invalid totalAmount (not a positive integer)"
    });

    // Only the valid row should have been persisted
    expect(fakeRepo.saved).toHaveLength(1);
    expect(fakeRepo.saved[0]).toMatchObject({
      claimId: "CLM001",
      memberId: "MBR001",
      provider: "HealthCare Inc",
      serviceDate: "2025-05-14",
      totalAmount: 12500,
      diagnosisCodes: ["R51", "K21.9"]
    });
  });

  it("propagates CSV parsing errors (malformed CSV)", async () => {
    const fakeRepo = new FakeRepo();
    const clock = new FakeClock("2025-05-20");

    (parseCsvToObjects as jest.Mock).mockImplementationOnce(async () => {
      return await Promise.reject(new Error("Bad CSV"));
    });

    const svc = new IngestClaimsService(fakeRepo, clock);

    await expect(svc.execute("bad content")).rejects.toThrow("Bad CSV");

    expect(fakeRepo.saved).toHaveLength(0);
  });
});
