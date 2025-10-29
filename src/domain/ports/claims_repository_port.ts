import { type Claim } from "../entities/claim";

export interface ClaimsRepositoryPort {
  saveMany: (claims: Claim[]) => Promise<void>;
  findAll: (params: {
    memberId?: string;
    startDate?: string;
    endDate?: string;
  }) => Promise<Claim[]>;
  findById: (claimId: string) => Promise<Claim | undefined>;
}
