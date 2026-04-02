import { FEATURES } from '@/constants/home';

export default function FeatureSection() {
  return (
    <section id="features" className="px-4 py-12 md:py-16">
      <div className="mx-auto max-w-screen-lg">
        <h2 className="text-center text-xl font-bold text-gray-900 md:text-2xl">
          왜 Campus인가요?
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          캠핑 준비를 더 똑똑하고 편하게
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-earth-200 bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-2xl">
                {feature.icon}
              </div>
              <h3 className="mt-4 text-base font-bold text-gray-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
