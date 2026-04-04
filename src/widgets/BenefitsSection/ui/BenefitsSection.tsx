import { layout } from "@/shared/ui/styles";
import { GlassCard } from "@/shared/ui/GlassCard";

const ROW = layout.contentRow;
const Z = layout.zContent;

const styles = {
  section: "relative w-full pt-12 pb-20 sm:pt-16 sm:pb-28 md:pt-20 md:pb-36",
  inner: "relative z-10 w-full",

  decorLeft: [
    "pointer-events-none absolute z-0 opacity-100",
    "left-[-400px] top-[-300px] w-[800px]",
    "sm:left-[-500px] sm:top-[-360px] sm:w-[1000px]",
    "md:left-[-600px] md:top-[-420px] md:w-[1200px]",
  ].join(" "),

  decorRight: [
    "pointer-events-none absolute z-0 opacity-95",
    "right-[-250px] top-[-350px] w-[550px]",
    "sm:right-[-300px] sm:top-[-420px] sm:w-[650px]",
    "md:right-[-350px] md:top-[-500px] md:w-[800px]",
  ].join(" "),

  topRow: `${Z} ${ROW} flex flex-col gap-3 sm:gap-4 md:flex-row md:justify-between`,

  logo: [
    "font-bold leading-none text-white",
    "text-4xl sm:text-6xl md:text-8xl lg:text-[128px]",
  ].join(" "),

  intro: [
    "max-w-[540px] text-left leading-[1.1] text-white/90",
    "text-sm sm:text-base md:pt-2 md:text-[28px]",
  ].join(" "),

  title: [
    `${Z} ${ROW} mt-4 font-bold leading-[1.02] text-white`,
    "text-2xl sm:text-3xl md:mt-5 md:text-4xl",
  ].join(" "),

  descWrap: `${Z} ${ROW} mt-3`,

  desc: [
    "relative z-10 max-w-[760px] leading-[1.08] text-white",
    "text-base sm:text-[2px] md:text-[22px] lg:text-[44px]",
  ].join(" "),

  cards: [
    `${Z} ${ROW}`,
    "mt-6 grid grid-cols-1 gap-4",
    "sm:mt-8 sm:grid-cols-2",
    "md:mt-12 md:grid-cols-3 md:items-end md:gap-5",
  ].join(" "),
};

const benefits = [
  {
    title: "Полный аудит за пару кликов",
    text: "BizGuide сам проверит ваш сайт, соцсети и приложения. Вам не нужно быть программистом или SEO-специалистом\u00A0- мы найдем ошибки за\u00A0вас.",
  },
  {
    title: "Реальный рост клиентов",
    text: "Мы поможем сократить разрыв между тем, как работают поисковые системы, и тем, что вы о них знаете. Результат\u00A0- вас чаще находят и\u00A0выбирают.",
  },
  {
    title: "Автоматический контроль 24/7",
    text: "Система регулярно перепроверяет сайт и площадки, чтобы вы раньше замечали просадки и\u00A0ошибки.",
  },
];

export const BenefitsSection = () => (
  <section id="audit" className={styles.section}>
    <div className={styles.inner}>
      <img src="/pixelcircle.svg" alt="" aria-hidden className={styles.decorLeft} />
      <img src="/blurcircle.svg" alt="" aria-hidden className={styles.decorRight} />

      <div className={styles.topRow}>
        <div className={styles.logo}>BizGuide</div>
        <div className={styles.intro}>
          - это цифровой советник, который показывает, как клиенты видят ваш бизнес в интернете,
          и дает простые шаги, чтобы вас находили чаще.
        </div>
      </div>

      <h2 className={styles.title}>Поймите, как клиенты находят вас на самом деле.</h2>

      <div className={styles.descWrap}>
        <p id="tips" className={styles.desc}>
          BizGuide проверяет ваше присутствие в интернете и даёт простые советы по продвижению
        </p>
      </div>

      <div className={styles.cards}>
        {benefits.map((b, i) => (
          <GlassCard
            key={b.title}
            title={b.title}
            description={b.text}
            raised={i === 1}
          />
        ))}
      </div>
    </div>
  </section>
);
