const styles = {
  // Футер с контактами и соц-площадками.
  footer: "bg-gradient-to-t from-[#2C71BF] to-[#8BB8EB] py-5 mt-auto",
  container: "container mx-auto px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4",
  // Соц-кнопки слева.
  socials: "flex flex-wrap gap-2",
  socialItem:
    "inline-flex items-center gap-1 px-3 h-7 rounded-full bg-[#2D80EA] text-white text-xs md:text-sm hover:opacity-90 transition",
  // Контакты справа.
  contacts: "flex flex-wrap items-center gap-4 md:gap-6 text-white text-xl md:text-3xl font-semibold",
  contactItem: "hover:opacity-80 transition",
};

export const Footer = () => {
  const socials = ["VK", "Telegram", "Instagram", "WhatsApp"];

  return (
    <footer id="footer" className={styles.footer}>
      <div className={styles.container}>
        {/* Блок соцсетей */}
        <div className={styles.socials}>
          {socials.map((social) => (
            <button key={social} className={styles.socialItem}>
              {social}
              <span aria-hidden>↗</span>
            </button>
          ))}
        </div>

        {/* Основные контакты */}
        <div className={styles.contacts}>
          <a href="tel:+74113905111" className={styles.contactItem}>+7 (411) 390-51-11</a>
          <a href="mailto:info@BizGuide.ru" className={styles.contactItem}>info@BizGuide.ru</a>
        </div>
      </div>
    </footer>
  );
};