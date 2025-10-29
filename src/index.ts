import { InMemoryClaimsRepository } from "./adapters/outbound/storage/in_memory_claims_repository";
import { SystemClock } from "./infrastructure/time/clock";

import { IngestClaimsService } from "./application/services/ingest_claims_service";
import { ListClaimsService } from "./application/services/list_claims_service";
import { GetClaimByIdService } from "./application/services/get_claim_by_id_service";

import { buildIngestHandler } from "./adapters/inbound/http/claims_ingest_router";
import { buildListHandler } from "./adapters/inbound/http/claims_list_router";
import { buildGetByIdHandler } from "./adapters/inbound/http/claims_get_by_id_router";

const repo = new InMemoryClaimsRepository();
const clock = new SystemClock();

const ingestSvc = new IngestClaimsService(repo, clock);
const listSvc = new ListClaimsService(repo);
const getByIdSvc = new GetClaimByIdService(repo);

export const ingestClaimsHandler = buildIngestHandler(ingestSvc);
export const listClaimsHandler = buildListHandler(listSvc);
export const getClaimByIdHandler = buildGetByIdHandler(getByIdSvc);
