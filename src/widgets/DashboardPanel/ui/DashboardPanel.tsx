"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { analyzeSite, analyzeSocial, analyzeApp } from "@/shared/api/api";
import type { DashboardInitialData } from "../types";
import type { SocialLinkPayload } from "@/shared/api/api";
import {
  layout,
  buttons,
  cards as sharedCards,
  backgrounds,
  feedback,
} from "@/shared/ui/styles";

const PLATFORMS = ["vk", "telegram", "instagram", "youtube", "whatsapp"] as const;

const Z = layout.zContent;

const s = {
  page: "relative w-full overflow-hidden",
  auraWrap: `${backgrounds.auraWrap} h-[110vh] w-[2300px] md:w-[2800px]`,
  aura: backgrounds.auraImg,
  title: `${Z} w-full text-center text-[54px] font-bold leading-[0.9] text-white md:text-[90px]`,
  siteName: `${Z} mt-10 text-5xl font-bold leading-none text-white md:text-[72px]`,
  siteUrl: `${Z} mt-1 text-2xl text-white/80 md:text-[38px]`,
  badge: `${Z} mt-1 inline-block rounded-full bg-white/20 px-3 py-1 text-base text-white/80`,
  summaryRow: `${Z} mt-6 flex flex-wrap items-center gap-x-10 gap-y-2 text-[28px] leading-none text-white md:text-[58px]`,
  strong: "font-bold",
  status: "font-bold text-white",
  cardsGrid: `${Z} mt-7 grid grid-cols-1 gap-3 md:grid-cols-16 md:gap-4`,
  metricCard: sharedCards.metric,
  metricLabel: "text-xl text-[#4D84C0] md:text-[30px] md:leading-none",
  metricValue: "mt-1 text-3xl font-bold leading-none text-[#2E78C8] md:text-[44px]",
  metricSub: "mt-1 text-xl leading-tight text-[#4D84C0] md:text-[26px]",
  metricGood: "text-[#2AA84A]",
  panels: `${Z} mt-4 grid grid-cols-1 gap-4 md:grid-cols-16`,
  panel: sharedCards.panel,
  panelTitle: "text-4xl leading-none text-[#4A83C0] md:text-[44px]",
  panelList: "mt-2 space-y-1 text-xl text-[#3E79B9] md:text-[24px]",
  emptyState: "mt-2 text-xl text-[#4D84C0] md:text-[24px]",
  barRow: "mt-2 flex gap-[3px]",
  bar: "h-8 w-2 rounded-full md:h-10 md:w-3",
  barOn: "bg-[#2AA84A]",
  barOff: "bg-[#C8DCEF]",
  actions: `${Z} mt-6 flex flex-wrap gap-3`,
  btn: buttons.primary,
  btnOutline: buttons.outline,
  error: `${Z} ${feedback.error}`,
  socialForm: `${Z} mt-6 ${sharedCards.panel}`,
  socialTitle: "text-2xl font-bold text-[#2C74BD] md:text-[36px]",
  socialRow: "mt-3 flex flex-wrap items-center gap-3",
  socialInput:
    "h-10 flex-1 min-w-[200px] rounded-xl border border-[#87B9F0]/50 bg-white px-3 text-base text-[#2C74BD] outline-none placeholder:text-[#4D84C0]/60 focus:border-[#4C97F6]",
  socialLabel: "w-24 text-base font-medium capitalize text-[#4D84C0]",
  socialToggle: "h-5 w-5 accent-[#4C97F6]",
  loader: `${Z} ${feedback.loader}`,
  spinner: feedback.spinner,
};

function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec} секунд назад`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} мин. назад`;
  return `${Math.floor(min / 60)} ч. назад`;
}

