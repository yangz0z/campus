'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ROUTES } from '@/constants/routes';

const FLOATING = [
  { emoji: '🏕️', style: { top: '14%', left: '7%' }, delay: 0, dur: 5 },
  { emoji: '🌲', style: { top: '22%', right: '8%' }, delay: 0.5, dur: 6 },
  { emoji: '🔥', style: { bottom: '30%', left: '11%' }, delay: 0.9, dur: 4.5 },
  { emoji: '⭐', style: { top: '10%', left: '52%' }, delay: 1.3, dur: 3.8 },
  { emoji: '⛺', style: { bottom: '28%', right: '7%' }, delay: 0.6, dur: 5.5 },
  { emoji: '🌙', style: { top: '42%', right: '3%' }, delay: 1.6, dur: 4.2 },
  { emoji: '🍃', style: { top: '60%', left: '5%' }, delay: 0.3, dur: 5.8 },
];

const STATS = [
  { label: '준비물 카테고리', value: '4계절' },
  { label: '기본 제공 아이템', value: '100+' },
  { label: '실시간 협업', value: '팀 단위' },
];

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden px-4 py-24">
      {/* 배경 그라디언트 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-earth-100" />

      {/* 블롭 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[560px] w-[560px] rounded-full bg-primary-100 opacity-50 blur-[120px]" />
        <div className="absolute -bottom-20 -right-40 h-[480px] w-[480px] rounded-full bg-warm-100 opacity-60 blur-[100px]" />
        <div className="absolute bottom-1/3 left-1/3 h-[300px] w-[300px] rounded-full bg-earth-100 opacity-40 blur-[80px]" />
      </div>

      {/* 플로팅 이모지 (데스크탑만) */}
      {FLOATING.map((item, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute hidden select-none md:block"
          style={{ ...item.style, fontSize: '2rem' }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{
            opacity: [0.45, 0.75, 0.45],
            scale: [1, 1.1, 1],
            y: [0, -12, 0],
          }}
          transition={{
            duration: item.dur,
            delay: item.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {item.emoji}
        </motion.div>
      ))}

      {/* 콘텐츠 */}
      <div className="relative z-10 mx-auto max-w-2xl text-center">
        {/* 뱃지 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/80 px-4 py-1.5 text-sm font-semibold text-primary-700 shadow-sm backdrop-blur-sm"
        >
          <span>🏕️</span>
          <span>함께하는 캠핑 준비의 시작</span>
        </motion.div>

        {/* 헤드라인 */}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.15 }}
          className="text-5xl font-extrabold leading-[1.15] tracking-tight text-gray-900 md:text-7xl"
        >
          캠핑 준비,
          <br />
          <span className="relative inline-block text-primary-600">
            빠짐없이
            <motion.svg
              viewBox="0 0 200 10"
              className="absolute -bottom-1 left-0 w-full"
              aria-hidden="true"
            >
              <motion.path
                d="M3 7 C50 2, 120 10, 197 5"
                stroke="#16a34a"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.85, ease: 'easeOut' }}
              />
            </motion.svg>
          </span>
          {' '}챙기세요
        </motion.h1>

        {/* 서브타이틀 */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-6 text-lg leading-relaxed text-gray-500 md:text-xl"
        >
          계절별 준비물 추천부터 멤버별 역할 분담까지
          <br className="hidden md:block" />
          CampUs와 함께라면 캠핑 준비가 쉬워집니다
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.52 }}
          className="mt-10"
        >
          <Link
            href={ROUTES.SIGN_IN}
            className="inline-flex items-center gap-2.5 rounded-2xl bg-primary-600 px-9 py-4 text-base font-semibold text-white shadow-lg shadow-primary-600/30 transition-all hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-600/40"
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

        {/* 통계 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-14 flex justify-center gap-10 border-t border-earth-200 pt-8"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-extrabold text-gray-900">{stat.value}</div>
              <div className="mt-0.5 text-xs text-gray-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
