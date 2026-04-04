import Link from "next/link";

const styles = {
  page: "relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden px-4 pt-24 pb-8 md:pt-28",
  auraWrap:
    "pointer-events-none absolute left-1/2 top-1/2 z-0 h-[120vh] w-[1900px] -translate-x-1/2 -translate-y-1/2 md:w-[2300px]",
  aura: "h-full w-full object-contain object-center opacity-95 mix-blend-screen",
  card:
    "relative z-10 w-full max-w-[600px] rounded-[32px] border border-white/45 bg-[#6AA8EE]/45 px-6 py-7 text-white backdrop-blur-md md:px-8 md:py-8",
  title: "text-center text-6xl font-bold leading-none md:text-7xl",
  form: "mt-8",
  row: "mt-5",
  field:
    "w-full border-b border-white/85 bg-transparent pb-2 text-2xl leading-none text-white outline-none placeholder:text-white/80 md:text-3xl",
  forgot: "mt-1 text-right text-xl text-white/85 md:text-2xl",
  submit:
    "mt-7 inline-flex h-[54px] w-full items-center justify-center rounded-full bg-[#4C97F6] text-3xl font-normal text-white transition hover:opacity-90 md:h-[58px] md:text-4xl",
  footer: "mt-5 text-center text-xl text-white/75 md:text-2xl",
  footerLink: "font-medium text-white/90 hover:text-white",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; url?: string }>;
}) {
  const { mode = "login", url = "/" } = await searchParams;
  const isRegister = mode === "register";
  const safeUrl = url || "/";
  const switchModeHref = `/login?mode=${isRegister ? "login" : "register"}&url=${encodeURIComponent(safeUrl)}`;

  return (
    <main className={styles.page}>
      <div className={styles.auraWrap} aria-hidden>
        <img src="/aura.svg" alt="" className={styles.aura} />
      </div>

      <section className={styles.card}>
        <h1 className={styles.title}>{isRegister ? "Регистрация" : "Вход"}</h1>

        {/* Это MVP-форма для навигации; реальную авторизацию подключим позже. */}
        <form className={styles.form}>
          <div className={styles.row}>
            <input className={styles.field} type="email" placeholder="почта" />
          </div>
          <div className={styles.row}>
            <input className={styles.field} type="password" placeholder="пароль" />
            {!isRegister ? <p className={styles.forgot}>забыли пароль?</p> : null}
          </div>
          <Link href={safeUrl} className={styles.submit}>
            <span>{isRegister ? "Зарегистрироваться" : "Войти"}</span>
          </Link>
        </form>

        <p className={styles.footer}>
          {isRegister ? "Уже зарегистрированы? " : "Еще не зарегистрированы? "}
          <Link href={switchModeHref} className={styles.footerLink}>
            {isRegister ? "Войти в аккаунт" : "Создать аккаунт"}
          </Link>
        </p>
      </section>
    </main>
  );
}
