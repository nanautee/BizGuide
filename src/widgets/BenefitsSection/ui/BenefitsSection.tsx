import { GlassCard } from '@/shared/ui/GlassCard';

const styles = {
  // Секция преимуществ продукта.
  container: "relative w-full min-h-screen py-16 md:py-20",
  // Контент в центре, декоративные SVG остаются на уровне секции.
  content: "relative z-10 max-w-7xl mx-auto px-6 lg:px-8",
  // Верхняя строка: бренд + краткое описание.
  topWrapper: "flex flex-col md:flex-row justify-between items-start gap-8 mb-12",
  logo: "text-white text-6xl md:text-7xl lg:text-8xl font-bold leading-none",
  rightDesc: "text-white/85 text-base md:text-2xl max-w-[620px] text-left",
  // Крупный оффер.
  hugeTitle: "text-white text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-4 w-full max-w-[1300px]",
  // Подзаголовок-объяснение.
  subDesc: "text-white/90 text-2xl md:text-[44px] leading-[1.1] max-w-[1300px] mb-6",
  desc: "text-white/85 text-lg md:text-[42px] leading-[1.1] max-w-[900px] mb-10",
  // Декор слева/справа по макету.
  pixelCircle: "pointer-events-none absolute left-0 top-[22%] w-[180px] md:w-[280px] h-auto opacity-80 z-0 object-contain",
  blurElips: "pointer-events-none absolute left-0 top-[35%] w-[260px] md:w-[430px] h-auto opacity-70 z-0 object-contain",
  blurCircle: "pointer-events-none absolute right-0 top-[33%] w-[260px] md:w-[420px] h-auto opacity-70 z-0 object-contain",
  // Карточки преимуществ.
  grid: "flex flex-wrap md:flex-nowrap justify-center items-end gap-5 md:gap-8 relative z-10",
};

const benefits = [
  {
    title: "Полный аудит за пару кликов",
    description: "BizGuide сам проверит ваш сайт, соцсети и приложения. Вам не нужно быть программистом или SEO-специалистом - мы найдём ошибки за вас.",
    raised: false,
  },
  {
    title: "Реальный рост клиентов",
    description: "Мы покажем, как поисковые системы видят ваш бизнес, и дадим понятные шаги для роста заявок и продаж.",
    raised: true,
  },
  {
    title: "Автоматический контроль 24/7",
    description: "Система регулярно перепроверяет сайт и площадки, чтобы вы раньше замечали просадки и ошибки.",
    raised: false,
  },
];

export const BenefitsSection = () => {
  return (
    <section id="audit" className={styles.container}>
      {/* Фоновые SVG-слои секции */}
      <img src="/pixelcircle.svg" alt="" aria-hidden className={styles.pixelCircle} />
      <img src="/blurelips.svg" alt="" aria-hidden className={styles.blurElips} />
      <img src="/blurcircle.svg" alt="" aria-hidden className={styles.blurCircle} />

      <div className={styles.content}>
        {/* Бренд + описание продукта */}
        <div className={styles.topWrapper}>
          <div className={styles.logo}>BizGuide</div>
          <div className={styles.rightDesc}>
            - это цифровой советник, который показывает, как клиенты видят ваш бизнес в интернете, и даёт простые шаги, чтобы вас находили чаще.
          </div>
        </div>

        {/* Основной оффер */}
        <h2 className={styles.hugeTitle}>
          Поймите, как клиенты находят вас
          <br />
          на самом деле.
        </h2>

        {/* Короткое пояснение о пользе */}
        <p id="tips" className={styles.desc}>
          BizGuide проверяет ваше присутствие в интернете и даёт простые советы по продвижению
        </p>

        {/* 3 карточки ключевых преимуществ */}
        <div className={styles.grid}>
          {benefits.map((item, idx) => (
            <GlassCard
              key={idx}
              title={item.title}
              description={item.description}
              raised={item.raised}
            />
          ))}
        </div>
      </div>
    </section>
  );
};