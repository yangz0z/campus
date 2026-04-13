export default function TemplateLoading() {
  return (
    <div className="bg-[#F2F2F0]">
      <div className="mx-auto max-w-sm px-4 pb-28 pt-6">
        {/* 헤더 skeleton */}
        <div className="mb-4 flex items-center justify-between">
          <div className="h-7 w-28 animate-shimmer rounded-lg" />
          <div className="h-9 w-16 animate-shimmer rounded-full" />
        </div>

        {/* 그룹 skeleton */}
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <div className="mb-3 h-5 w-1/3 animate-shimmer rounded-md" />
              <div className="space-y-2">
                <div className="h-10 w-full animate-shimmer rounded-lg" />
                <div className="h-10 w-full animate-shimmer rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
