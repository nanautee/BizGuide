"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassInput } from "@/shared/ui/GlassInput";
import { analyzeSite } from "@/shared/api/api";

const URL_STORAGE_KEY = "bizguide-known-urls";

const styles = {
  container: [
    "z-96 relative w-full overflow-hidden",
    "min-h-[60vh] sm:min-h-[75vh] md:min-h-screen",
  ].join(" "),

  topBlur: [
    "pointer-events-none absolute left-1/2 top-0 z-[1]",
    "h-[300px] w-[600px] -translate-x-1/2 -translate-y-[60%] opacity-90",
    "sm:h-[400px] sm:w-[750px] md:h-[500px] md:w-[900px]",
    "lg:h-[600px] lg:w-[1100px] xl:h-[700px] xl:w-[1400px]",
  ].join(" "),

  auraWrap: [
    "pointer-events-none absolute inset-0 z-0",
    "flex items-center justify-center",
  ].join(" "),
  aura: [
    "object-contain object-center opacity-90 mix-blend-screen",
    "h-[120%] w-[120%]",
    "sm:h-[130%] sm:w-[130%]",
    "lg:h-[140%] lg:w-[140%]",
    "xl:h-[160%] xl:w-[160%]",
  ].join(" "),

  content: [
    "relative z-10 mx-auto flex w-full",
    "flex-col items-center justify-start px-4",
    "min-h-[60vh] pt-20",
    "sm:min-h-[75vh] sm:px-6 sm:pt-28",
    "md:min-h-screen md:px-10 md:pt-36",
    "lg:px-14 lg:pt-40",
  ].join(" "),

  title: [
    "mx-auto text-center font-bold leading-[0.92] text-white",
    "text-[32px] sm:text-[46px] md:text-[64px] lg:text-[80px] xl:text-[96px] 2xl:text-[112px]",
  ].join(" "),

  inputWrapper: "mt-6 flex w-full justify-center sm:mt-8 md:mt-10 lg:mt-12",
  inputGroup: "relative w-full max-w-[760px] xl:max-w-[900px]",

  submitBtn: [
    "absolute right-2 top-1/2 flex -translate-y-1/2 items-center justify-center",
    "h-10 w-10 transition-transform active:scale-95 disabled:opacity-50",
    "sm:h-11 sm:w-11 md:right-3 md:h-12 md:w-12",
  ].join(" "),
  submitIcon: "h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12",

  ctaWrap: "relative mt-4 flex w-full flex-col items-center md:mt-5 lg:mt-6",
  ctaBtn: [
    "relative z-10 rounded-full border border-white/20 bg-[#4C97F6]",
    "px-6 py-2 text-sm font-normal leading-none text-white",
    "transition hover:opacity-95 active:scale-95",
    "sm:px-8 sm:text-base md:px-10 md:text-xl lg:text-2xl lg:px-12 lg:py-3",
  ].join(" "),

  error: "mt-3 text-center text-sm text-red-100",

  overlay: "fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 backdrop-blur-[2px]",

  authCard: [
    "relative min-w-[1200px] min-h-[600px] max-w-[800px] overflow-hidden rounded-[24px] border border-white/40",
    "bg-gradient-to-r from-[#8AB7E7] to-[#6AA8F2] p-5 text-white shadow-2xl",
    "sm:max-w-2xl sm:rounded-[32px] sm:p-6 md:max-w-4xl md:p-10",
  ].join(" "),
  authClose: [
    "absolute right-3 top-3 flex h-10 w-15 cursor-pointer items-center justify-center",
    "rounded-full border border-white/40 bg-white/15 text-2xl leading-none text-white shadow-md",
    "backdrop-blur-md transition hover:bg-white/25 hover:text-white active:scale-95",
    "sm:right-4 sm:top-4 sm:h-12 sm:w-12 sm:text-4xl md:h-14 md:w-14 md:text-6xl",
  ].join(" "),
  authTitle: "z-80 relative text-6xl font-bold sm:text-6xl md:text-7xl",
  authText: [
    "z-80 relative pt-45",
    " mt-6 max-w-xl text-xl font-bold leading-tight",
    "sm:mt-8 sm:text-3xl md:mt-12 md:text-5xl",
  ].join(" "),
  authActions: "mt-5 flex flex-wrap gap-3 sm:mt-6 md:mt-8",
  authBtn: [
    "z-51 rounded-[45px] border border-white/30 bg-white/20 px-6 py-3",
    "text-lg font-normal transition hover:bg-white/30",
    "sm:h-[70px] sm:px-8 sm:text-2xl md:px-12 md:text-3xl lg:text-4xl",
  ].join(" "),
  mascot: [
    "z-50 pointer-events-none absolute bottom-0 right-2 w-[140px] opacity-95",
    "sm:right-4 sm:w-[320px] md:right-[-20px] md:w-[840px]",
  ].join(" "),

};

