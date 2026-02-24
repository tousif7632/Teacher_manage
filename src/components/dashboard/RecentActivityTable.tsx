type RecentActivityItem = {
  id: string;
  activityType: "LESSON" | "QUIZ" | "ASSESSMENT";
  subject: string;
  class: string;
  createdAt: string;
};

type RecentActivityTableProps = {
  items: RecentActivityItem[];
  page: number;
  pageSize: number;
  total: number;
  onPageChange?: (page: number) => void;
  loading?: boolean;
};

const typeLabelMap: Record<RecentActivityItem["activityType"], string> = {
  LESSON: "Lesson",
  QUIZ: "Quiz",
  ASSESSMENT: "Assessment",
};

const typeColorMap: Record<RecentActivityItem["activityType"], string> = {
  LESSON: "bg-indigo-50 text-indigo-700",
  QUIZ: "bg-emerald-50 text-emerald-700",
  ASSESSMENT: "bg-amber-50 text-amber-700",
};

export function RecentActivityTable({
  items,
  page,
  pageSize,
  total,
  onPageChange,
  loading,
}: RecentActivityTableProps): React.ReactNode {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm backdrop-blur-sm sm:p-4">
      <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xs font-semibold text-slate-900 sm:text-sm">
          Recent activity
        </h2>
        {total > 0 && (
          <p className="text-xs text-slate-500">
            Showing {start}-{end} of {total}
          </p>
        )}
      </div>
      {items.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">
          No recent activity for this teacher.
        </p>
      ) : (
        <div className="-mx-2 overflow-x-auto">
          <table className="min-w-full table-fixed border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-2 py-2">Type</th>
                <th className="px-2 py-2">Subject</th>
                <th className="px-2 py-2">Class</th>
                <th className="px-2 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-2 py-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${typeColorMap[item.activityType]}`}
                    >
                      {typeLabelMap[item.activityType]}
                    </span>
                  </td>
                  <td className="truncate px-2 py-2 text-slate-800">
                    {item.subject}
                  </td>
                  <td className="px-2 py-2 text-slate-600">{item.class}</td>
                  <td className="px-2 py-2 text-slate-600">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-3 flex flex-col gap-2 text-xs text-slate-500 sm:mt-4 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Page {page} of {totalPages}
        </p>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={loading || page <= 1}
            onClick={() => onPageChange && onPageChange(page - 1)}
            className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={loading || page >= totalPages}
            onClick={() => onPageChange && onPageChange(page + 1)}
            className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

