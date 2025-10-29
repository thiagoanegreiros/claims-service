import { type ClaimsRepositoryPort } from "../../../domain/ports/claims_repository_port";
import { type Claim } from "../../../domain/entities/claim";

export class InMemoryClaimsRepository implements ClaimsRepositoryPort {
  private readonly claims: Claim[] = [];

  async saveMany(claims: Claim[]): Promise<void> {
    this.claims.push(...claims);
  }

  async findAll(params: {
    memberId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Claim[]> {
    const { memberId, startDate, endDate } = params;

    return this.claims
      .filter((c) => {
        if (memberId && c.memberId !== memberId) return false;
        if (startDate && c.serviceDate < startDate) return false;
        if (endDate && c.serviceDate > endDate) return false;
        return true;
      })
      .sort((a, b) => (a.serviceDate < b.serviceDate ? 1 : -1)); // desc
  }

  async findById(claimId: string): Promise<Claim | undefined> {
    return this.claims.find((c) => c.claimId === claimId);
  }
}
