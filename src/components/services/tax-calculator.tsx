"use client";

import { useState } from "react";

/**
 * מחשבון פטור ממס (designs/service.html):
 * מדרגות מס חודשיות בישראל בקירוב, בניכוי נקודות זיכוי בסיסיות;
 * החזר רטרואקטיבי = חיסכון שנתי × שנים × 1.04 (הצמדה וריבית משוערת).
 */
const BRACKETS: [number, number][] = [
  [7010, 0.1],
  [10060, 0.14],
  [16150, 0.2],
  [22440, 0.31],
  [46690, 0.35],
  [Infinity, 0.47],
];
const CREDIT_POINTS = 2.25 * 242;

function annualSaving(income: number): number {
  let tax = 0;
  let prev = 0;
  for (const [cap, rate] of BRACKETS) {
    if (income > prev) tax += (Math.min(income, cap) - prev) * rate;
    prev = cap;
    if (income <= cap) break;
  }
  return Math.max(0, Math.round((tax - CREDIT_POINTS) * 12));
}

const fmt = (n: number) => n.toLocaleString("he-IL");

export function TaxCalculator() {
  const [income, setIncome] = useState(15000);
  const [pct, setPct] = useState("100");
  const [years, setYears] = useState(4);

  const eligible = pct !== "80";
  const annual = eligible ? annualSaving(income) : 0;
  const retro = Math.round(annual * years * 1.04);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-banner px-6 py-8 text-white md:px-9">
      <div
        aria-hidden
        className="absolute -left-20 -top-[120px] h-[400px] w-[480px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(0,0,255,0.5) 0%, rgba(0,0,255,0) 70%)" }}
      />
      <div className="relative">
        <h2 className="m-0 mb-1.5 font-display text-[24px] font-light md:text-[30px]">
          כמה כסף <span className="font-black">מחכה לכם?</span>
        </h2>
        <p className="m-0 mb-6 text-[15px] text-white/80">
          הזינו הכנסה ואחוזי נכות — ותקבלו הערכה ראשונית של החיסכון וההחזר.
        </p>

        <div className="flex flex-col gap-5">
          <div>
            <label htmlFor="calc-income" className="mb-2 flex items-center justify-between text-[15px]">
              <span>הכנסה חודשית ברוטו</span>
              <b className="tnum text-lg">{fmt(income)} ₪</b>
            </label>
            <input
              id="calc-income"
              type="range"
              min={6000}
              max={60000}
              step={500}
              value={income}
              onChange={(e) => setIncome(parseInt(e.target.value, 10))}
              className="w-full cursor-pointer"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="calc-pct" className="mb-2 block text-[15px]">
                אחוזי נכות רפואית
              </label>
              <select
                id="calc-pct"
                value={pct}
                onChange={(e) => setPct(e.target.value)}
                className="focus-brand w-full min-h-12 cursor-pointer rounded-[10px] border-none bg-white px-4 py-3 text-base text-ink"
              >
                <option value="100">100% נכות</option>
                <option value="90">90%+ נכות משוקללת</option>
                <option value="80">פחות מ-90%</option>
              </select>
            </div>
            <div>
              <label htmlFor="calc-years" className="mb-2 block text-[15px]">
                שנים אחורה לדרישת החזר
              </label>
              <select
                id="calc-years"
                value={years}
                onChange={(e) => setYears(parseInt(e.target.value, 10))}
                className="focus-brand w-full min-h-12 cursor-pointer rounded-[10px] border-none bg-white px-4 py-3 text-base text-ink"
              >
                {[0, 1, 2, 3, 4, 5, 6].map((y) => (
                  <option key={y} value={y}>
                    {y === 0 ? "ללא החזר רטרואקטיבי" : `${y} שנים`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {eligible ? (
            <div className="grid gap-3 sm:grid-cols-2" aria-live="polite">
              <div className="rounded-xl bg-white/10 px-5 py-4">
                <div className="text-sm text-white/75">חיסכון שנתי משוער</div>
                <div className="tnum font-display text-[32px] font-black">{fmt(annual)} ₪</div>
              </div>
              <div className="rounded-xl bg-accent px-5 py-4">
                <div className="text-sm text-white/85">החזר רטרואקטיבי משוער</div>
                <div className="tnum font-display text-[32px] font-black">{fmt(retro)} ₪</div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-white/10 px-5 py-4 text-[15px] leading-relaxed" aria-live="polite">
              מתחת ל-90% נכות משוקללת אין זכאות לפטור מלא — אבל ייתכן שמגיעות לכם זכויות אחרות
              (נקודות זיכוי, קצבאות, ביטוחים). שווה לבדוק איתנו.
            </div>
          )}

          <p className="m-0 text-[12.5px] leading-normal text-white/60">
            * הערכה בלבד, לפי מדרגות המס ונקודות הזיכוי הבסיסיות. הסכום בפועל תלוי בנתונים
            האישיים ובאישור רשות המסים.
          </p>
        </div>
      </div>
    </div>
  );
}
