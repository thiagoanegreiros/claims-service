import { Readable } from "stream";
import csv from "csv-parser";

export async function parseCsvToObjects(csvContent: string): Promise<any[]> {
  return await new Promise((resolve, reject) => {
    const results: any[] = [];
    Readable.from(csvContent)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        resolve(results);
      })
      .on("error", reject);
  });
}
