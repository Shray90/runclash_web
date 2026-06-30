import { handleGetAllUsers } from "@/lib/actions/admin/user-action";
import UserTable from "@/app/admin/users/_components/UserTable";

export default async function UsersPage({ searchParams }: { searchParams: any }) {
  const page = parseInt(searchParams?.page || "1", 10);
  const limit = parseInt(searchParams?.limit || "10", 10);
  const search = searchParams?.search || "";

  const res = await handleGetAllUsers({ page, limit, search });
  const data = res.success ? res.data : [];
  const pagination = res.success ? res.pagination : { page, limit, total: 0, totalPages: 1 };

  return (
    <div className="py-12">
      <UserTable data={data} pagination={pagination} search={search} />
    </div>
  );
}
