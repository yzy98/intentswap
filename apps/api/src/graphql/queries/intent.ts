import { db } from "@/clients/db-client";
import { builder } from "@/graphql/builder";
import { IntentRef } from "@/graphql/models/intent";

// Query all intents
builder.queryField("intents", (t) =>
  t.field({
    type: [IntentRef],
    resolve: () => db.query.intent.findMany(),
  })
);
