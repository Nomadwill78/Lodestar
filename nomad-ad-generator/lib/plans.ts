export type PlanId = "free" | "starter" | "pro" | "agency";

export interface Plan {
  name: string;
  price: number;
  generations: number; // per month; -1 = unlimited
  features: string[];
}

export const PLANS: Record<Exclude<PlanId, "free">, Plan> = {
  starter: {
    name: "Starter",
    price: 29,
    generations: 50,
    features: ["50 ad generations/mo", "All funnel stages", "Copy history", "Email support"],
  },
  pro: {
    name: "Pro",
    price: 67,
    generations: 200,
    features: ["200 ad generations/mo", "All funnel stages", "Copy history", "A/B variants", "Priority support"],
  },
  agency: {
    name: "Agency",
    price: 97,
    generations: -1,
    features: [
      "Unlimited generations",
      "All funnel stages",
      "Copy history",
      "A/B variants",
      "White-label exports",
      "Dedicated support",
    ],
  },
};

export const FREE_GENERATIONS = 5;

export function generationLimit(plan: PlanId): number {
  if (plan === "free") return FREE_GENERATIONS;
  return PLANS[plan].generations;
}
