import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export async function analyzeStock(stockName: string, symbol: string) {
  const prompt = `
Objective:
Analyze the stock chart of ${stockName} (${symbol}) to determine its current market phase. Identify whether it is in a
● Consolidation Phase (Stage 1)
● Accumulation Phase (Stage 2), or
● Explosive Growth Phase (Stage 3),
Based on price action, volume trends, and volatility. Provide a structured breakdown of key observations and an actionable summary regarding the stock's current position and recommended approach.

Step 1: Chart Analysis & Price Action Assessment
● Identify the overall trend of the stock based on recent price movements.
● Observe whether the stock is trading within a range, gradually trending upward, or experiencing rapid price expansion.
● Highlight key support and resistance levels, price bar sizes, and candlestick patterns that indicate trend strength.

Step 2: Volume & Volatility Analysis
● Assess trading volume patterns over the last few weeks or months.
● Identify whether volume is low, moderate, or high and whether it aligns with price movement (e.g., increasing with uptrend, stagnant in range-bound phases).
● Examine volatility indicators, such as sudden price spikes, wide-range bars, or tightening price action.

Step 3: Phase Classification
Determine which of the following three phases the stock is currently in, with supporting evidence:
Stage 1: Consolidation Phase (Sideways Movement)
Stage 2: Accumulation Phase (Gradual Uptrend)
Stage 3: Explosive Growth Phase (Steep Rise)

Step 4: Final Summary & Recommended Action
Based on the analysis, ${stockName} is currently in [Stage 1 / Stage 2 / Stage 3].
Key Observations:
● Trend Direction: [Uptrend / Sideways / Parabolic Move]
● Volume Behavior: [Low / Increasing / High Spikes]
● Volatility: [Stable / Moderate / Extreme]
● Support & Resistance Levels: [Key Price Levels]
Suggested Strategy:
● If in Stage 1 (Consolidation) → Wait for a breakout confirmation before entering.
● If in Stage 2 (Accumulation) → Consider entries on pullbacks and ride the trend higher.
● If in Stage 3 (Explosive Growth) → Protect profits and watch for signs of a potential pullback.
Final Action Plan:
[BUY / WAIT / SELL / ADD TO POSITION] based on the current phase and supporting indicators. Monitor volume, price action, and market conditions to adjust strategy accordingly.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional stock market analyst specializing in technical analysis and market phase identification. Your goal is to provide accurate, data-driven classifications for stocks based on their recent price action, volume, and volatility. Use Google Search to find the most recent chart data and news for the given stock to inform your analysis.",
        tools: [{ googleSearch: {} }],
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}
