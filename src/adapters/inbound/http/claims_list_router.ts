import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import { type ListClaimsService } from "../../../application/services/list_claims_service";

export function buildListHandler(listSvc: ListClaimsService) {
  const raw = async (event: any) => {
    try {
      const query = event.queryStringParameters || {};
      const result = await listSvc.execute(query);

      return {
        statusCode: 200,
        body: JSON.stringify(result)
      };
    } catch (err: any) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: err.message ?? "Bad request" })
      };
    }
  };

  return middy(raw).use(httpErrorHandler());
}
