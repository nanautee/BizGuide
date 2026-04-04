interface GlassCardProps {
  title: string;
  description: string;
  raised?: boolean; // приподнимаем центральную карточку
}

const styles = {
  // Единый стиль карточки преимущества.
  card: "w-[300px] md:w-[320px] min-h-[300px] md:min-h-[330px] bg-white/14 backdrop-blur-md rounded-[24px] p-5 border border-white/30 shadow-lg transition hover:bg-white/20 flex flex-col",
  raised: "md:-translate-y-10", // Центральную карточку делаем выше, как в макете.
  title: "text-white text-2xl md:text-[44px] leading-[0.95] font-bold mb-3",
  description: "text-white/90 text-base md:text-[28px] leading-[1.08]",
};

export const GlassCard = ({ title, description, raised = false }: GlassCardProps) => {
  return (
    // raised включаем выборочно для построения "лесенки" карточек.
    <div className={`${styles.card} ${raised ? styles.raised : ''}`}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
    </div>
  );
};