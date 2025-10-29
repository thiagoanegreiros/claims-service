import { type Claim } from "../entities/claim";
import { type Clock } from "../../infrastructure/time/clock";

export interface ValidationResult {
  ok: boolean;
  error?: string;
  claim?: Claim;
}

export function validateRowToClaim(rawRow: any, clock: Clock): ValidationResult {
  const { claimId, memberId, provider, serviceDate, totalAmount, diagnosisCodes } = rawRow ?? {};

  if (!claimId) return { ok: false, error: "Missing claimId" };
  if (!memberId) return { ok: false, error: "Missing memberId" };
  if (!provider) return { ok: false, error: "Missing provider" };
  if (!serviceDate) return { ok: false, error: "Missing serviceDate" };
  if (!totalAmount && totalAmount !== 0) return { ok: false, error: "Missing totalAmount" };

  const amountNum = Number(totalAmount);
  if (!Number.isInteger(amountNum) || amountNum <= 0) {
    return {
      ok: false,
      error: "Invalid totalAmount (not a positive integer)"
    };
  }

  const today = clock.todayISO(); // ex: "2025-10-29"
  if (!/^\d{4}-\d{2}-\d{2}$/.test(serviceDate as string)) {
    return { ok: false, error: "Invalid serviceDate format" };
  }
  if (serviceDate > today) {
    return { ok: false, error: "serviceDate cannot be in the future" };
  }

  let diagArray: string[] = [];
  if (diagnosisCodes && diagnosisCodes.trim() !== "") {
    diagArray = diagnosisCodes.split(";").map((c: string) => c.trim());
  }

  const claim: Claim = {
    claimId,
    memberId,
    provider,
    serviceDate,
    totalAmount: amountNum,
    diagnosisCodes: diagArray
  };

  return { ok: true, claim };
}
