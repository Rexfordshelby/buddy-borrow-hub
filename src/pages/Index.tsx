
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { HowItWorks } from '@/components/HowItWorks';
import { TestimonialsSlider } from '@/components/TestimonialsSlider';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <HowItWorks />
        <TestimonialsSlider />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Index;
