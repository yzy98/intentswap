import { useIntentsData } from "../intents-data-provider";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export const IntentsTable = () => {
  const { pageIntentRows } = useIntentsData();
  return <DataTable columns={columns} data={pageIntentRows} />;
};
