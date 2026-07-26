import { handleGetAllUsers } from "@/lib/actions/admin/user-action";
import UserTable from "@/app/admin/users/_components/UserTable";
import Link from "next/link";

export default async function UsersPage({ searchParams }: { searchParams: any }) {
  const page = parseInt(searchParams?.page || "1", 10);
  const limit = parseInt(searchParams?.limit || "10", 10);
  const search = searchParams?.search || "";

  const res = await handleGetAllUsers({ page, limit, search });
  const data = res.success ? res.data : [];
  const pagination = res.success ? res.pagination : { page, limit, total: 0, totalPages: 1 };

  return (
    <div className="py-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-950">👥 Admin Users</h1>
          <p className="mt-2 text-gray-600">Manage and monitor users.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/analytics" className="text-sm font-semibold text-gray-600 underline-offset-4 hover:underline">Analytics</Link>
          <Link href="/admin/challenges" className="text-sm font-semibold text-gray-600 underline-offset-4 hover:underline">Challenges</Link>
          <Link href="/admin/badges" className="text-sm font-semibold text-gray-600 underline-offset-4 hover:underline">Badges</Link>
        </div>
      </div>
      <UserTable data={data} pagination={pagination} search={search} />
    </div>
  );
}
