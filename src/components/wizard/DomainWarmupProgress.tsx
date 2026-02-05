 import { Progress } from "@/components/ui/progress";
 import { Flame } from "lucide-react";
 
 // Domain warmup percentage based on age
 export const WARMUP_PERCENTAGE: Record<string, { percent: number; label: string }> = {
   new: { percent: 5, label: "Just Started" },
   month: { percent: 15, label: "Early Stage" },
   quarter: { percent: 35, label: "Building" },
   half: { percent: 55, label: "Maturing" },
   year: { percent: 75, label: "Established" },
   established: { percent: 90, label: "Well Warmed" },
   mature: { percent: 100, label: "Fully Warmed" },
 };
 
 interface DomainWarmupProgressProps {
   domainAge: string;
 }
 
 const DomainWarmupProgress = ({ domainAge }: DomainWarmupProgressProps) => {
   const warmupData = WARMUP_PERCENTAGE[domainAge];
   
   if (!warmupData) return null;
 
   const getColorClass = (percent: number) => {
     if (percent < 30) return "text-destructive";
     if (percent < 60) return "text-[hsl(var(--warning))]";
     return "text-[hsl(var(--success))]";
   };
 
   const getProgressColorClass = (percent: number) => {
     if (percent < 30) return "[&>div]:bg-destructive";
     if (percent < 60) return "[&>div]:bg-[hsl(var(--warning))]";
     return "[&>div]:bg-[hsl(var(--success))]";
   };
 
   return (
     <div className="p-4 rounded-lg border bg-accent/30 border-border">
       <div className="flex items-center justify-between mb-2">
         <div className="flex items-center gap-2">
           <Flame className={`w-4 h-4 ${getColorClass(warmupData.percent)}`} />
           <span className="font-medium text-foreground text-sm">Domain Warmup Status</span>
         </div>
         <span className={`text-sm font-semibold ${getColorClass(warmupData.percent)}`}>
           {warmupData.percent}%
         </span>
       </div>
       <Progress 
         value={warmupData.percent} 
         className={`h-3 ${getProgressColorClass(warmupData.percent)}`}
       />
       <p className="text-xs text-muted-foreground mt-2">
         {warmupData.label} — {warmupData.percent < 100 
           ? "Continue consistent sending to improve warmup" 
           : "Maximum warmup achieved"}
       </p>
     </div>
   );
 };
 
 export default DomainWarmupProgress;