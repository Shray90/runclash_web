import Link from "next/link";
import { FileText } from "lucide-react";

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
};

export default function EmptyState({ icon = <FileText className="h-12 w-12 text-gray-400" />, title, description, actionLabel, actionHref, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-gray-500">{description}</p>}
      {(actionLabel && (actionHref || onAction)) && (
        actionHref ? (
          <Link href={actionHref} className="mt-5 rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700">
            {actionLabel}
          </Link>
        ) : (
          <button onClick={onAction} className="mt-5 rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700">
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
}
