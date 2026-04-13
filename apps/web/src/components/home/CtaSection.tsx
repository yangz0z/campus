'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ROUTES } from '@/constants/routes';

export default function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 to-primary-900 px-4 py-20 md:py-28">
      {/* 배경 블롭 */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-warm-400/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-screen-sm text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-5 text-5xl"
        >
          🔥
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl font-extrabold leading-tight text-white md:text-4xl"
        >
          준비는 끝났어요.
          <br />이제 캠핑만 떠나세요!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-4 text-sm text-primary-200 md:text-base"
        >
          지금 바로 시작하면 오늘 안에 완벽한 캠핑 준비물 리스트를 만들 수 있어요
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-9"
        >
          <Link
            href={ROUTES.SIGN_IN}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-9 py-4 text-base font-semibold text-primary-700 shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl"
          >
            무료로 시작하기
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              →
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
