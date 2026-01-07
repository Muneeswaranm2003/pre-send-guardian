import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  HeroSection,
  StatsSection,
  ProblemSection,
  HowItWorksSection,
  FeaturesSection,
  PricingSection,
  CtaSection,
} from "@/components/landing";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <StatsSection />
      <ProblemSection />
      <HowItWorksSection />
      <FeaturesSection />
      <PricingSection />
      <CtaSection />
      <Footer />
    </div>
  );
};

export default Index;
