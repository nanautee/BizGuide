"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { REGIONS_RF, SERVICES, SPHERES } from "../config/selectOptions";
import { computeCompetitionAnalysis, type CompetitionAnalysis } from "../model/computeCompetition";

const fmtInt = (n: number) => new Intl.NumberFormat("ru-RU").format(n);

const levelTextClass: Record<CompetitionAnalysis["level"], string> = {
  low: "text-emerald-500",
  medium: "text-amber-400",
  high: "text-red-500",
};

const selectBase = [
  "h-12 w-full min-w-0 cursor-pointer appearance-none border border-white/55 bg-white",
  "bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat px-4 pr-10",
  "text-sm font-medium text-[#2C74BD] shadow-sm outline-none",
  "transition focus:border-[#4C97F6] focus:ring-2 focus:ring-white/50",
  "sm:h-14 sm:text-base",
].join(" ");

const chevron =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%232C74BD'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")";

const blurBlob = [
  "pointer-events-none rounded-full bg-[#3570D4]",
  "blur-[120px] opacity-[0.7] sm:blur-[160px] md:blur-[200px]",
].join(" ");

const styles = {
  page: [
    "relative w-full",
    "bg-[#9FCCFF]",
    "pb-16 pt-10 sm:pb-20 sm:pt-14 md:pt-16",
  ].join(" "),
  blobsLayer: "pointer-events-none absolute inset-0 z-0 overflow-hidden",
  blobTop: [
    "absolute left-1/2 top-0 z-0",
    "-translate-x-1/2 -translate-y-[45%]",
    "h-[min(160vw,1100px)] w-[min(160vw,1100px)]",
    blurBlob,
  ].join(" "),
  blobBottomRight: [
    "absolute bottom-0 right-0 z-0",
    "h-[min(150vw,1060px)] w-[min(150vw,1060px)]",
    "translate-x-[25%] translate-y-[30%]",
    blurBlob,
  ].join(" "),
  inner: "relative z-10 w-full px-4 sm:px-8 md:px-12 lg:px-20 xl:px-28",

  title: [
    "whitespace-nowrap text-center font-bold leading-none text-white",
    "text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl",
  ].join(" "),
  subtitle: [
    "mx-auto mt-5 max-w-[920px] text-center font-normal leading-snug text-white/95",
    "text-base sm:text-lg md:text-xl xl:text-2xl",
  ].join(" "),

  formRow: [
    "mt-10 flex flex-col gap-3",
    "md:mt-12 md:flex-row md:flex-nowrap md:items-stretch md:gap-0",
  ].join(" "),
  selectsGroup: "flex min-w-0 flex-1 flex-col gap-[2px] sm:flex-row",
  selectLeft: `${selectBase} rounded-2xl sm:rounded-none sm:rounded-l-2xl`,
  selectMid: `${selectBase} rounded-2xl sm:rounded-none`,
  selectRight: `${selectBase} rounded-2xl sm:rounded-none sm:rounded-r-2xl`,
  planBtn: [
    "mt-3 h-12 shrink-0 whitespace-nowrap rounded-full px-6 text-sm font-medium text-white shadow-lg",
    "bg-gradient-to-r from-[#4C97F6] to-[#2563c9]",
    "transition hover:brightness-105 active:scale-[0.99]",
    "sm:h-14 sm:text-base md:mt-0 md:ml-[5px] md:px-10",
  ].join(" "),

  sectionLabel: "mt-14 text-left text-2xl font-bold text-white md:mt-16 md:text-3xl",
  analysisGrid: [
    "mt-5 grid grid-cols-1 gap-3",
    "sm:grid-cols-2 lg:grid-cols-5",
  ].join(" "),
  card: [
    "flex min-h-[120px] flex-col justify-center rounded-2xl bg-white p-4 shadow-md",
    "sm:min-h-[132px] sm:p-5",
  ].join(" "),
  cardLabel: "text-xs font-medium leading-tight text-[#4D84C0] sm:text-sm",
  cardValue: "mt-2 break-words text-xl font-bold leading-tight text-[#2E78C8] sm:text-2xl",
  cardSub: "mt-1 text-xs text-[#4D84C0] sm:text-sm",
  cardValueGreen: "mt-2 text-xl font-bold leading-tight text-emerald-500 sm:text-2xl",

  planTitle: "mt-12 text-left text-2xl font-bold text-white md:mt-14 md:text-3xl",
  planGoalLabel: "mt-4 text-lg font-extrabold text-white md:text-xl",
  planGoalText: "mt-2 max-w-[920px] text-lg font-semibold leading-[1.25] text-white md:text-xl xl:text-2xl",

  stepList: "mt-6 max-w-[880px] space-y-3 md:mt-8 md:space-y-4",
  stepItem: "flex items-baseline gap-3",
  stepNum: "shrink-0 text-base font-bold text-white/80 md:text-lg",
  stepText: "text-base leading-snug text-white md:text-lg",
};

