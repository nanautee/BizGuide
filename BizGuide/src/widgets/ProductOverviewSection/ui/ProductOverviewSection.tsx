import { layout } from "@/shared/ui/styles";

const ROW = layout.contentRow;
const Z = layout.zContent;

const styles = {
  section: "relative w-full py-12 sm:py-16 md:py-20",
  title: [
    `${Z} ${ROW} text-center font-bold leading-tight text-white`,
    "text-2xl sm:text-3xl md:text-4xl lg:text-[42px]",
  ].join(" "),
  grid: [
    `${Z} ${ROW} mt-8 grid gap-6`,
    "md:mt-10 md:grid-cols-2 md:gap-8 lg:gap-10",
  ].join(" "),
  panel: [
    "rounded-[24px] border border-white/35 bg-white/12 p-5 backdrop-blur-md",
    "sm:p-6 md:p-7",
  ].join(" "),
  panelTitle: "text-lg font-bold text-white sm:text-xl md:text-2xl",
  list: "mt-4 space-y-3 text-sm leading-relaxed text-white/90 sm:text-base md:text-[17px]",
  item: "flex gap-2.5",
  bullet: "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4C97F6]",
  note: [
    "mt-5 rounded-xl border border-white/25 bg-[#0152B9]/35 px-4 py-3",
    "text-xs leading-snug text-white/85 sm:text-sm",
  ].join(" "),
};

const functionalityItems = [
  "Аудит сайта по ссылке: оценка, типовые проблемы и список советов.",
  "Проверка соцсетей (VK, Telegram, Яндекс Дзен) — метрики и рекомендации по профилю.",
  "Разбор карточки приложения в Google Play и App Store по заданным правилам.",
  "Сценарий «Первый шаг» для начинающих: вопросы о нише и персональный план действий.",
  "Единый дашборд: сайт, соцсети и приложение собраны в одном месте после входа.",
  "Аккаунт привязан к домену: один сайт — один кабинет, без дублирования.",
];

const guaranteeItems = [
  "Прозрачные критерии проверок: вы видите, за что стоят баллы и формулировки.",
  "Рекомендации на понятном русском, без лишнего жаргона.",
  "Мы не обещаем «место в топе за неделю» — даём структурированный разбор и чек-листы.",
  "Результаты анализа сохраняются в вашей сессии после входа, чтобы не терять прогресс при работе с сервисом.",
  "Сервис развивается: правила проверок и подсказки обновляются по мере улучшения продукта.",
];

export const ProductOverviewSection = () => (
  <section id="product" className={styles.section} aria-labelledby="product-overview-title">
    <h2 id="product-overview-title" className={styles.title}>
      Функционал и гарантии
    </h2>

    <div className={styles.grid}>
      <div className={styles.panel}>
        <h3 className={styles.panelTitle}>Основной функционал</h3>
        <ul className={styles.list}>
          {functionalityItems.map((text) => (
            <li key={text} className={styles.item}>
              <span className={styles.bullet} aria-hidden />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.panel}>
        <h3 className={styles.panelTitle}>Что гарантирует BizGuide</h3>
        <ul className={styles.list}>
          {guaranteeItems.map((text) => (
            <li key={text} className={styles.item}>
              <span className={styles.bullet} aria-hidden />
              <span>{text}</span>
            </li>
          ))}
        </ul>
        <p className={styles.note}>
          Юридически обязательны только условия оферты и политики, если они опубликованы на сайте.
          Формулировки выше описывают принцип работы продукта для пользователя.
        </p>
      </div>
    </div>
  </section>
);
