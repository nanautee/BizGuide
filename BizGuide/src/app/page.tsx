// src/app/page.tsx
import { HeroSection } from '@/widgets/HeroSection';
import { StarterSection } from '@/widgets/StarterSection';
import { BenefitsSection } from '@/widgets/BenefitsSection';

const styles = {
  container: "flex flex-col items-center justify-start w-full m-0 p-0",
};

export default function Home() {
  return (
    <main id="top" className={styles.container}>
      <HeroSection />
      <StarterSection />
      <BenefitsSection />
    </main>
  );
}