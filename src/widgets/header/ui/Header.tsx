import Link from 'next/link';

const styles = {
  // Общая фиксированная шапка поверх секций.
  stickyContainer: "sticky top-0 z-40 w-full flex justify-center items-center px-3",
  // Бренд слева, ведет в начало главной.
  logo: "absolute left-4 md:left-8 text-white text-3xl md:text-4xl leading-none font-bold",
  // Полупрозрачная капсула с навигацией.
  header: "mx-auto w-full max-w-[430px] h-[42px] bg-[#C7E5FF]/35 backdrop-blur-md rounded-full shadow-md border border-white/40",
  container: "flex items-center justify-center h-full px-4",
  nav: "flex gap-6",
  link: "text-[#FFFFFF] text-sm md:text-base font-medium hover:opacity-80 transition",
  // Кнопка входа справа.
  loginButton:
    "absolute right-4 md:right-8 flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 h-[42px] border border-white/30 hover:bg-white/30 transition active:scale-95",
  buttonText: "text-white text-sm md:text-base font-medium",
  buttonIcon: "w-5 h-5 object-contain",
};

export const Header = () => {
  return (

    <div className={styles.stickyContainer}>
      <Link href="#top" className={styles.logo}>
        BizGuide
      </Link>

      {/* Центральная навигация по якорям страницы */}
      <header className={styles.header}>
        <div className={styles.container}>
          <nav className={styles.nav}>
            <Link href="#footer" className={styles.link}>Контакты</Link>
            <Link href="#audit" className={styles.link}>Аудит</Link>
            <Link href="#tips" className={styles.link}>Советы</Link>
          </nav>
        </div>
      </header>

      {/* Переход на страницу авторизации */}
      <Link href="/login" className={styles.loginButton}>
        <img src="/enter.svg" alt="Вход" className={styles.buttonIcon} />
        <span className={styles.buttonText}>Вход</span>
      </Link>
    </div>

  );
};