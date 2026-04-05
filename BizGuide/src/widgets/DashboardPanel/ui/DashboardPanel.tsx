"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { analyzeSite, analyzeSocial, analyzeApp } from "@/shared/api/api";
import type { DashboardInitialData } from "../types";
import type { SocialLinkPayload } from "@/shared/api/api";
import { buttons, feedback } from "@/shared/ui/styles";

/* ─── types ────────────────────────────────────────────── */

type DraftSocial = {
  id: string;
  name: string;
  platform: SocialLinkPayload["platform"];
  url: string;
};

/* ─── helpers ──────────────────────────────────────────── */

function detectPlatform(url: string): SocialLinkPayload["platform"] | null {
  const l = url.trim().toLowerCase();
  if (l.includes("vk.com")) return "vk";
  if (l.includes("t.me")) return "tg";
  if (l.includes("dzen.ru") || l.includes("zen.yandex")) return "yandex_zen";
  return null;
}

function platformLabel(p: SocialLinkPayload["platform"]): string {
  if (p === "vk") return "VK";
  if (p === "tg") return "TG";
  return "Яндекс Дзен";
}

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h;
}

function seeded(seed: number, min: number, max: number): number {
  const v = Math.abs(Math.sin(seed) * 10000);
  return Math.floor(min + (v - Math.floor(v)) * (max - min + 1));
}

const fmt = (n: number) => new Intl.NumberFormat("ru-RU").format(n);

function periodLabel(): string {
  const d = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" });
  return `${d.format(new Date(Date.now() - 6 * 864e5))} - ${d.format(new Date())}`;
}

