 import { TrendingUp, AlertTriangle, Mail } from "lucide-react";
 
 // Volume recommendations based on domain age
 export const VOLUME_RECOMMENDATIONS: Record<string, { 
   daily: string; 
   weekly: string; 
   tip: string; 
   color: string;
   providers: { gmail: string; outlook: string; yahoo: string };
 }> = {
   new: {
     daily: "20-50",
     weekly: "100-250",
     tip: "Start very slow. Send to your most engaged contacts only.",
     color: "destructive",
     providers: {
       gmail: "10-20/day",
       outlook: "15-30/day",
       yahoo: "10-25/day",
     },
   },
   month: {
     daily: "50-100",
     weekly: "250-500",
     tip: "Gradually increase volume. Monitor bounce rates closely.",
     color: "destructive",
     providers: {
       gmail: "30-50/day",
       outlook: "40-60/day",
       yahoo: "25-50/day",
     },
   },
   quarter: {
     daily: "100-500",
     weekly: "500-2,500",
     tip: "Continue warming up. Maintain consistent sending patterns.",
     color: "warning",
     providers: {
       gmail: "75-200/day",
       outlook: "100-300/day",
       yahoo: "50-200/day",
     },
   },
   half: {
     daily: "500-1,000",
     weekly: "2,500-5,000",
     tip: "Domain is maturing. Avoid sudden volume spikes.",
     color: "warning",
     providers: {
       gmail: "300-600/day",
       outlook: "400-800/day",
       yahoo: "250-500/day",
     },
   },
   year: {
     daily: "1,000-5,000",
     weekly: "5,000-25,000",
     tip: "Good reputation building. Can handle moderate campaigns.",
     color: "info",
     providers: {
       gmail: "800-2,500/day",
       outlook: "1,000-3,500/day",
       yahoo: "600-2,000/day",
     },
   },
   established: {
     daily: "5,000-10,000",
     weekly: "25,000-50,000",
     tip: "Well-established. Focus on maintaining engagement rates.",
     color: "success",
     providers: {
       gmail: "3,000-6,000/day",
       outlook: "4,000-8,000/day",
       yahoo: "2,500-5,000/day",
     },
   },
   mature: {
     daily: "10,000+",
     weekly: "50,000+",
     tip: "Maximum sending capacity. Continue monitoring metrics.",
     color: "success",
     providers: {
       gmail: "8,000+/day",
       outlook: "10,000+/day",
       yahoo: "6,000+/day",
     },
   },
 };
 
 interface VolumeRecommendationsProps {
   domainAge: string;
 }
 
 const VolumeRecommendations = ({ domainAge }: VolumeRecommendationsProps) => {
   const recommendation = VOLUME_RECOMMENDATIONS[domainAge];
   
   if (!recommendation) return null;
 
   const getBgColorClass = (color: string) => {
     switch (color) {
       case "destructive":
         return "bg-destructive/10 border-destructive/30";
       case "warning":
         return "bg-[hsl(var(--warning))]/10 border-[hsl(var(--warning))]/30";
       case "info":
         return "bg-[hsl(var(--info))]/10 border-[hsl(var(--info))]/30";
       case "success":
         return "bg-[hsl(var(--success))]/10 border-[hsl(var(--success))]/30";
       default:
         return "bg-accent/10 border-border";
     }
   };
 
   const getIconColorClass = (color: string) => {
     switch (color) {
       case "destructive":
         return "text-destructive";
       case "warning":
         return "text-[hsl(var(--warning))]";
       case "info":
         return "text-[hsl(var(--info))]";
       case "success":
         return "text-[hsl(var(--success))]";
       default:
         return "text-muted-foreground";
     }
   };
 
   return (
     <div className={`p-4 rounded-lg border ${getBgColorClass(recommendation.color)}`}>
       <div className="flex items-center gap-2 mb-3">
         <TrendingUp className={`w-4 h-4 ${getIconColorClass(recommendation.color)}`} />
         <span className="font-medium text-foreground text-sm">Recommended Sending Limits</span>
       </div>
       <div className="grid grid-cols-2 gap-4 mb-3">
         <div>
           <p className="text-xs text-muted-foreground mb-1">Daily Volume</p>
           <p className="text-lg font-semibold text-foreground">{recommendation.daily}</p>
           <p className="text-xs text-muted-foreground">emails/day</p>
         </div>
         <div>
           <p className="text-xs text-muted-foreground mb-1">Weekly Volume</p>
           <p className="text-lg font-semibold text-foreground">{recommendation.weekly}</p>
           <p className="text-xs text-muted-foreground">emails/week</p>
         </div>
       </div>
       
       {/* Provider-specific recommendations */}
       <div className="mb-3 pt-3 border-t border-border/50">
         <div className="flex items-center gap-2 mb-2">
           <Mail className="w-3.5 h-3.5 text-muted-foreground" />
           <span className="text-xs font-medium text-foreground">Provider-Specific Limits</span>
         </div>
         <div className="grid grid-cols-3 gap-2">
           <div className="p-2 rounded-md bg-background/50 border border-border/50">
             <p className="text-xs text-muted-foreground mb-0.5">Gmail</p>
             <p className="text-sm font-semibold text-foreground">{recommendation.providers.gmail}</p>
           </div>
           <div className="p-2 rounded-md bg-background/50 border border-border/50">
             <p className="text-xs text-muted-foreground mb-0.5">Outlook</p>
             <p className="text-sm font-semibold text-foreground">{recommendation.providers.outlook}</p>
           </div>
           <div className="p-2 rounded-md bg-background/50 border border-border/50">
             <p className="text-xs text-muted-foreground mb-0.5">Yahoo</p>
             <p className="text-sm font-semibold text-foreground">{recommendation.providers.yahoo}</p>
           </div>
         </div>
       </div>
       
       <div className="flex items-start gap-2 pt-2 border-t border-border/50">
         <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
         <p className="text-xs text-muted-foreground">{recommendation.tip}</p>
       </div>
     </div>
   );
 };
 
 export default VolumeRecommendations;