export function DashboardPanel({ initialData }: { initialData: DashboardInitialData }) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSocialForm, setShowSocialForm] = useState(false);
  const [showAppForm, setShowAppForm] = useState(false);
  const [appLoading, setAppLoading] = useState(false);
  const [appUrl, setAppUrl] = useState("");

  const [socialLinks, setSocialLinks] = useState<SocialLinkPayload[]>(
    PLATFORMS.map((p) => ({ platform: p, url: "", active: true })),
  );

  const handleRefreshSite = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await analyzeSite(data.url);
      setData((prev) => ({
        ...prev,
        score: result.score,
        checkedAt: result.checkedAt,
        issues: result.issues.map((i) => i.message),
        recommendations: result.recommendations,
        hasPreviousSnapshot: result.monitoring.hasPreviousSnapshot,
        scoreDelta: result.monitoring.scoreDelta,
        isRealData: true,
        status:
          result.score >= 85 ? "Отлично" : result.score >= 70 ? "Хорошо" : result.score >= 55 ? "Средне" : "Низко",
      }));
      router.refresh();
    } catch {
      setError("Не удалось обновить анализ сайта. Проверьте ссылку.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSubmit = async () => {
    const filled = socialLinks.filter((l) => l.url.trim().length > 0);
    if (filled.length === 0) {
      setError("Укажите хотя бы одну ссылку на соцсеть.");
      return;
    }
    setSocialLoading(true);
    setError("");
    try {
      const result = await analyzeSocial(data.siteId, filled);
      setData((prev) => ({
        ...prev,
        socialScore: result.score,
        socialRecommendations: result.recommendations,
      }));
      setShowSocialForm(false);
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
      const result = await analyzeApp(appUrl.trim(), data.siteId);
      setData((prev) => ({
        ...prev,
        appBlock: {
          name: result.name,
          store: result.store,
          appUrl: result.appUrl,
          score: result.score,
          issues: result.issues.map((i) => i.message),
          recommendations: result.recommendations,
          checkedAt: result.checkedAt,
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

  const updateSocialLink = (index: number, field: "url" | "active", value: string | boolean) => {
    setSocialLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, [field]: value } : link)),
    );
  };

  const seed = data.score;
  const barsOn = Math.max(14, Math.min(24, Math.round((seed / 100) * 24)));
  const bars = Array.from({ length: 24 }, (_, i) => i < barsOn);
  const speedSec = Number((((100 - seed) / 30 + 1.2).toFixed(1)));
  const reach = Math.round(seed * 22 + 400);

  return (
    <section className={s.page}>
      <div className={s.auraWrap} aria-hidden>
        <img src="/aura.svg" alt="" className={s.aura} />
      </div>

      <h1 className={s.title}>
        Анализ вашего бизнеса
        <br />
        в интернете
      </h1>

      <p className={s.siteName}>{data.siteName}</p>
      <p className={s.siteUrl}>{data.siteUrl}</p>
      {!data.isRealData && <span className={s.badge}>демо-данные</span>}

      <div className={s.summaryRow}>
        <span>
          Итоговая оценка: <strong className={s.strong}>{data.score}/100</strong>
        </span>
        <span>
          Статус: <strong className={s.status}>{data.status}</strong>
        </span>
        {data.scoreDelta !== null && (
          <span>
            Динамика: <strong className={data.scoreDelta >= 0 ? s.metricGood : "text-red-400"}>
              {data.scoreDelta > 0 ? "+" : ""}{data.scoreDelta}
            </strong>
          </span>
        )}
      </div>

      <div className={s.cardsGrid}>
        <article className={`${s.metricCard} md:col-span-4`}>
          <p className={s.metricLabel}>Последняя проверка</p>
          <p className={s.metricValue}>{timeAgo(data.checkedAt)}</p>
          <p className={s.metricSub}>Обновление данных каждые 5 минут</p>
        </article>

        <article className={`${s.metricCard} md:col-span-3`}>
          <p className={s.metricLabel}>Состояние сайта</p>
          <p className={`${s.metricValue} ${s.metricGood}`}>Доступно</p>
        </article>

        <article className={`${s.metricCard} md:col-span-4`}>
          <p className={s.metricLabel}>Последние 24 часа</p>
          <div className={s.barRow}>
            {bars.map((on, index) => (
              <span key={index} className={`${s.bar} ${on ? s.barOn : s.barOff}`} />
            ))}
          </div>
          <p className={s.metricSub}>0 инцидентов<br />0 падений</p>
        </article>

        <article className={`${s.metricCard} md:col-span-2`}>
          <p className={s.metricLabel}>Охваты</p>
          <p className={s.metricValue}>{reach}</p>
        </article>

        <article className={`${s.metricCard} md:col-span-3`}>
          <p className={s.metricLabel}>Скорость загрузки(сек)</p>
          <p className={`${s.metricValue} ${speedSec <= 3 ? s.metricGood : ""}`}>{speedSec}</p>
          <p className={s.metricSub}>норма до 3</p>
        </article>
      </div>

      <div className={s.panels}>
        <article className={`${s.panel} md:col-span-10`}>
          <h2 className={s.panelTitle}>Советы</h2>
          {data.recommendations.length ? (
            <ul className={s.panelList}>
              {data.recommendations.map((tip) => (
                <li key={tip}>- {tip}</li>
              ))}
            </ul>
          ) : (
            <p className={s.emptyState}>Пока нет советов.</p>
          )}
        </article>

        <article className={`${s.panel} md:col-span-6`}>
          <h2 className={s.panelTitle}>Ошибки</h2>
          {data.issues.length ? (
            <ul className={s.panelList}>
              {data.issues.map((issue) => (
                <li key={issue}>- {issue}</li>
              ))}
            </ul>
          ) : (
            <p className={s.emptyState}>Критичных ошибок не найдено.</p>
          )}
        </article>
      </div>

      {data.socialScore !== null && (
        <div className={`${s.panel} relative z-10 mt-4`}>
          <h2 className={s.panelTitle}>Соцсети: {data.socialScore}/100</h2>
          {data.socialRecommendations.length ? (
            <ul className={s.panelList}>
              {data.socialRecommendations.map((r) => (
                <li key={r}>- {r}</li>
              ))}
            </ul>
          ) : (
            <p className={s.emptyState}>Площадки выглядят хорошо.</p>
          )}
        </div>
      )}

      {data.appBlock && (
        <div className={`${s.panel} relative z-10 mt-4`}>
          <h2 className={s.panelTitle}>
            Приложение: {data.appBlock.name}
            <span className="ml-3 text-2xl font-normal text-[#4D84C0]">
              {data.appBlock.store === "google_play" ? "Google Play" : "App Store"} — {data.appBlock.score}/100
            </span>
          </h2>
          {data.appBlock.recommendations.length ? (
            <ul className={s.panelList}>
              {data.appBlock.recommendations.map((r) => (
                <li key={r}>- {r}</li>
              ))}
            </ul>
          ) : (
            <p className={s.emptyState}>Страница приложения выглядит хорошо.</p>
          )}
          {data.appBlock.issues.length > 0 && (
            <ul className={`${s.panelList} mt-3`}>
              <li className="font-medium text-[#4A83C0]">Найденные проблемы:</li>
              {data.appBlock.issues.map((issue) => (
                <li key={issue}>- {issue}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className={s.actions}>
        <button className={s.btn} onClick={handleRefreshSite} disabled={loading}>
          {loading ? "Анализируем..." : "Обновить анализ сайта"}
        </button>
        <button className={s.btnOutline} onClick={() => setShowSocialForm((v) => !v)} disabled={socialLoading}>
          {showSocialForm ? "Скрыть форму соцсетей" : "Анализ соцсетей"}
        </button>
        <button className={s.btnOutline} onClick={() => setShowAppForm((v) => !v)} disabled={appLoading}>
          {showAppForm ? "Скрыть форму приложения" : "Анализ приложения"}
        </button>
      </div>

      {(loading || socialLoading || appLoading) && (
        <div className={s.loader}>
          <span className={s.spinner} />
          <span>{loading ? "Анализируем сайт..." : appLoading ? "Анализируем приложение..." : "Анализируем соцсети..."}</span>
        </div>
      )}

      {error && <div className={s.error}>{error}</div>}

      {showAppForm && (
        <div className={s.socialForm}>
          <h3 className={s.socialTitle}>Ссылка на приложение</h3>
          <p className="mt-1 text-base text-[#4D84C0]">
            Вставьте ссылку на страницу приложения в Google Play или App Store
          </p>
          <div className={s.socialRow}>
            <input
              className={s.socialInput}
              type="url"
              placeholder="https://play.google.com/store/apps/details?id=..."
              value={appUrl}
              onChange={(e) => setAppUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAppSubmit()}
            />
          </div>
          <div className={s.actions}>
            <button className={s.btn} onClick={handleAppSubmit} disabled={appLoading}>
              {appLoading ? "Анализируем..." : "Проверить приложение"}
            </button>
          </div>
        </div>
      )}

      {showSocialForm && (
        <div className={s.socialForm}>
          <h3 className={s.socialTitle}>Ссылки на соцсети</h3>
          {socialLinks.map((link, index) => (
            <div key={link.platform} className={s.socialRow}>
              <span className={s.socialLabel}>{link.platform}</span>
              <input
                className={s.socialInput}
                type="url"
                placeholder={`https://${link.platform}.com/your_page`}
                value={link.url}
                onChange={(e) => updateSocialLink(index, "url", e.target.value)}
              />
              <input
                className={s.socialToggle}
                type="checkbox"
                checked={link.active}
                onChange={(e) => updateSocialLink(index, "active", e.target.checked)}
              />
            </div>
          ))}
          <div className={s.actions}>
            <button className={s.btn} onClick={handleSocialSubmit} disabled={socialLoading}>
              {socialLoading ? "Анализируем..." : "Отправить на анализ"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
