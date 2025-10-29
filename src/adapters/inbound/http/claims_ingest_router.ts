import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import { type IngestClaimsService } from "../../../application/services/ingest_claims_service";

export function buildIngestHandler(ingestSvc: IngestClaimsService) {
  const raw = async (event: any) => {
    const csvContent = event.body;
    if (!csvContent) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "CSV body required" })
      };
    }

    const summary = await ingestSvc.execute(csvContent as string);

    return {
      statusCode: 200,
      body: JSON.stringify(summary)
    };
  };

  return middy(raw).use(httpErrorHandler());
}
