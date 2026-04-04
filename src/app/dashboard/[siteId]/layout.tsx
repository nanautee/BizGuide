const glow = [
  "pointer-events-none absolute top-0 rounded-full bg-[#94C5FF]",
  "h-[min(90vw,680px)] w-[min(90vw,680px)]",
  "blur-[100px] opacity-[0.88] sm:blur-[140px] md:blur-[180px] lg:blur-[200px]",
].join(" ");

const styles = {
  wrapper: [
    "relative w-full min-h-screen overflow-x-hidden px-4 pt-28 pb-10 text-white md:px-8 lg:px-12",
    "bg-[linear-gradient(180deg,#2786FF_0%,#2786FF_42%,#6EB0FF_72%,#94C5FF_100%)]",
  ].join(" "),
  glowLayer: "pointer-events-none absolute inset-0 z-0 overflow-hidden",
  glowLeft: `${glow} left-0 -translate-x-[32%] -translate-y-[38%]`,
  glowRight: `${glow} right-0 translate-x-[32%] -translate-y-[38%]`,
  content: "relative z-10",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.glowLayer} aria-hidden>
        <div className={styles.glowLeft} />
        <div className={styles.glowRight} />
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
