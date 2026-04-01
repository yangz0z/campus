export default function ChecklistLoading() {
  return (
    <div className="checklist-page checklist-page--loading min-h-screen bg-[#F2F2F0]">
      <header className="checklist-header bg-[#F2F2F0] px-5 pb-5 pt-5">
        <div className="checklist-header-inner mx-auto max-w-sm">
          <div className="h-4 w-16 animate-shimmer rounded" />
          <div className="mt-3 h-7 w-2/5 animate-shimmer rounded-lg" />
        </div>
      </header>
      <main className="checklist-content mx-auto max-w-sm space-y-3 px-4 pt-3">
        {[0, 1].map((g) => (
          <div key={g} className="checklist-group-skeleton overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <div className="px-5 py-3.5">
              <div className="h-3 w-1/4 animate-shimmer rounded-md" />
            </div>
            {[0, 1, 2].map((i) => (
              <div key={i}>
                <div className="mx-5 h-px bg-gray-100" />
                <div className="flex items-center gap-3 px-5 py-2.5">
                  <div className="h-4 w-4 animate-shimmer rounded" />
                  <div className="h-[15px] w-2/5 animate-shimmer rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </main>
    </div>
  );
}
