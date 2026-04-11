import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import SeasonSection from '@/components/home/SeasonSection';
import StepSection from '@/components/home/StepSection';
import FeatureSection from '@/components/home/FeatureSection';
import CtaSection from '@/components/home/CtaSection';

export default async function Home() {
  const { userId } = await auth();
  if (userId) {
    redirect('/mypage');
  }

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <HeroSection />
        <SeasonSection />
        <StepSection />
        <FeatureSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