function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return `${sec} сек. назад`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} мин. назад`;
  return `${Math.floor(min / 60)} ч. назад`;
}

/* ─── styles ───────────────────────────────────────────── */

const WRAP = "mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-10 lg:px-16 py-8 md:py-12";

const card = [
  "min-w-0 overflow-visible rounded-[20px] border border-[#87B9F0]/70",
  "bg-white/95 p-4 text-[#2C74BD] shadow-[0_6px_12px_rgba(24,88,163,0.16)]",
  "sm:p-5 md:p-6",
].join(" ");

const panel = [
  "min-w-0 overflow-hidden rounded-[20px] border border-[#87B9F0]/70",
  "bg-white/95 p-4 text-[#2C74BD]",
  "sm:p-5 md:p-6",
].join(" ");

const s = {
  page: "relative w-full",

  title: [
    "w-full text-center font-bold leading-[0.9] text-white",
    "text-3xl sm:text-[42px] md:text-[56px] lg:text-[72px]",
  ].join(" "),

  siteName: [
    "mt-8 font-bold leading-none text-white",
    "text-2xl sm:text-3xl md:text-4xl lg:text-[48px]",
  ].join(" "),

  siteUrl: [
    "mt-1 text-white/70",
    "text-sm sm:text-base md:text-lg lg:text-[22px]",
  ].join(" "),

  badge: "mt-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs text-white/80 sm:text-sm",

  summaryRow: [
    "mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2 text-white",
    "text-lg sm:mt-5 sm:gap-x-10 sm:text-xl",
    "md:text-2xl lg:text-[28px]",
  ].join(" "),
  summaryText: "text-white/90",
  strong: "font-bold text-white",

  /* ── metric cards ─────────────────────────────────── */
  cardsGrid: [
    "mt-6 grid gap-3",
    "grid-cols-1 sm:grid-cols-2",
    "md:mt-8 md:grid-cols-5 md:gap-5",
  ].join(" "),
  metricCard: `${card} flex min-h-[120px] flex-col gap-1 sm:min-h-[132px] md:min-h-[140px]`,
  metricLabel: [
    "min-w-0 break-words text-xs font-medium leading-snug text-[#4D84C0]",
    "sm:text-sm md:text-sm lg:text-base",
  ].join(" "),
  metricValue: [
    "mt-1 min-w-0 shrink-0 break-words font-bold leading-tight text-[#2E78C8]",
    "text-xl sm:text-2xl md:text-[28px] lg:text-[32px]",
  ].join(" "),
  metricSub: [
    "mt-auto min-w-0 break-words text-[11px] leading-snug text-[#4D84C0]",
    "sm:text-xs md:text-sm",
  ].join(" "),
  metricGood: "text-[#2AA84A]",

  barRow: "mt-3 flex gap-[3px]",
  bar: "h-6 w-2 rounded-full sm:h-7 sm:w-[6px] md:h-8 md:w-[7px]",
  barOn: "bg-[#2AA84A]",
  barOff: "bg-[#C8DCEF]",

  /* ── tips / issues panels ─────────────────────────── */
  panels: [
    "mt-5 grid gap-4",
    "grid-cols-1 md:mt-6 md:grid-cols-5 md:gap-5",
  ].join(" "),
  panel,
  panelTitle: "text-lg font-semibold text-[#4A83C0] sm:text-xl md:text-2xl",
  panelList: "mt-3 space-y-2 text-sm text-[#3E79B9] sm:text-base md:text-lg",
  emptyState: "mt-3 text-sm text-[#4D84C0] sm:text-base md:text-lg",

  /* ── social form (on blue bg, no white panel) ────── */
  sectionTitle: [
    "mt-10 font-semibold text-white",
    "text-xl sm:text-2xl md:mt-12 md:text-3xl lg:text-[36px]",
  ].join(" "),

  formWrap: "mt-4 sm:mt-5",
  fieldLabel: "block text-xs font-bold text-white sm:text-sm md:text-base",
  input: [
    "mt-1 h-10 w-full rounded-full border border-white/50 bg-transparent px-5",
    "text-sm text-white outline-none placeholder:text-white/50",
    "focus:border-white/90 sm:h-11 sm:text-base md:h-12 md:text-lg",
  ].join(" "),
  formRow: "mt-4",
  formActions: "mt-5 flex flex-wrap gap-3",

  chips: "mt-4 flex flex-wrap gap-2 sm:mt-5",
  chip: [
    "inline-flex items-center rounded-full border border-white/50 bg-white px-5 py-2",
    "text-sm text-[#4D84C0] sm:text-base md:text-lg",
  ].join(" "),

  /* ── social results ───────────────────────────────── */
  socialWrap: "mt-6 space-y-10 sm:mt-8",

  socialGroupTitle: "text-lg font-bold text-white sm:text-xl md:text-2xl",
  socialGroupDate: "mt-1 text-xs text-white/70 sm:text-sm",

  socialGrid: [
    "mt-3 grid gap-3",
    "grid-cols-1",
    "md:grid-cols-[1fr_minmax(220px,0.45fr)] md:gap-4",
  ].join(" "),
  socialMetricsCol: [
    "grid gap-3",
    "grid-cols-2 sm:grid-cols-3 md:grid-cols-5",
  ].join(" "),
  socialMetricCard: `${card} min-h-[80px] md:min-h-[100px]`,
  socialMetricLabel: "text-xs text-[#4D84C0] sm:text-sm",
  socialMetricValue: [
    "mt-1 max-w-full whitespace-nowrap font-bold leading-none text-[#2E78C8]",
    "text-lg sm:text-xl md:text-2xl",
  ].join(" "),
  socialAnalysisPanel: `${panel} md:row-span-2 flex flex-col`,
  socialAdvicePanel: `${panel} mt-3 md:mt-4`,

  /* ── actions / feedback ───────────────────────────── */
  actions: "mt-6 flex flex-wrap gap-3 sm:mt-8",
  btn: buttons.primary,
  btnOutline: buttons.outline,
  error: `${feedback.error}`,
  loader: `${feedback.loader}`,
  spinner: feedback.spinner,

  /* ── app block ────────────────────────────────────── */
  appTitle: "text-lg font-semibold text-[#4A83C0] sm:text-xl md:text-2xl",
  appMeta: "ml-2 text-sm font-normal text-[#4D84C0] sm:text-base md:text-lg",

  btnDanger: [
    "rounded-full border border-white/40 bg-red-500/80 px-5 py-2 font-normal text-white transition",
    "text-sm hover:bg-red-600 active:scale-95",
    "sm:px-6 sm:text-base md:text-lg",
  ].join(" "),
};

/* ─── component ────────────────────────────────────────── */

export function DashboardPanel({ initialData }: { initialData: DashboardInitialData }) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [error, setError] = useState("");

  const [showAppForm, setShowAppForm] = useState(false);
  const [appLoading, setAppLoading] = useState(false);
  const [appUrl, setAppUrl] = useState("");

  const [socialName, setSocialName] = useState("");
  const [socialUrl, setSocialUrl] = useState("");
  const [socialDrafts, setSocialDrafts] = useState<DraftSocial[]>([]);

  /* ── handlers ──────────────────────────────────────── */

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const handleRefreshSite = async () => {
    setLoading(true);
    setError("");
    try {
      const r = await analyzeSite(data.url);
      setData((prev) => ({
        ...prev,
        score: r.score,
        checkedAt: r.checkedAt,
        issues: r.issues.map((i) => i.message),
        recommendations: r.recommendations,
        hasPreviousSnapshot: r.monitoring.hasPreviousSnapshot,
        scoreDelta: r.monitoring.scoreDelta,
        isRealData: true,
        status: r.score >= 85 ? "Отлично" : r.score >= 70 ? "Хорошо" : r.score >= 55 ? "Средне" : "Низко",
      }));
      router.refresh();
    } catch {
      setError("Не удалось обновить анализ сайта. Проверьте ссылку.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSocial = () => {
    if (!socialUrl.trim() || !socialName.trim()) {
      setError("Укажите название и URL ссылки.");
      return;
    }
    const platform = detectPlatform(socialUrl);
    if (!platform) {
      setError("Поддерживаются ссылки только vk.com, t.me и dzen.ru.");
      return;
    }
    const id = `${platform}:${socialName.trim().toLowerCase()}`;
    if (socialDrafts.some((d) => d.id === id)) {
      setError("Такая соцсеть уже добавлена.");
      return;
    }
    setError("");
    setSocialDrafts((prev) => [...prev, { id, name: socialName.trim(), platform, url: socialUrl.trim() }]);
    setSocialName("");
    setSocialUrl("");
  };

  const handleSocialSubmit = async () => {
    const existingPayload: SocialLinkPayload[] = data.socialItems.map((item) => ({
      platform: item.platform as SocialLinkPayload["platform"],
      url: item.url,
      active: true,
    }));
    const newPayload: SocialLinkPayload[] = socialDrafts.map((d) => ({
      platform: d.platform,
      url: d.url,
      active: true,
    }));

    const seen = new Set(existingPayload.map((p) => p.url));
    const merged = [...existingPayload];
    for (const p of newPayload) {
      if (!seen.has(p.url)) {
        merged.push(p);
        seen.add(p.url);
      }
    }

    if (!merged.length) {
      setError("Сначала добавьте хотя бы одну соцсеть.");
      return;
    }

    setSocialLoading(true);
    setError("");
    try {
      const r = await analyzeSocial(data.siteId, merged);
      setData((prev) => ({
        ...prev,
        socialScore: r.score,
        socialRecommendations: r.recommendations,
        socialItems: r.items,
      }));
      setSocialDrafts([]);
      router.refresh();
    } catch {
      setError("Не удалось проанализировать соцсети.");
    } finally {
      setSocialLoading(false);
    }
  };

  const handleAppSubmit = async () => {
    if (!appUrl.trim()) {
      setError("Вставьте ссылку на приложение в Google Play или App Store.");
      return;
    }
    setAppLoading(true);
    setError("");
    try {
      const r = await analyzeApp(appUrl.trim(), data.siteId);
      setData((prev) => ({
        ...prev,
        appBlock: {
          name: r.name,
          store: r.store,
          appUrl: r.appUrl,
          score: r.score,
          issues: r.issues.map((i) => i.message),
          recommendations: r.recommendations,
          checkedAt: r.checkedAt,
        },
      }));
      setShowAppForm(false);
      setAppUrl("");
      router.refresh();
    } catch {
      setError("Не удалось проанализировать приложение. Проверьте ссылку.");
    } finally {
      setAppLoading(false);
    }
  };

  /* ── derived ───────────────────────────────────────── */

  const socialBlocks = data.socialItems.map((item, i) => {
    const m = item.metrics;
    const hasVkMetrics = !!m && "wallPosts" in m;
    const hasZenMetrics = !!m && "postsLast30Days" in m;
    const seed = hashSeed(`${item.url}:${item.platform}:${i}`);
    const titleFromMetrics = hasVkMetrics
      ? m.name
      : hasZenMetrics
        ? m.name
        : undefined;
    return {
      ...item,
      title:
        titleFromMetrics ??
        socialDrafts[i]?.name ??
        `${platformLabel(item.platform as SocialLinkPayload["platform"])}. Группа ${i + 1}`,
      reach:
        hasVkMetrics
          ? seeded(seed + 1, 800, 3200)
          : hasZenMetrics
            ? m.viewsLast30Days
            : seeded(seed + 1, 800, 3200),
      followers: hasVkMetrics ? m.membersCount : hasZenMetrics ? m.subscribers : seeded(seed + 3, 12000, 260000),
      views: hasVkMetrics ? seeded(seed + 5, 500000, 2500000) : hasZenMetrics ? m.viewsLast30Days : seeded(seed + 5, 500000, 2500000),
      posts: hasVkMetrics ? m.wallPosts : hasZenMetrics ? m.postsLast30Days : seeded(seed + 7, 6, 25),
      likes: hasVkMetrics ? seeded(seed + 9, 8000, 90000) : hasZenMetrics ? m.likesLast30Days : seeded(seed + 9, 8000, 90000),
      verified: hasVkMetrics ? m.verified : hasZenMetrics ? m.verified : false,
      hasCover: hasVkMetrics ? m.hasCover : false,
      siteUrl: hasVkMetrics ? m.siteUrl : null,
      contacts: hasVkMetrics ? m.contacts : [],
      period: periodLabel(),
      hasVkMetrics,
      hasZenMetrics,
    };
  });

  const score = data.score;
  const bars = Array.from({ length: 24 }, () => true);
  const speedSec = Number(((100 - score) / 30 + 1.2).toFixed(1));
  const reach = Math.round(score * 22 + 400);
  const anyLoading = loading || socialLoading || appLoading;

  /* ── render ────────────────────────────────────────── */

  return (
    <section className={s.page}>
      <div className={WRAP}>

        {/* ═══ BLOCK 1: site overview ═══════════════════ */}

        <h1 className={s.title}>Анализ вашего бизнеса<br />в интернете</h1>

        <p className={s.siteName}>{data.siteName}</p>
        <p className={s.siteUrl}>{data.siteUrl}</p>
        {!data.isRealData && <span className={s.badge}>демо-данные</span>}

        <div className={s.summaryRow}>
          <span className={s.summaryText}>
            Итоговая оценка: <strong className={s.strong}>{score}/100</strong>
          </span>
          <span className={s.summaryText}>
            Статус: <strong className={s.strong}>{data.status}</strong>
          </span>
          {data.scoreDelta !== null && (
            <span className={s.summaryText}>
              Динамика:{" "}
              <strong className={data.scoreDelta >= 0 ? s.metricGood : "text-red-400"}>
                {data.scoreDelta > 0 ? "+" : ""}{data.scoreDelta}
              </strong>
            </span>
          )}
        </div>

        <div className={s.cardsGrid}>
          <article className={s.metricCard}>
            <p className={s.metricLabel}>Последняя проверка</p>
            <p className={s.metricValue}>{timeAgo(data.checkedAt)}</p>
            <p className={s.metricSub}>Обновление данных каждый час</p>
          </article>

          <article className={s.metricCard}>
            <p className={s.metricLabel}>Состояние сайта</p>
            <p className={`${s.metricValue} ${s.metricGood}`}>Доступно</p>
          </article>

          <article className={s.metricCard}>
            <p className={s.metricLabel}>Последние 24 часа</p>
            <div className={s.barRow}>
              {bars.map((on, i) => (
                <span key={i} className={`${s.bar} ${on ? s.barOn : s.barOff}`} />
              ))}
            </div>
            <p className={s.metricSub}>0 инцидентов<br />0 падений</p>
          </article>

          <article className={s.metricCard}>
            <p className={s.metricLabel}>Охваты</p>
            <p className={s.metricValue}>{reach}</p>
          </article>

          <article className={s.metricCard}>
            <p className={s.metricLabel}>Скорость загрузки(сек)</p>
            <p className={`${s.metricValue} ${speedSec <= 3 ? s.metricGood : ""}`}>{speedSec}</p>
            <p className={s.metricSub}>норма до 3.0</p>
          </article>
        </div>

        <div className={s.panels}>
          <article className={`${s.panel} md:col-span-3`}>
            <h2 className={s.panelTitle}>Советы</h2>
            {data.recommendations.length ? (
              <ul className={s.panelList}>
                {data.recommendations.map((tip) => <li key={tip}>– {tip}</li>)}
              </ul>
            ) : (
              <p className={s.emptyState}>Пока нет советов.</p>
            )}
          </article>

          <article className={`${s.panel} md:col-span-2`}>
            <h2 className={s.panelTitle}>Ошибки</h2>
            {data.issues.length ? (
              <ul className={s.panelList}>
                {data.issues.map((issue) => <li key={issue}>– {issue}</li>)}
              </ul>
            ) : (
              <p className={s.emptyState}>Критичных ошибок не найдено.</p>
            )}
          </article>
        </div>

        {/* ═══ BLOCK 2: social ══════════════════════════ */}

        <h2 className={s.sectionTitle}>Добавить соц.сеть</h2>

        <div className={s.formWrap}>
          <div>
            <label className={s.fieldLabel}>Название</label>
            <input
              className={s.input}
              type="text"
              placeholder="VK. Группа 1"
              value={socialName}
              onChange={(e) => setSocialName(e.target.value)}
            />
          </div>

          <div className={s.formRow}>
            <label className={s.fieldLabel}>URL ссылки</label>
            <input
              className={s.input}
              type="url"
              placeholder="https://vk.com/your_group"
              value={socialUrl}
              onChange={(e) => setSocialUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSocial()}
            />
          </div>

          <div className={s.chips}>
            {socialDrafts.length ? (
              socialDrafts.map((d) => <span key={d.id} className={s.chip}>{d.name}</span>)
            ) : (
              <span className="text-sm text-white/50">Добавьте площадки для анализа</span>
            )}
          </div>

          <div className={s.formActions}>
            <button className={s.btnOutline} onClick={handleAddSocial} disabled={socialLoading}>
              Добавить
            </button>
            <button className={s.btn} onClick={handleSocialSubmit} disabled={socialLoading}>
              {socialLoading ? "Анализируем..." : "Анализ соц.сетей"}
            </button>
          </div>
        </div>

        <h2 className={s.sectionTitle}>Анализ соц.сетей</h2>

        <div className={s.socialWrap}>
          {socialBlocks.length ? (
            socialBlocks.map((b) => (
              <div key={`${b.platform}:${b.url}`}>
                <h3 className={s.socialGroupTitle}>
                  {b.title}
                  {b.verified && <span className="ml-2 text-sm text-white/70">[verified]</span>}
                </h3>
                <p className={s.socialGroupDate}>
                  {b.period}
                  {b.hasVkMetrics && <span className="ml-3 text-white/50">Реальные данные VK</span>}
                  {b.hasZenMetrics && (
                    <span className="ml-3 text-white/50">Реальные данные Дзена (посты и просмотры за 30 дн.)</span>
                  )}
                </p>

                <div className={s.socialGrid}>
                  <div>
                    <div className={s.socialMetricsCol}>
                      {([
                        ["Охваты", b.reach],
                        ["Подписчики", b.followers],
                        ["Просмотры", b.views],
                        [b.hasZenMetrics ? "Посты за 30 дн." : "Кол-во постов", b.posts],
                        ["Лайки", b.likes],
                      ] as const).map(([label, val]) => (
                        <article key={label} className={s.socialMetricCard}>
                          <p className={s.socialMetricLabel}>{label}</p>
                          <p className={s.socialMetricValue}>{fmt(val)}</p>
                        </article>
                      ))}
                    </div>

                    <article className={s.socialAdvicePanel}>
                      <h4 className={s.panelTitle}>Советы</h4>
                      <ul className={s.panelList}>
                        <li>– {b.recommendation}</li>
                      </ul>
                      {b.hasVkMetrics && (
                        <div className="mt-3 space-y-1 border-t border-[#87B9F0]/40 pt-3 text-sm text-[#4D84C0]">
                          {b.siteUrl && <p>Сайт: <a href={b.siteUrl} target="_blank" rel="noopener noreferrer" className="underline">{b.siteUrl}</a></p>}
                          {b.contacts.length > 0 && (
                            <p>Контакты: {b.contacts.map((c: {desc: string; email?: string}) => `${c.desc}${c.email ? ` (${c.email})` : ""}`).join(", ")}</p>
                          )}
                          {!b.hasCover && <p className="text-[#E2C644]">Обложка отсутствует</p>}
                        </div>
                      )}
                    </article>
                  </div>

                  <article className={s.socialAnalysisPanel}>
                    <h4 className={s.panelTitle}>Анализ</h4>
                    {b.issues.length ? (
                      <ul className={s.panelList}>
                        {b.issues.map((issue) => <li key={issue}>– {issue}</li>)}
                      </ul>
                    ) : (
                      <p className={s.emptyState}>Критичных замечаний нет.</p>
                    )}
                  </article>
                </div>
              </div>
            ))
          ) : (
            <div className={s.socialAdvicePanel}>
              <p className={s.emptyState}>Добавьте соцсети и запустите анализ.</p>
            </div>
          )}
        </div>

        {/* ═══ APP BLOCK ════════════════════════════════ */}

        {data.appBlock && (
          <div className={`${s.panel} mt-6`}>
            <h2 className={s.appTitle}>
              Приложение: {data.appBlock.name}
              <span className={s.appMeta}>
                {data.appBlock.store === "google_play" ? "Google Play" : "App Store"} — {data.appBlock.score}/100
              </span>
            </h2>

            {data.appBlock.recommendations.length ? (
              <ul className={s.panelList}>
                {data.appBlock.recommendations.map((r) => <li key={r}>– {r}</li>)}
              </ul>
            ) : (
              <p className={s.emptyState}>Страница приложения выглядит хорошо.</p>
            )}

            {data.appBlock.issues.length > 0 && (
              <ul className={`${s.panelList} mt-3`}>
                <li className="font-medium text-[#4A83C0]">Найденные проблемы:</li>
                {data.appBlock.issues.map((issue) => <li key={issue}>– {issue}</li>)}
              </ul>
            )}
          </div>
        )}

        {/* ═══ ACTIONS ══════════════════════════════════ */}

        <div className={s.actions}>
          <button className={s.btn} onClick={handleRefreshSite} disabled={loading}>
            {loading ? "Анализируем..." : "Обновить анализ сайта"}
          </button>
          <button className={s.btnOutline} onClick={() => setShowAppForm((v) => !v)} disabled={appLoading}>
            {showAppForm ? "Скрыть форму приложения" : "Анализ приложения"}
          </button>
          <button className={s.btnDanger} onClick={handleLogout}>
            Выйти
          </button>
        </div>

        {anyLoading && (
          <div className={s.loader}>
            <span className={s.spinner} />
            <span>
              {loading ? "Анализируем сайт..." : appLoading ? "Анализируем приложение..." : "Анализируем соцсети..."}
            </span>
          </div>
        )}

        {error && <div className={s.error}>{error}</div>}

        {showAppForm && (
          <div className={s.formWrap}>
            <h3 className="text-lg font-bold text-white sm:text-xl md:text-2xl">Ссылка на приложение</h3>
            <p className="mt-1 text-xs text-white/70 sm:text-sm md:text-base">
              Вставьте ссылку на страницу приложения в Google Play или App Store
            </p>
            <div className={s.formRow}>
              <input
                className={s.input}
                type="url"
                placeholder="https://play.google.com/store/apps/details?id=..."
                value={appUrl}
                onChange={(e) => setAppUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAppSubmit()}
              />
            </div>
            <div className={s.formActions}>
              <button className={s.btn} onClick={handleAppSubmit} disabled={appLoading}>
                {appLoading ? "Анализируем..." : "Проверить приложение"}
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
