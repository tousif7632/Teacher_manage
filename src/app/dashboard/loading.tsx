export default function DashboardLoading(): JSX.Element {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-3 w-28 rounded-full bg-slate-200" />
        <div className="h-7 w-72 rounded-full bg-slate-200" />
        <div className="h-4 w-96 rounded-full bg-slate-100" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className="h-24 rounded-xl border border-slate-100 bg-slate-50"
          />
        ))}
      </div>
      <div className="h-72 rounded-xl border border-slate-100 bg-slate-50" />
      <div className="h-80 rounded-xl border border-slate-100 bg-slate-50" />
    </div>
  );
}

