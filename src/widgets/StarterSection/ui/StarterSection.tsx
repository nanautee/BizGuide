import Link from 'next/link';

const styles = {
  // Секция для новичков: крупный текст + CTA.
  container: "relative w-full min-h-screen mx-auto px-4 py-10 text-center flex flex-col justify-center",
  // Основной заголовок секции.
  title: "text-white text-5xl md:text-7xl lg:text-8xl font-bold leading-tight",
  subtitle: "text-white text-5xl md:text-7xl lg:text-8xl font-bold leading-tight",
  // Кнопка и декоративный белый блюр.
  buttonWrapper: "relative inline-block mt-12 z-10",
  // Основной CTA.
  button:
    "inline-block rounded-[58px] bg-[#4C97F6] px-10 py-3 text-2xl font-normal text-white md:text-3xl hover:opacity-90 transition shadow-lg",
  // Белый подсвет под кнопкой.
  glow: "pointer-events-none absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[380px] md:w-[520px] max-w-none h-auto opacity-90 z-0 object-contain",
};

export const StarterSection = () => {
  return (
    <div id="startersection" className={styles.container}>
      {/* Основной оффер для нового бизнеса */}
      <h2 className={styles.title}>Только начинаете?</h2>
      <p className={styles.subtitle}>Мы поможем вам начать!</p>

      {/* CTA с мягкой подсветкой */}
      <div className={styles.buttonWrapper}>
        {/* Декоративный SVG-фон */}
        <img src="/whiteblur.svg" alt="" aria-hidden className={styles.glow} />
        {/* Переход к верхнему блоку анализа */}
        <Link href="/#top" className={styles.button}>
          сделать первый шаг
        </Link>
      </div>
    </div>
  );
};