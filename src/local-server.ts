import express from "express";
import bodyParser from "body-parser";

import { ingestClaimsHandler, listClaimsHandler, getClaimByIdHandler } from "./index";

async function runMiddy(
  handler: any,
  {
    body,
    method,
    pathParams,
    queryParams
  }: {
    body?: string;
    method: string;
    pathParams?: Record<string, string>;
    queryParams?: Record<string, string | undefined>;
  }
) {
  const event = {
    httpMethod: method,
    body,
    pathParameters: pathParams ?? {},
    queryStringParameters: queryParams ?? {}
  };

  const resp = await handler(event, {}, () => {});
  console.log("[runMiddy] resp =>", resp);
  return resp;
}

const app = express();

app.get("/claims", async (req, res) => {
  const result = await runMiddy(listClaimsHandler, {
    method: "GET",
    queryParams: req.query as any
  });

  res.status(result.statusCode as number).send(result.body);
});

app.post("/claims", bodyParser.text({ type: "*/*" }), async (req, res) => {
  const result = await runMiddy(ingestClaimsHandler, {
    method: "POST",
    body: req.body,
    queryParams: req.query as any
  });

  res.status(result.statusCode as number).send(result.body);
});

app.get("/claims/:id", async (req, res) => {
  const result = await runMiddy(getClaimByIdHandler, {
    method: "GET",
    pathParams: { id: req.params.id },
    queryParams: req.query as any
  });

  res.status(result.statusCode as number).send(result.body);
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Local server running on http://localhost:${PORT}`);
});
