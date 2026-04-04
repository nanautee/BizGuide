import Link from "next/link";

const styles = {
  section: [
    "z-99 relative mx-auto flex w-full flex-col items-center justify-center",
    "px-4 pb-14 text-center sm:pb-16 md:pb-20 lg:pb-24",
  ].join(" "),

  title: [
    "font-bold leading-tight text-white",
    "text-3xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl",
  ].join(" "),

  subtitle: [
    "mt-1 font-bold leading-tight text-white",
    "text-3xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl",
  ].join(" "),

  btnWrap: "relative z-10 mt-8 inline-block sm:mt-10 md:mt-12 lg:mt-16",

  glow: [
    "pointer-events-none absolute left-1/2 top-1/2 z-0 h-auto max-w-none",
    "-translate-x-1/2 -translate-y-1/2 object-contain opacity-90",
    "w-[400px] sm:w-[550px] md:w-[700px] lg:w-[900px] xl:w-[1100px]",
  ].join(" "),

  btn: [
    "relative z-10 inline-block rounded-[58px] bg-[#4C97F6] shadow-lg",
    "px-8 py-3 text-lg font-normal text-white transition hover:opacity-90",
    "sm:text-xl md:px-10 md:text-3xl lg:px-14 lg:py-4 lg:text-4xl",
  ].join(" "),
};

export const StarterSection = () => (
  <div id="startersection" className={styles.section}>
    <h2 className={styles.title}>Только начинаете?</h2>
    <p className={styles.subtitle}>Мы поможем вам начать!</p>

    <div className={styles.btnWrap}>
      <img src="/whiteblur.svg" alt="" aria-hidden className={styles.glow} />
      <Link href="/first-step" className={styles.btn}>
        сделать первый шаг
      </Link>
    </div>
  </div>
);
