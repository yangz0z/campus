'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dayjs } from '@campus/shared';

interface DateRangeCalendarProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
  minDate?: string;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function DateRangeCalendar({ startDate, endDate, onChange, minDate }: DateRangeCalendarProps) {
  const initialMonth = startDate ? dayjs(startDate) : dayjs();
  const [viewDate, setViewDate] = useState(initialMonth.startOf('month'));
  const [direction, setDirection] = useState(0);

  const today = dayjs().format('YYYY-MM-DD');
  const min = minDate ?? null;

  // 달력 그리드 생성
  const calendarDays = useMemo(() => {
    const firstDay = viewDate.startOf('month');
    const daysInMonth = viewDate.daysInMonth();
    const startDow = firstDay.day(); // 0=일 ~ 6=토

    const days: Array<{ date: string; day: number; inMonth: boolean }> = [];

    // 이전 달 빈칸
    const prevMonth = viewDate.subtract(1, 'month');
    const prevDays = prevMonth.daysInMonth();
    for (let i = startDow - 1; i >= 0; i--) {
      const d = prevDays - i;
      days.push({ date: prevMonth.date(d).format('YYYY-MM-DD'), day: d, inMonth: false });
    }

    // 이번 달
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ date: firstDay.date(d).format('YYYY-MM-DD'), day: d, inMonth: true });
    }

    // 다음 달 빈칸 (6줄 채우기)
    const remaining = 42 - days.length;
    const nextMonth = viewDate.add(1, 'month');
    for (let d = 1; d <= remaining; d++) {
      days.push({ date: nextMonth.date(d).format('YYYY-MM-DD'), day: d, inMonth: false });
    }

    return days;
  }, [viewDate]);

  function handleDateClick(date: string) {
    if (min !== null && date < min) return;

    // 범위가 이미 잡혀있거나, startDate만 있는데 클릭 날짜가 더 이전이면 → 리셋
    if (startDate && endDate) {
      onChange(date, '');
    } else if (startDate && !endDate) {
      if (date < startDate) {
        onChange(date, '');
      } else {
        onChange(startDate, date);
      }
    } else {
      onChange(date, '');
    }
  }

  function prevMonth() {
    setDirection(-1);
    setViewDate((v) => v.subtract(1, 'month'));
  }

  function nextMonth() {
    setDirection(1);
    setViewDate((v) => v.add(1, 'month'));
  }

  function getDayStyle(date: string, inMonth: boolean) {
    const isDisabled = min !== null && date < min;
    const isToday = date === today;
    const isStart = date === startDate;
    const isEnd = date === endDate;
    const isInRange = startDate && endDate && date > startDate && date < endDate;

    if (!inMonth) return 'calendar-day--outside text-gray-200';
    if (isDisabled) return 'calendar-day--disabled text-gray-200 cursor-not-allowed';

    if (isStart || isEnd) {
      return 'calendar-day--selected bg-primary-600 text-white font-semibold';
    }
    if (isInRange) {
      return 'calendar-day--in-range bg-primary-50 text-primary-700';
    }
    if (isToday) {
      return 'calendar-day--today text-primary-600 font-semibold';
    }
    return 'calendar-day--default text-gray-700 hover:bg-gray-100';
  }

  function getRangeShape(date: string) {
    const isStart = date === startDate;
    const isEnd = date === endDate;
    const isInRange = startDate && endDate && date > startDate && date < endDate;
    const hasRange = startDate && endDate;

    if (!hasRange) {
      if (isStart) return 'rounded-full';
      return '';
    }

    if (isStart && isEnd) return 'rounded-full';
    if (isStart) return 'rounded-l-full';
    if (isEnd) return 'rounded-r-full';
    if (isInRange) return '';
    return 'rounded-full';
  }

  function getRangeBg(date: string) {
    const isStart = date === startDate;
    const isEnd = date === endDate;
    const hasRange = startDate && endDate;

    if (!hasRange) return '';
    if (isStart) return 'calendar-range-start bg-gradient-to-r from-transparent to-primary-50';
    if (isEnd) return 'calendar-range-end bg-gradient-to-l from-transparent to-primary-50';
    return '';
  }

  const monthLabel = viewDate.format('YYYY년 M월');

  return (
    <div className="date-range-calendar rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      {/* 월 네비게이션 */}
      <div className="calendar-nav mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="calendar-nav-prev flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 active:bg-gray-200"
        >
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
            <path d="M6 1L1 6L6 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="calendar-month-label text-[15px] font-semibold text-gray-900">{monthLabel}</span>
        <button
          type="button"
          onClick={nextMonth}
          className="calendar-nav-next flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 active:bg-gray-200"
        >
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
            <path d="M1 1L6 6L1 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="calendar-weekdays mb-1 grid grid-cols-7 text-center">
        {WEEKDAYS.map((d, i) => (
          <span
            key={d}
            className={`calendar-weekday py-1.5 text-[11px] font-medium ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}
          >
            {d}
          </span>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={viewDate.format('YYYY-MM')}
          initial={{ opacity: 0, x: direction * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -40 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="calendar-grid grid grid-cols-7"
        >
          {calendarDays.map(({ date, day, inMonth }) => {
            const isDisabled = !inMonth || (min !== null && date < min);
            const isStart = date === startDate;
            const isEnd = date === endDate;
            const isInRange = startDate && endDate && date > startDate && date < endDate;
            const isSelected = isStart || isEnd;

            return (
              <div key={date} className={`calendar-cell relative ${getRangeBg(date)}`}>
                {/* 범위 배경 레이어 */}
                {isInRange && inMonth && (
                  <div className="calendar-range-bg absolute inset-0 bg-primary-50" />
                )}
                <button
                  type="button"
                  onClick={() => !isDisabled && handleDateClick(date)}
                  disabled={isDisabled}
                  className={`calendar-day relative mx-auto flex h-9 w-9 items-center justify-center text-[13px] transition-colors ${getRangeShape(date)} ${getDayStyle(date, inMonth)}`}
                >
                  {day}
                  {date === today && inMonth && !isSelected && (
                    <span className="calendar-today-dot absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary-400" />
                  )}
                </button>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
