import Link from "next/link";

const styles = {
  wrapper: "max-w-5xl mx-auto px-4 py-8 text-white",
  nav: "flex gap-2 mb-6",
  tab: "rounded-full px-4 py-2 border border-white/40 bg-white/10 hover:bg-white/20 transition",
};

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ siteId: string }>;
}) {
  // Используем siteId для построения ссылок вкладок.
  const { siteId } = await params;

  return (
    <div className={styles.wrapper}>
      <nav className={styles.nav}>
        <Link className={styles.tab} href={`/dashboard/${siteId}`}>
          Сайт и SEO
        </Link>
        <Link className={styles.tab} href={`/dashboard/${siteId}?tab=social`}>
          Соцсети и присутствие
        </Link>
      </nav>
      {children}
    </div>
  );
}
