'use client';

import { motion } from 'framer-motion';
import { SEASONS } from '@/constants/home';

const GRADIENT: Record<string, string> = {
  spring: 'from-pink-50 to-rose-50 border-pink-200 text-pink-800',
  summer: 'from-sky-50 to-blue-50 border-blue-200 text-blue-800',
  fall: 'from-orange-50 to-amber-50 border-orange-200 text-orange-800',
  winter: 'from-slate-50 to-blue-50 border-slate-200 text-slate-800',
};

export default function SeasonSection() {
  return (
    <section className="bg-white px-4 py-16 md:py-24">
      <div className="mx-auto max-w-screen-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary-500">
            Seasonal Guide
          </p>
          <h2 className="text-2xl font-extrabold text-gray-900 md:text-3xl">
            계절별 캠핑 준비물
          </h2>
          <p className="mt-3 text-sm text-gray-500 md:text-base">
            계절에 따라 꼭 필요한 아이템이 달라요
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {SEASONS.map((season, i) => (
            <motion.div
              key={season.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`cursor-default rounded-3xl border bg-gradient-to-b p-5 shadow-sm transition-shadow hover:shadow-md ${GRADIENT[season.id]}`}
            >
              <motion.div
                className="mb-3 text-4xl"
                whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.3 }}
              >
                {season.icon}
              </motion.div>
              <h3 className="font-bold">{season.name} 캠핑</h3>
              <p className="mt-0.5 text-xs opacity-60">{season.months}</p>
              <ul className="mt-3 space-y-1.5">
                {season.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-50" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
