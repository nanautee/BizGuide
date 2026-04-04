"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const styles = {
  wrapper: "fixed inset-x-0 top-0 z-99 w-full px-4 pt-4 sm:px-6 sm:pt-6 md:px-10 lg:px-14",
  row: "flex w-full items-center justify-between",

  logo: [
    "z-99 shrink-0 text-xl font-bold leading-none text-white",
    "sm:text-3xl md:text-4xl lg:text-5xl",
  ].join(" "),

  pill: [
    "hidden rounded-full border border-white/35 bg-[#C7E5FF]/60 backdrop-blur-md",
    "sm:flex sm:h-[42px] sm:items-center sm:justify-center sm:px-6",
    "md:h-[46px] md:px-8",
  ].join(" "),
  nav: "z-99 flex gap-6 sm:gap-8 md:gap-12",
  link: "text-sm font-medium text-white transition hover:opacity-90 md:text-base lg:text-lg",

  rightGroup: "z-10 flex shrink-0 items-center gap-2",

  headerBtn: [
    "flex h-9 items-center gap-1.5 rounded-full",
    "border border-white/35 bg-white/20 px-3 backdrop-blur-sm",
    "transition hover:bg-white/30 active:scale-95",
    "sm:h-[42px] sm:gap-2 sm:px-4 md:h-[46px]",
  ].join(" "),
  headerBtnText: "text-sm font-normal text-white md:text-base",
  headerBtnIcon: "h-4 w-4 object-contain sm:h-5 sm:w-5",
};

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export const HeaderNav = () => {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [siteId, setSiteId] = useState<string | null>(null);

  useEffect(() => {
    const logged = getCookie("bizguide_logged_in") === "1";
    setLoggedIn(logged);
    if (logged) setSiteId(getCookie("bizguide_site_id"));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setLoggedIn(false);
    setSiteId(null);
    router.push("/");
    router.refresh();
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        <Link href="/" className={styles.logo}>
          BizGuide
        </Link>

        <header className={styles.pill}>
          <nav className={styles.nav}>
            <Link href="#footer" className={styles.link}>Контакты</Link>
            <Link href="/#audit" className={styles.link}>Аудит</Link>
            <Link href="/#tips" className={styles.link}>Советы</Link>
          </nav>
        </header>

        <div className={styles.rightGroup}>
          {loggedIn ? (
            <>
              <Link
                href={siteId ? `/dashboard/${siteId}` : "/"}
                className={styles.headerBtn}
              >
                <img src="/enter.svg" alt="Дашборд" className={styles.headerBtnIcon} />
                <span className={styles.headerBtnText}>Дашборд</span>
              </Link>
              <button onClick={handleLogout} className={styles.headerBtn}>
                <span className={styles.headerBtnText}>Выйти</span>
              </button>
            </>
          ) : (
            <Link href="/login" className={styles.headerBtn}>
              <img src="/enter.svg" alt="Вход" className={styles.headerBtnIcon} />
              <span className={styles.headerBtnText}>Вход</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
