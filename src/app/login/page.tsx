import Link from "next/link";

const styles = {
  page: "min-h-screen flex items-center justify-center px-4 bg-cover bg-no-repeat bg-top",
  card: "w-full max-w-[560px] rounded-[32px] border border-white/40 bg-[#6CA8EB]/55 backdrop-blur-md p-8 text-white",
  title: "text-center text-6xl md:text-7xl font-bold",
  form: "mt-6",
  field: "w-full bg-transparent border-b border-white/70 pb-2 text-4xl md:text-5xl outline-none placeholder:text-white/70",
  row: "mt-8",
  forgot: "mt-2 text-right text-2xl md:text-3xl text-white/80",
  submit:
    "mt-8 w-full h-14 rounded-full bg-[#4E95EC] text-white text-5xl md:text-6xl hover:opacity-90 transition inline-flex items-center justify-center",
  footer: "mt-6 text-center text-2xl md:text-3xl text-white/80",
  footerLink: "font-semibold text-white hover:opacity-90",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; url?: string }>;
}) {
  const { mode = "login", url = "/" } = await searchParams;
  const isRegister = mode === "register";

  return (
    <main className={styles.page} style={{ backgroundImage: "url('/BizGuide.svg')" }}>
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
          <Link href={url || "/"} className={styles.submit}>
            <span>{isRegister ? "Создать" : "Войти"}</span>
          </Link>
        </form>

        <p className={styles.footer}>
          {isRegister ? "Уже есть аккаунт?" : "Еще не зарегистрированы?"}{" "}
          <Link
            href={`/login?mode=${isRegister ? "login" : "register"}&url=${encodeURIComponent(url || "/")}`}
            className={styles.footerLink}
          >
            {isRegister ? "Войти" : "Создать аккаунт"}
          </Link>
        </p>
      </section>
    </main>
  );
}
