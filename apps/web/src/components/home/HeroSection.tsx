import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="px-4 pb-16 pt-12 text-center md:pb-24 md:pt-20">
      <div className="mx-auto max-w-screen-sm">
        <p className="text-4xl">🏕️</p>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-5xl">
          캠핑 준비,
          <br />
          <span className="text-primary-600">빠짐없이</span> 챙기세요
        </h1>
        <p className="mt-4 text-base leading-relaxed text-gray-500 md:text-lg">
          계절에 맞는 준비물 추천부터 멤버별 역할 분담까지.
          <br className="hidden md:block" />
          Campus와 함께라면 캠핑 준비가 쉬워집니다.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/sign-in"
            className="w-full rounded-xl bg-primary-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:bg-primary-700 hover:shadow-xl sm:w-auto"
          >
            바로 시작하기
          </Link>
        </div>
      </div>
    </section>
  );
}
