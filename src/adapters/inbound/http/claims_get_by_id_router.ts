import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import { type GetClaimByIdService } from "../../../application/services/get_claim_by_id_service";

export function buildGetByIdHandler(getByIdSvc: GetClaimByIdService) {
  const raw = async (event: any) => {
    try {
      const id = event.pathParameters?.id;
      const claim = await getByIdSvc.execute(id as string);

      return {
        statusCode: 200,
        body: JSON.stringify(claim)
      };
    } catch (err: any) {
      const statusCode = err.code === 404 ? 404 : 400;
      return {
        statusCode,
        body: JSON.stringify({ message: err.message ?? "Error" })
      };
    }
  };

  return middy(raw).use(httpErrorHandler());
}
