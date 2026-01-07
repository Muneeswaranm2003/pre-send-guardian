import { memo } from "react";
import FeatureCard from "@/components/FeatureCard";
import { FEATURES } from "@/constants";

function FeaturesSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Comprehensive Risk Analysis
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We analyze multiple signals to give you the most accurate deliverability prediction.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <FeatureCard
              key={i}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={i * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(FeaturesSection);
