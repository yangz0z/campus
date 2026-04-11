'use client';

import { motion } from 'framer-motion';

const STEPS = [
  {
    num: '01',
    icon: '🏕️',
    title: '캠프 만들기',
    desc: '캠핑 이름과 날짜를 설정하고 나만의 캠프를 만드세요. 1분이면 충분해요.',
  },
  {
    num: '02',
    icon: '👥',
    title: '멤버 초대하기',
    desc: '링크 하나로 함께 갈 멤버들을 초대하세요. 앱 설치 없이 바로 참여할 수 있어요.',
  },
  {
    num: '03',
    icon: '✅',
    title: '함께 체크하기',
    desc: '준비물을 나눠 담당하고 실시간으로 함께 체크해요. 빠진 것 없이 완벽하게!',
  },
];

export default function StepSection() {
  return (
    <section className="overflow-hidden bg-primary-900 px-4 py-16 md:py-24">
      <div className="mx-auto max-w-screen-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary-400">
            How it works
          </p>
          <h2 className="text-2xl font-extrabold text-white md:text-3xl">
            딱 3단계면 충분해요
          </h2>
          <p className="mt-3 text-sm text-primary-300 md:text-base">
            복잡한 설정 없이 바로 캠핑 준비를 시작하세요
          </p>
        </motion.div>

        <div className="relative grid gap-5 md:grid-cols-3">
          {/* 연결선 (데스크탑) */}
          <div
            className="pointer-events-none absolute left-[33.3%] right-[33.3%] top-10 hidden h-px border-t border-dashed border-primary-700 md:block"
            aria-hidden="true"
          />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: i * 0.15 }}
              className="relative rounded-3xl border border-white/10 bg-white/5 p-7"
            >
              {/* 번호 뱃지 */}
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-primary-600 bg-primary-800 text-sm font-bold text-primary-300">
                  {step.num}
                </span>
              </div>

              <div className="mb-3 text-4xl">{step.icon}</div>
              <h3 className="mb-2 text-base font-bold text-white">{step.title}</h3>
              <p className="text-sm leading-relaxed text-primary-300">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
