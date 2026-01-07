import { memo } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  popular?: boolean;
  buttonText: string;
  onSelect?: () => void;
}

function PricingCard({
  name,
  price,
  period = "/month",
  description,
  features,
  popular = false,
  buttonText,
  onSelect,
}: PricingCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-xl",
        popular
          ? "border-primary shadow-lg scale-105 z-10"
          : "border-border/50 hover:border-primary/30"
      )}
    >
      {popular && (
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg">
          MOST POPULAR
        </div>
      )}
      <CardHeader className="pb-4">
        <h3 className="text-xl font-bold text-foreground">{name}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="mt-4">
          <span className="text-4xl font-bold text-foreground">{price}</span>
          {price !== "Free" && price !== "Custom" && (
            <span className="text-muted-foreground ml-1">{period}</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="w-5 h-5 text-[hsl(var(--success))] shrink-0 mt-0.5" />
              <span className="text-sm text-foreground">{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          variant={popular ? "hero" : "outline"}
          className="w-full"
          size="lg"
          onClick={onSelect}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}

export default memo(PricingCard);
