import { OracleManagement } from "@/components/admin/oracle-management";

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-bold text-3xl">Admin Panel</h1>
        <p className="text-muted-foreground">
          Manage Oracle price feeds and system settings
        </p>
      </div>
      <OracleManagement />
    </div>
  );
}
