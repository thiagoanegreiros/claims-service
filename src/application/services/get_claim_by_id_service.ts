import { type ClaimsRepositoryPort } from "../../domain/ports/claims_repository_port";

export class GetClaimByIdService {
  constructor(private readonly repo: ClaimsRepositoryPort) {}

  async execute(id: string | undefined) {
    if (!id) {
      throw new Error("Missing claimId");
    }

    const claim = await this.repo.findById(id);
    if (!claim) {
      const err = new Error("Claim not found");
      (err as any).code = 404;
      throw err;
    }

    return claim;
  }
}
