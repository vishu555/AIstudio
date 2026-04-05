export interface Stock {
  name: string;
  symbol: string;
}

export interface AnalysisResult {
  stockName: string;
  phase: "Stage 1: Consolidation" | "Stage 2: Accumulation" | "Stage 3: Explosive Growth";
  trendDirection: string;
  volumeBehavior: string;
  volatility: string;
  supportResistance: string;
  suggestedStrategy: string;
  finalActionPlan: string;
  fullMarkdown: string;
}
