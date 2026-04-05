interface GlassCardProps {
  title: string;
  description: string;
  raised?: boolean;
  className?: string;
}

const styles = {
  card: [
    "w-full overflow-hidden rounded-[24px] border border-white/30 bg-[#3686E9]/30",
    "p-5 shadow-lg backdrop-blur-md transition",
    "flex flex-col",
    "min-h-[240px] sm:min-h-[280px] md:min-h-[320px]",
  ].join(" "),
  raised: "md:-translate-y-5",
  title: [
    "mb-3 break-words font-bold leading-[0.92] text-white",
    "text-2xl sm:text-[24px] md:text-[32px] lg:text-[40px]",
  ].join(" "),
  text: [
    "mt-2 break-words leading-[1.08] text-white/90",
    "text-sm sm:text-base md:text-[24px]",
  ].join(" "),
};

export const GlassCard = ({ title, description, raised = false, className = "" }: GlassCardProps) => (
  <article className={`${styles.card} ${raised ? styles.raised : ""} ${className}`}>
    <h3 className={styles.title}>{title}</h3>
    <p className={styles.text}>{description}</p>
  </article>
);