export const HeroSection = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFirstVisitModalOpen, setIsFirstVisitModalOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState("");
  const router = useRouter();

  const normalizeForStorage = (v: string) => v.trim().toLowerCase();

  const getKnownUrls = (): Set<string> => {
    if (typeof window === "undefined") return new Set();
    const raw = window.localStorage.getItem(URL_STORAGE_KEY);
    if (!raw) return new Set();
    try {
      return new Set(JSON.parse(raw) as string[]);
    } catch {
      return new Set();
    }
  };

  const rememberUrl = (value: string) => {
    if (typeof window === "undefined") return;
    const known = getKnownUrls();
    known.add(normalizeForStorage(value));
    window.localStorage.setItem(URL_STORAGE_KEY, JSON.stringify([...known]));
  };

  const runAnalyzeAndRedirect = async (targetUrl: string) => {
    const data = await analyzeSite(targetUrl.trim());
    rememberUrl(targetUrl);
    router.push(`/dashboard/${data.siteId}?url=${encodeURIComponent(data.normalizedUrl)}`);
  };

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setError("");

    if (!getKnownUrls().has(normalizeForStorage(url))) {
      /* Не вызываем rememberUrl здесь: иначе после первого показа окна URL уже «известен»,
         и попап больше не появится даже если пользователь закрыл модалку без входа. */
      setPendingUrl(url.trim());
      setIsFirstVisitModalOpen(true);
      return;
    }

    setLoading(true);
    try {
      await runAnalyzeAndRedirect(url);
    } catch {
      setError("Не удалось проанализировать сайт. Проверьте ссылку и попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <img src="/blurelips.svg" alt="" aria-hidden className={styles.topBlur} />

      <div className={styles.auraWrap} aria-hidden>
        <img src="/aura.svg" alt="" className={styles.aura} />
      </div>

      <div className={styles.content}>
        <h1 className={styles.title}>
          <span className="block">Анализ вашего бизнеса</span>
          <span className="block">в интернете</span>
        </h1>

        <div id="audit" className={styles.inputWrapper}>
          <div className={styles.inputGroup}>
            <GlassInput
              type="text"
              placeholder="ссылка на сайт"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              disabled={loading}
            />
            <button className={styles.submitBtn} onClick={handleAnalyze} disabled={loading}>
              <img src="/arrow.svg" alt="Анализировать" className={styles.submitIcon} />
            </button>
          </div>
        </div>

        <div className={styles.ctaWrap}>
          <a href="/first-step" className={styles.ctaBtn}>
            у меня нет сайта
          </a>
        </div>

        {error && <p className={styles.error}>{error}</p>}
      </div>

      {isFirstVisitModalOpen && (
        <div className={styles.overlay}>
          <div className={styles.authCard}>
            <button
              className={styles.authClose}
              onClick={() => setIsFirstVisitModalOpen(false)}
              aria-label="Закрыть"
            >
              ×
            </button>
            <h2 className={styles.authTitle}>Первый раз на сайте?</h2>
            <p className={styles.authText}>
              Чтобы начать анализ
              <br />
              нужно войти в аккаунт
            </p>
            <div className={styles.authActions}>
              <button
                className={styles.authBtn}
                onClick={() => {
                  const target = pendingUrl || url;
                  rememberUrl(target);
                  router.push(`/login?mode=register&url=${encodeURIComponent(target)}`);
                }}
              >
                Зарегистрироваться
              </button>
              <button
                className={styles.authBtn}
                onClick={() => {
                  const target = pendingUrl || url;
                  rememberUrl(target);
                  router.push(`/login?mode=login&url=${encodeURIComponent(target)}`);
                }}
              >
                Войти
              </button>
            </div>
            <img src="/elipsboy.svg" alt="" aria-hidden className={styles.mascot} />
          </div>
        </div>
      )}
    </div>
  );
};
