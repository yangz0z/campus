export default function MypageLoading() {
  return (
    <div className="mypage bg-[#F2F2F0]">
      <header className="mypage-header bg-[#F2F2F0] px-5 pb-3 pt-10">
        <div className="mypage-header-inner mx-auto flex max-w-sm items-center justify-between">
          <div className="h-7 w-20 animate-shimmer rounded-lg" />
          <div className="h-9 w-36 animate-shimmer rounded-full" />
        </div>
      </header>
      <main className="mypage-content mx-auto max-w-sm space-y-3 px-4 pt-3">
        <div className="camp-list-skeleton overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          {[0, 1, 2].map((i) => (
            <div key={i} className="camp-skeleton-item">
              {i !== 0 && <div className="camp-skeleton-divider mx-5 h-px bg-gray-100" />}
              <div className="camp-skeleton-row flex items-center gap-4 px-5 py-4">
                <div className="camp-skeleton-text flex-1 space-y-2">
                  <div className="camp-skeleton-name h-[17px] w-2/5 animate-shimmer rounded-md" />
                  <div className="camp-skeleton-meta h-3 w-1/3 animate-shimmer rounded-md" />
                </div>
                <div className="camp-skeleton-badge h-7 w-14 animate-shimmer rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
