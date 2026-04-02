import { SEASONS } from '@/constants/home';

export default function SeasonSection() {
  return (
    <section className="bg-white px-4 py-12 md:py-16">
      <div className="mx-auto max-w-screen-lg">
        <h2 className="text-center text-xl font-bold text-gray-900 md:text-2xl">
          계절별 캠핑 준비물
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          계절에 따라 꼭 필요한 아이템이 달라요
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {SEASONS.map((season) => (
            <div
              key={season.id}
              className={`rounded-2xl border p-4 transition-shadow hover:shadow-md ${season.color}`}
            >
              <div className="text-2xl">{season.icon}</div>
              <h3 className="mt-2 text-base font-bold">{season.name} 캠핑</h3>
              <p className="mt-0.5 text-xs opacity-70">{season.months}</p>
              <ul className="mt-3 space-y-1">
                {season.items.map((item) => (
                  <li key={item} className="flex items-center gap-1.5 text-xs">
                    <span className="h-1 w-1 shrink-0 rounded-full bg-current opacity-40" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
