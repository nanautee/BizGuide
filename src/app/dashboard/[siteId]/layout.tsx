const styles = {
  wrapper: "w-full min-h-screen bg-[#2786FF] px-4 pt-28 pb-10 text-white md:px-8 lg:px-12",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={styles.wrapper}>{children}</div>;
}
