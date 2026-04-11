'use client';

import { motion } from 'framer-motion';
import { FEATURES } from '@/constants/home';

const ACCENTS = [
  'from-primary-50 to-primary-100 text-primary-600',
  'from-warm-50 to-amber-100 text-amber-600',
  'from-earth-50 to-earth-100 text-earth-600',
];

export default function FeatureSection() {
  return (
    <section className="bg-earth-50 px-4 py-16 md:py-24">
      <div className="mx-auto max-w-screen-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary-500">
            Features
          </p>
          <h2 className="text-2xl font-extrabold text-gray-900 md:text-3xl">
            왜 CampUs인가요?
          </h2>
          <p className="mt-3 text-sm text-gray-500 md:text-base">
            캠핑 준비를 더 똑똑하고 편하게
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="rounded-3xl border border-earth-200 bg-white p-7 shadow-sm transition-shadow hover:shadow-lg"
            >
              <motion.div
                className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-3xl ${ACCENTS[i]}`}
                whileHover={{ scale: 1.08, rotate: -3 }}
                transition={{ duration: 0.2 }}
              >
                {feature.icon}
              </motion.div>
              <h3 className="mb-2 text-base font-bold text-gray-900">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
