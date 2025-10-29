import { type Claim } from "../../domain/entities/claim";
import { type ClaimsRepositoryPort } from "../../domain/ports/claims_repository_port";
import { validateRowToClaim } from "../../domain/validators/claim_validator";
import { parseCsvToObjects } from "../../infrastructure/csv/csv_parser";
import { type Clock } from "../../infrastructure/time/clock";

export interface IngestSummary {
  successCount: number;
  errorCount: number;
  errors: Array<{ row: number; message: string }>;
}

export class IngestClaimsService {
  constructor(
    private readonly repo: ClaimsRepositoryPort,
    private readonly clock: Clock
  ) {}

  async execute(csvContent: string): Promise<IngestSummary> {
    const rows = await parseCsvToObjects(csvContent);

    const validClaims: Claim[] = [];
    const errors: Array<{ row: number; message: string }> = [];

    rows.forEach((row, idx) => {
      const validation = validateRowToClaim(row, this.clock);
      if (!validation.ok) {
        errors.push({
          row: idx + 2,
          message: validation.error ?? "Unknown validation error"
        });
      } else if (validation.claim) {
        validClaims.push(validation.claim);
      }
    });

    await this.repo.saveMany(validClaims);

    return {
      successCount: validClaims.length,
      errorCount: errors.length,
      errors
    };
  }
}
