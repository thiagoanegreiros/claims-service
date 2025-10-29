import { ListClaimsService } from "../../src/application/services/list_claims_service";
import { type ClaimsRepositoryPort } from "../../src/domain/ports/claims_repository_port";

class FakeRepo implements ClaimsRepositoryPort {
  constructor(private readonly data: any[]) {}

  async saveMany(): Promise<void> {
    throw new Error("not needed in this test");
  }

  async findAll(params: {
    memberId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any[]> {
    const { memberId, startDate, endDate } = params;
    return this.data
      .filter((c) => {
        if (memberId && c.memberId !== memberId) return false;
        if (startDate && c.serviceDate < startDate) return false;
        if (endDate && c.serviceDate > endDate) return false;
        return true;
      })
      .sort((a, b) => (a.serviceDate < b.serviceDate ? 1 : -1));
  }

  async findById(): Promise<any> {
    throw new Error("not needed in this test");
  }
}

describe("ListClaimsService", () => {
  it("returns filtered claims and totalAmountSum", async () => {
    const repo = new FakeRepo([
      {
        claimId: "CLM001",
        memberId: "MBR001",
        provider: "A",
        serviceDate: "2025-05-14",
        totalAmount: 12500,
        diagnosisCodes: ["X"]
      },
      {
        claimId: "CLM002",
        memberId: "MBR002",
        provider: "B",
        serviceDate: "2025-05-13",
        totalAmount: 5000,
        diagnosisCodes: []
      },
      {
        claimId: "CLM003",
        memberId: "MBR001",
        provider: "C",
        serviceDate: "2025-05-10",
        totalAmount: 30000,
        diagnosisCodes: []
      }
    ]);

    const svc = new ListClaimsService(repo);

    const result = await svc.execute({
      memberId: "MBR001",
      startDate: "2025-05-10",
      endDate: "2025-05-31"
    });

    // Should only include claims for MBR001 and in date range:
    expect(result.claims.map((c) => c.claimId)).toEqual(["CLM001", "CLM003"]);

    // Should include descending serviceDate (14 then 10)
    expect(result.claims[0].serviceDate).toBe("2025-05-14");
    expect(result.claims[1].serviceDate).toBe("2025-05-10");

    // Sum of totalAmount
    expect(result.totalAmountSum).toBe(12500 + 30000);
  });

  it("throws if filters are invalid (e.g. bad startDate format)", async () => {
    const repo = new FakeRepo([]);

    const svc = new ListClaimsService(repo);

    await expect(
      svc.execute({
        startDate: "14-05-2025" // invalid format
      })
    ).rejects.toThrow("Invalid startDate");
  });
});

it("throws if startDate is after endDate", async () => {
  const repo = new FakeRepo([]);
  const svc = new ListClaimsService(repo);

  await expect(svc.execute({ startDate: "2025-05-20", endDate: "2025-05-10" })).rejects.toThrow(
    "startDate cannot be after endDate"
  );
});
