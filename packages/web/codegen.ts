import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "http://localhost:4000/graphql",
  documents: ["./lib/api/gql.ts"],
  generates: {
    "./gql/": {
      preset: "client",
      presetConfig: {
        fragmentMasking: { unmaskFunctionName: "getFragmentData" },
      },
    },
    "./schema.graphql": {
      plugins: ["schema-ast"],
    },
  },
};

export default config;
