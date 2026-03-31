import Link from 'next/link';

export default function MypagePage() {
  return (
    <section className="mx-auto max-w-screen-lg px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">내 캠프</h1>
        <Link
          href="/camp/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
        >
          <span className="text-lg leading-none">+</span>
          새 캠프 만들기
        </Link>
      </div>

      <div className="mt-12 flex flex-col items-center justify-center py-16 text-center">
        <p className="text-5xl">🏕️</p>
        <p className="mt-4 text-lg font-medium text-gray-500">아직 캠프가 없어요</p>
        <p className="mt-1 text-sm text-gray-400">새 캠프를 만들어 캠핑 준비를 시작해 보세요!</p>
      </div>
    </section>
  );
}
