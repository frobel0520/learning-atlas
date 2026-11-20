// Learning Atlas（學習總入口）與其他平行學習站。總入口可用 VITE_HUB_URL 覆蓋。

export const HUB_URL: string = import.meta.env.VITE_HUB_URL ?? "https://frobel0520.github.io/learning-atlas/";

export const PEER_SITES = {
  softwareEngineering: {
    title: "Software Engineering Workshop",
    url: "https://frobel0520.github.io/learning-atlas/software-engineering-workshop/",
  },
  guardrail: {
    title: "Guardrail Workshop",
    url: "https://frobel0520.github.io/learning-atlas/guardrail-workshop/",
  },
  agent: {
    title: "AI Agent Tutorial",
    url: "https://frobel0520.github.io/learning-atlas/AI-Agent-Tutorial/",
  },
} as const;
