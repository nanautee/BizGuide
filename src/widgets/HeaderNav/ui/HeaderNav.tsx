import Link from 'next/link';

const styles = {
  stickyContainer: "fixed inset-x-0 top-0 z-40 w-full px-3 pt-6",
  row: "relative mx-auto flex w-full max-w-[1280px] items-center justify-center",
  logo: "absolute left-4 z-10 text-white text-4xl leading-none font-bold md:left-8 md:text-5xl",
  header:
    "relative z-10 mx-auto h-[46px] w-full max-w-[430px] rounded-full border border-white/35 bg-[#C7E5FF]/38 backdrop-blur-md",
  container: "flex h-full items-center justify-center px-4",
  nav: "flex gap-6 md:gap-8",
  link: "text-white text-sm md:text-base font-medium hover:opacity-85 transition",
  loginButton:
    "absolute right-4 z-10 flex h-[46px] items-center gap-2 rounded-full border border-white/35 bg-white/20 px-4 backdrop-blur-sm transition hover:bg-white/30 active:scale-95 md:right-8",
  buttonText: "text-white text-sm md:text-base font-normal",
  buttonIcon: "w-5 h-5 object-contain",
};

export const HeaderNav = () => {
  return (
    <div className={styles.stickyContainer}>
      <div className={styles.row}>
        <Link href="/" className={styles.logo}>
          BizGuide
        </Link>

        <header className={styles.header}>
          <div className={styles.container}>
            <nav className={styles.nav}>
              <Link href="#footer" className={styles.link}>Контакты</Link>
              <Link href="/#audit" className={styles.link}>Аудит</Link>
              <Link href="/#tips" className={styles.link}>Советы</Link>
            </nav>
          </div>
        </header>

        <Link href="/login" className={styles.loginButton}>
          <img src="/enter.svg" alt="Вход" className={styles.buttonIcon} />
          <span className={styles.buttonText}>Вход</span>
        </Link>
      </div>
    </div>
  );
};
