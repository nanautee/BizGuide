import Link from "next/link";

const styles = {
  card: "rounded-3xl border border-white/30 bg-white/10 p-6",
  title: "text-2xl md:text-3xl font-bold",
  text: "mt-2 text-white/90",
  action: "mt-4 inline-flex rounded-xl bg-[#4E95EC] px-4 py-2 hover:opacity-90",
};

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ siteId: string }>;
  searchParams: Promise<{ url?: string; tab?: string }>;
}) {
  const { siteId } = await params;
  const { url, tab } = await searchParams;

  if (tab === "social") {
    return (
      <section className={styles.card}>
        <h1 className={styles.title}>Соцсети и присутствие</h1>
        <p className={styles.text}>
          API для соцсетей уже готов: подключайте форму ссылок и отправляйте данные в <code>/api/social</code>.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.card}>
      <h1 className={styles.title}>Сайт и SEO</h1>
      <p className={styles.text}>
        Анализ для <strong>{url ?? "вашего сайта"}</strong> запущен. Site ID: <code>{siteId}</code>.
      </p>
      <p className={styles.text}>
        На следующем шаге можно добавить сохранение результатов в БД и историю изменений.
      </p>
      <Link className={styles.action} href="/">
        Вернуться на главную
      </Link>
    </section>
  );
}
