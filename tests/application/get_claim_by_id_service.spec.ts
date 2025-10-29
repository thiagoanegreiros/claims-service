import { GetClaimByIdService } from "../../src/application/services/get_claim_by_id_service";
import { type ClaimsRepositoryPort } from "../../src/domain/ports/claims_repository_port";

class FakeRepo implements ClaimsRepositoryPort {
  private readonly data: any[];

  constructor(seed: any[]) {
    this.data = seed;
  }

  async saveMany(): Promise<void> {
    throw new Error("not needed in this test");
  }

  async findAll(): Promise<any[]> {
    throw new Error("not needed in this test");
  }

  async findById(claimId: string): Promise<any | undefined> {
    return this.data.find((c) => c.claimId === claimId);
  }
}

describe("GetClaimByIdService", () => {
  it("returns a claim when it exists", async () => {
    const repo = new FakeRepo([
      {
        claimId: "CLM001",
        memberId: "MBR001",
        provider: "HealthCare Inc",
        serviceDate: "2025-05-14",
        totalAmount: 12500,
        diagnosisCodes: ["R51", "K21.9"]
      },
      {
        claimId: "CLM002",
        memberId: "MBR002",
        provider: "Dr. Smith Clinic",
        serviceDate: "2025-05-13",
        totalAmount: 8999,
        diagnosisCodes: ["R10.9"]
      }
    ]);

    const svc = new GetClaimByIdService(repo);

    const result = await svc.execute("CLM002");

    expect(result).toEqual({
      claimId: "CLM002",
      memberId: "MBR002",
      provider: "Dr. Smith Clinic",
      serviceDate: "2025-05-13",
      totalAmount: 8999,
      diagnosisCodes: ["R10.9"]
    });
  });

  it("throws if claimId is missing", async () => {
    const repo = new FakeRepo([]);
    const svc = new GetClaimByIdService(repo);

    await expect(svc.execute(undefined)).rejects.toThrow("Missing claimId");
  });

  it("throws 404-like error if claim is not found", async () => {
    const repo = new FakeRepo([
      {
        claimId: "CLM001",
        memberId: "MBR001",
        provider: "HealthCare Inc",
        serviceDate: "2025-05-14",
        totalAmount: 12500,
        diagnosisCodes: ["R51", "K21.9"]
      }
    ]);

    const svc = new GetClaimByIdService(repo);

    try {
      await svc.execute("CLM999");
      throw new Error("should have thrown"); // safety net
    } catch (err: any) {
      expect(err.message).toBe("Claim not found");
      // we also check the custom code property you attach (404)
      expect(err.code).toBe(404);
    }
  });
});
