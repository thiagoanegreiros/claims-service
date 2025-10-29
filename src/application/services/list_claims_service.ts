import { type ClaimsRepositoryPort } from "../../domain/ports/claims_repository_port";
import { validateQueryFilters } from "../../domain/validators/filters_validator";

export class ListClaimsService {
  constructor(private readonly repo: ClaimsRepositoryPort) {}

  async execute(query: any): Promise<{
    claims: any[];
    totalAmountSum: number;
  }> {
    const { ok, error, filters } = validateQueryFilters(query);
    if (!ok || !filters) {
      throw new Error(error ?? "Invalid query");
    }

    const found = await this.repo.findAll(filters);

    const totalAmountSum = found.reduce((acc, c) => acc + c.totalAmount, 0);

    return {
      claims: found,
      totalAmountSum
    };
  }
}
