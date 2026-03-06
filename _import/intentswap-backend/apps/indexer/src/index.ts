import { syncBlocks } from "@/core/block-sync";

async function main() {
  console.log("Indexer started");
  await syncBlocks();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
