import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import SeasonSection from '@/components/home/SeasonSection';
import FeatureSection from '@/components/home/FeatureSection';

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <HeroSection />
        <SeasonSection />
        <FeatureSection />
      </main>
      <Footer />
    </>
  );
}
