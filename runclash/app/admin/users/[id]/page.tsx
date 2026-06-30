import { handleGetUserById } from "@/lib/actions/admin/user-action";

export default async function ViewUserPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const res = await handleGetUserById(id);
  const user = res.success ? res.data : null;

  if (!user) return <div className="py-12 text-center">User not found</div>;

  return (
    <div className="py-12">
      <div className="mx-auto max-w-2xl space-y-4">
        <h2 className="text-2xl font-bold">{user.firstName} {user.lastName}</h2>
        <p className="text-sm text-muted">{user.email}</p>
        <p className="text-sm text-muted">Username: {user.username}</p>
        <p className="text-sm text-muted">Role: {user.role}</p>
      </div>
    </div>
  );
}
