import UserFormEdit from "@/app/admin/users/_components/UserFormEdit";

export default function EditUserPage({ params }: { params: { id: string } }) {
  return (
    <div className="py-12">
      <UserFormEdit id={params.id} />
    </div>
  );
}
