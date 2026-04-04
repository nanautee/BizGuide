const styles = {
  footer: "mt-auto bg-gradient-to-t from-[#2C71BF] to-[#8BB8EB] py-4 sm:py-5",

  container: [
    "mx-auto flex w-full max-w-[1280px] flex-col gap-3 px-4",
    "sm:flex-row sm:items-center sm:justify-between sm:gap-4",
    "md:px-8",
  ].join(" "),

  socials: "flex flex-wrap gap-2",

  socialBtn: [
    "inline-flex h-7 items-center gap-1 rounded-full bg-[#2D80EA] px-3",
    "text-xs text-white transition hover:opacity-90",
    "sm:text-sm",
  ].join(" "),

  contacts: [
    "flex flex-wrap items-center gap-3 font-semibold text-white",
    "text-base sm:gap-4 sm:text-lg md:gap-6 md:text-xl lg:text-3xl",
  ].join(" "),

  contactLink: "transition hover:opacity-80",
};

const SOCIALS = ["VK", "Telegram", "Dzen"];

export const FooterBar = () => (
  <footer id="footer" className={styles.footer}>
    <div className={styles.container}>
      <div className={styles.socials}>
        {SOCIALS.map((name) => (
          <button key={name} className={styles.socialBtn}>
            {name} <span aria-hidden>↗</span>
          </button>
        ))}
      </div>

      <div className={styles.contacts}>
        <a href="tel:+74113905111" className={styles.contactLink}>+7 (411) 390-51-11</a>
        <a href="mailto:info@BizGuide.ru" className={styles.contactLink}>info@BizGuide.ru</a>
      </div>
    </div>
  </footer>
);