const PLAN_STEPS = [
  "Запустите сайт (добавьте телефон, цены, примеры работ)",
  "Заведите соц. сети",
  "Соберите отзывы",
  "Вложитесь в рекламу",
  "Регулярно ведите соц. сети",
  "Следите за аналитикой",
];

const GOAL_TEXT =
  "За 3–6 месяцев вывести бизнес в топ поисковой выдачи по ключевым запросам, настроить стабильный поток клиентов и снизить зависимость от платной рекламы.";

export function FirstStepScreen() {
  const pageRef = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const [blob2Pos, setBlob2Pos] = useState<{ top: number; left: number } | null>(null);

  const [sphere, setSphere] = useState<string>(SPHERES[0]);
  const [service, setService] = useState<string>(SERVICES[0]);
  const [region, setRegion] = useState<string>(REGIONS_RF[0]);
  const [analysis, setAnalysis] = useState<CompetitionAnalysis>(() =>
    computeCompetitionAnalysis(SPHERES[0], SERVICES[0], REGIONS_RF[0]),
  );

  const applyPlan = useCallback(() => {
    setAnalysis(computeCompetitionAnalysis(sphere, service, region));
  }, [sphere, service, region]);

  const updateBlob2Center = useCallback(() => {
    const page = pageRef.current;
    const card = card2Ref.current;
    if (!page || !card) return;
    const pr = page.getBoundingClientRect();
    const cr = card.getBoundingClientRect();
    setBlob2Pos({
      top: cr.top - pr.top + cr.height / 2,
      left: cr.left - pr.left + cr.width / 2,
    });
  }, []);

  useLayoutEffect(() => {
    updateBlob2Center();
    window.addEventListener("resize", updateBlob2Center);
    const ro = new ResizeObserver(updateBlob2Center);
    if (pageRef.current) ro.observe(pageRef.current);
    return () => {
      window.removeEventListener("resize", updateBlob2Center);
      ro.disconnect();
    };
  }, [updateBlob2Center, analysis]);

  const a = analysis;

  return (
    <div ref={pageRef} className={styles.page}>
      <div className={styles.blobsLayer} aria-hidden>
        <div className={styles.blobTop} />
        {blob2Pos !== null && (
          <div
            className={[
              "absolute z-0 h-[min(140vw,1000px)] w-[min(140vw,1000px)] -translate-x-1/2 -translate-y-1/2",
              blurBlob,
            ].join(" ")}
            style={{ top: blob2Pos.top, left: blob2Pos.left }}
          />
        )}
        <div className={styles.blobBottomRight} />
      </div>

      <div className={styles.inner}>
        <h1 className={styles.title}>С чего начать продвижение?</h1>
        <p className={styles.subtitle}>
          Ответьте на 3 вопроса и мы подготовим персональный план запуска
        </p>

        <div className={styles.formRow}>
          <div className={styles.selectsGroup}>
            <select
              aria-label="Сфера"
              className={styles.selectLeft}
              style={{ backgroundImage: chevron }}
              value={sphere}
              onChange={(e) => setSphere(e.target.value)}
            >
              {SPHERES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              aria-label="Услуга или продукт"
              className={styles.selectMid}
              style={{ backgroundImage: chevron }}
              value={service}
              onChange={(e) => setService(e.target.value)}
            >
              {SERVICES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              aria-label="Регион"
              className={styles.selectRight}
              style={{ backgroundImage: chevron }}
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              {REGIONS_RF.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <button type="button" className={styles.planBtn} onClick={applyPlan}>
            Персональный план
          </button>
        </div>

        <h2 className={styles.sectionLabel}>Анализ</h2>

        <div className={styles.analysisGrid}>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Уровень конкуренции</p>
            <p className={`${styles.cardValue} ${levelTextClass[a.level]}`}>{a.levelLabel}</p>
            <p className={styles.cardSub}>конкурентов: {a.nicheCompetitors}</p>
          </div>
          <div ref={card2Ref} className={styles.card}>
            <p className={styles.cardLabel}>Кол-во конкурентов в поиске сайтов</p>
            <p className={styles.cardValue}>{fmtInt(a.searchCompetitorsCount)}</p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Средняя активность конкурентов</p>
            <p className={styles.cardValue}>{a.activityLabel}</p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Средний чек конкурентов</p>
            <p className={styles.cardValue}>{fmtInt(a.avgCheck)} ₽</p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardLabel}>Шанс попасть в топ</p>
            <p className={styles.cardValueGreen}>
              {a.topChanceMin}–{a.topChanceMax}%
            </p>
          </div>
        </div>

        <h2 className={styles.planTitle}>Ваш план</h2>
        <p className={styles.planGoalLabel}>Цель плана</p>
        <p className={styles.planGoalText}>{GOAL_TEXT}</p>

        <ol className={styles.stepList}>
          {PLAN_STEPS.map((text, i) => (
            <li key={i} className={styles.stepItem}>
              <span className={styles.stepNum}>{i + 1}.</span>
              <span className={styles.stepText}>{text}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
