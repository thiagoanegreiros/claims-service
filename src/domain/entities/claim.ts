export interface Claim {
  claimId: string;
  memberId: string;
  provider: string;
  serviceDate: string; // YYYY-MM-DD
  totalAmount: number; // integer cents
  diagnosisCodes: string[]; // may be empty
}
