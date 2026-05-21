import { pricing } from "../data/pricing";

type InputTool = {
  name: keyof typeof pricing;
  plan: string;
  seats: number;
  currentSpend: number;
};

export function auditTools(tools: InputTool[]) {
  let totalCurrent = 0;
  let totalOptimized = 0;

  const results = tools.map((tool) => {
    const toolPricing = pricing[tool.name];

    const current = tool.currentSpend;
    totalCurrent += current;

    const suggestedPlan = Object.entries(toolPricing).sort(
      (a, b) => a[1] - b[1]
    )[0];

    const optimized = suggestedPlan ? suggestedPlan[1] * tool.seats : current;

    totalOptimized += optimized;

    const savings = current - optimized;

    return {
      tool: tool.name,
      current,
      optimized,
      savings,
      reason:
        savings > 0
          ? `You are overpaying. Better plan: ${suggestedPlan?.[0]}`
          : "Your plan looks optimized for usage",
    };
  });

  return {
    results,
    totalCurrent,
    totalOptimized,
    totalSavings: totalCurrent - totalOptimized,
  };
}