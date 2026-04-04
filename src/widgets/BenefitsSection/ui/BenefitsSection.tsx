import { layout, cards as cardStyles } from "@/shared/ui/styles";

const L = layout.contentRow;

const styles = {
  section: "relative w-full py-16 md:py-20",
  inner: "relative z-10 w-full",

  decorLeft: `${layout.zContent} pointer-events-none absolute left-[-600px] top-[-420px] z-0 w-[1200px] opacity-100`,
  decorRight: `${layout.zContent} pointer-events-none absolute right-[-350px] top-[-500px] z-0 w-[800px] opacity-95`,

  topRow: `${layout.zContent} ${L} flex flex-col gap-4 md:flex-row md:justify-between`,
  logo: "text-white text-6xl font-bold leading-none md:text-8xl lg:text-[92px]",
  intro: "max-w-[540px] text-left text-white/90 text-base leading-[1.1] md:pt-2 md:text-[20px]",

  title: `${layout.zContent} ${L} mt-5 text-white text-4xl font-bold leading-[1.02]`,
  descriptionWrap: `relative z-[5] ${L} mt-3`,
  description: "relative z-10 max-w-[760px] text-white/90 text-xl leading-[1.08] md:text-[44px]",

  cards: `${layout.zContent} ${L} mt-10 grid grid-cols-1 gap-4 md:mt-12 md:grid-cols-3 md:items-end md:gap-5`,
  card: `${cardStyles.glass} md:min-h-[320px]`,
  cardRaised: "md:-translate-y-5",
  cardTitle: "text-white text-[34px] font-bold leading-[0.92] md:text-[46px]",
  cardText: "mt-2 text-white/90 text-base leading-[1.08] md:text-[20px]",
};

const benefits = [
  {
    title: "Полный аудит за пару кликов",
    description:
      "BizGuide сам проверит ваш сайт, соцсети и приложения. Вам не нужно быть программистом или SEO-специалистом - мы найдем ошибки за вас.",
  },
  {
    title: "Реальный рост клиентов",
    description:
      "Мы поможем сократить разрыв между тем, как работают поисковые системы, и тем, что вы о них знаете. Результат - вас чаще находят и выбирают.",
  },
  {
    title: "Автоматический контроль 24/7",
    description:
      "Система регулярно перепроверяет сайт и площадки, чтобы вы раньше замечали просадки и ошибки.",
  },
];

export const BenefitsSection = () => {
  return (
    <section id="audit" className={styles.section}>
      <div className={styles.inner}>
        <img src="/pixelcircle.svg" alt="" aria-hidden className={styles.decorLeft} />
        <img src="/blurcircle.svg" alt="" aria-hidden className={styles.decorRight} />

        <div className={styles.topRow}>
          <div className={styles.logo}>BizGuide</div>
          <div className={styles.intro}>
            - это цифровой советник, который показывает, как клиенты видят ваш бизнес в интернете, и дает простые шаги, чтобы вас находили чаще.
          </div>
        </div>

        <h2 className={styles.title}>Поймите, как клиенты находят вас на самом деле.</h2>

        <div className={styles.descriptionWrap}>
          <p id="tips" className={styles.description}>
            BizGuide проверяет ваше присутствие в интернете и даёт простые советы по продвижению
          </p>
        </div>

        <div className={styles.cards}>
          {benefits.map((item, idx) => (
            <article key={item.title} className={`${styles.card} ${idx === 1 ? styles.cardRaised : ""}`}>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardText}>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
