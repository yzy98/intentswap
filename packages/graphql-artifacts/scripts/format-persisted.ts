import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { parse, print } from "@0no-co/graphql.web";
import { formatDocument } from "@urql/core";

const inputPath = path.resolve(
  import.meta.dirname,
  "../persisted-manifests/persisted.json"
);

const outputPath = path.resolve(
  import.meta.dirname,
  "../persisted-manifests/persisted.formatted.json"
);

const mappingPath = path.resolve(
  import.meta.dirname,
  "../persisted-manifests/id-to-hash.json"
);

const raw: Record<string, string> = JSON.parse(
  fs.readFileSync(inputPath, "utf-8")
);

const formatted: Record<string, string> = {};
const idToHash: Record<string, string> = {};

for (const [documentId, query] of Object.entries(raw)) {
  const formattedQuery = print(formatDocument(parse(query as string)));
  const hash = createHash("sha256").update(formattedQuery).digest("hex");
  formatted[hash] = formattedQuery;
  idToHash[documentId] = hash;
}

fs.writeFileSync(outputPath, JSON.stringify(formatted, null, 2));
fs.writeFileSync(mappingPath, JSON.stringify(idToHash, null, 2));
