"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { analyzeSite } from "@/shared/api/api";

const PENDING_URL_KEY = "bizguide_pending_url";

const styles = {
  page: [
    "relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden",
    "px-4 pt-20 pb-6 sm:pt-24 sm:pb-8 md:pt-28",
  ].join(" "),

  auraWrap: "pointer-events-none absolute inset-0 z-0",
  aura: "h-full w-full object-cover object-center opacity-90 mix-blend-screen",

  topBlobLayer: "pointer-events-none absolute inset-0 z-[1] overflow-hidden",
  topBlob: [
    "absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[48%]",
    "h-[min(130vw,920px)] w-[min(130vw,920px)] rounded-full bg-[#4999FF]",
    "blur-[90px] opacity-[0.72] sm:blur-[120px] md:blur-[160px] lg:blur-[190px]",
  ].join(" "),

  card: [
    "relative z-10 w-full max-w-[480px] rounded-[24px] border border-white/45",
    "bg-[#6AA8EE]/45 px-5 py-6 text-white backdrop-blur-md",
    "sm:max-w-[540px] sm:rounded-[32px] sm:px-6 sm:py-7 md:max-w-[600px] md:px-8 md:py-8",
  ].join(" "),

  title: "text-center text-3xl font-bold leading-none sm:text-5xl md:text-6xl lg:text-7xl",
  form: "mt-6 sm:mt-8",
  row: "mt-4 sm:mt-5",

  field: [
    "w-full border-b-[2px] border-white/85 bg-transparent pb-2 text-lg leading-none text-white",
    "outline-none placeholder:text-white/80",
    "sm:text-xl md:text-2xl lg:text-3xl",
  ].join(" "),

  forgot: "mt-1 text-right text-sm text-white/85 sm:text-base md:text-xl lg:text-2xl",

  submit: [
    "mt-6 flex h-[48px] w-full items-center justify-center rounded-full",
    "bg-[#4C97F6] text-xl font-normal text-white transition hover:opacity-90",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "sm:mt-7 sm:h-[52px] sm:text-2xl md:h-[54px] md:text-3xl lg:h-[58px] lg:text-4xl",
  ].join(" "),

  error: "mt-3 rounded-lg bg-red-500/20 px-3 py-2 text-center text-sm text-white sm:text-base",

  footer: "mt-4 text-center text-sm text-white/75 sm:mt-5 sm:text-base md:text-xl lg:text-2xl",
  footerLink: "font-medium text-white/90 hover:text-white",
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") ?? "login";
  const urlParam = searchParams.get("url") ?? "";
  const isRegister = mode === "register";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (urlParam) localStorage.setItem(PENDING_URL_KEY, urlParam);
  }, [urlParam]);

  const switchHref = `/login?mode=${isRegister ? "login" : "register"}${
    urlParam ? `&url=${encodeURIComponent(urlParam)}` : ""
  }`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Заполните все поля.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const body: Record<string, string> = { email, password };

      const storedUrl =
        typeof window !== "undefined" ? localStorage.getItem(PENDING_URL_KEY) : null;
      const siteUrlFromFlow = (urlParam || storedUrl || "").trim();
      if (siteUrlFromFlow) {
        body.siteUrl = siteUrlFromFlow;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Ошибка. Попробуйте ещё раз.");
        return;
      }

      const finalUrl = data.siteUrl || siteUrlFromFlow;
      const siteId = data.siteId;

      localStorage.removeItem(PENDING_URL_KEY);

      if (siteId) {
        if (finalUrl) {
          try {
            await analyzeSite(finalUrl);
          } catch { /* analysis will use mock if fails */ }
        }
        router.push(`/dashboard/${siteId}${finalUrl ? `?url=${encodeURIComponent(finalUrl)}` : ""}`);
        return;
      }

      if (finalUrl) {
        try {
          const result = await analyzeSite(finalUrl);
          router.push(`/dashboard/${result.siteId}?url=${encodeURIComponent(result.normalizedUrl)}`);
          return;
        } catch { /* fall through */ }
      }

      router.push("/");
    } catch {
      setError("Ошибка сети. Проверьте соединение.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.auraWrap} aria-hidden>
        <img src="/aura.svg" alt="" className={styles.aura} />
      </div>

      <div className={styles.topBlobLayer} aria-hidden>
        <div className={styles.topBlob} />
      </div>

      <section className={styles.card}>
        <h1 className={styles.title}>{isRegister ? "Регистрация" : "Вход"}</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <input
              className={styles.field}
              type="email"
              placeholder="почта"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className={styles.row}>
            <input
              className={styles.field}
              type="password"
              placeholder="пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isRegister ? "new-password" : "current-password"}
            />
            {!isRegister && <p className={styles.forgot}>забыли пароль?</p>}
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={styles.submit} disabled={loading}>
            {loading
              ? "Подождите..."
              : isRegister
                ? "Зарегистрироваться"
                : "Войти"}
          </button>
        </form>

        <p className={styles.footer}>
          {isRegister ? "Уже зарегистрированы? " : "Еще не зарегистрированы? "}
          <Link href={switchHref} className={styles.footerLink}>
            {isRegister ? "Войти в аккаунт" : "Создать аккаунт"}
          </Link>
        </p>
      </section>
    </main>
  );
}
