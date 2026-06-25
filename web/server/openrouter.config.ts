/**
 * OpenRouter Configuration for Omni-Agents Studio
 * 
 * This module centralizes all OpenRouter settings for cost-efficient,
 * secure, and reliable multi-agent operations.
 */

import { ENV } from "./_core/env";

// ===== TIER 1: FREE MODELS (Default) =====
export const TIER1_MODELS = {
  GEMINI_FLASH: "google/gemini-2.5-flash",
  LLAMA_8B: "meta/llama-3.1-8b",
  MISTRAL_7B: "mistralai/mistral-7b",
  GROQ_MIXTRAL: "groq/mixtral-8x7b",
  QWEN_3B: "alibaba/qwen-2.5-3b",
} as const;

// ===== TIER 2: MID-TIER PAID MODELS =====
export const TIER2_MODELS = {
  CLAUDE_SONNET: "anthropic/claude-3.5-sonnet",
  GPT_4O: "openai/gpt-4o",
  GEMINI_PRO: "google/gemini-1.5-pro",
  CLAUDE_OPUS: "anthropic/claude-3-opus",
  DEEPSEEK_R1: "deepseek/deepseek-r1",
} as const;

// ===== TIER 3: PREMIUM MODELS (Restricted) =====
export const TIER3_MODELS = {
  GPT_5: "openai/gpt-5",
  CLAUDE_OPUS_PREMIUM: "anthropic/claude-3-opus",
  GEMINI_ULTRA: "google/gemini-2-ultra",
  GPT_5_TURBO: "openai/gpt-5-turbo",
} as const;

// ===== PRESETS =====
export const PRESETS = {
  FAST: {
    name: "Fast Mode",
    description: "Lowest cost, acceptable quality",
    costQualityBalance: 8,
    defaultModel: TIER1_MODELS.GEMINI_FLASH,
    allowedModels: Object.values(TIER1_MODELS),
    temperature: 0.7,
    maxTokens: 1000,
    timeout: 30,
  },
  BALANCED: {
    name: "Balanced Mode",
    description: "Best value, good quality",
    costQualityBalance: 5,
    defaultModel: TIER1_MODELS.GEMINI_FLASH,
    allowedModels: [
      ...Object.values(TIER1_MODELS),
      ...Object.values(TIER2_MODELS),
    ],
    temperature: 0.7,
    maxTokens: 2000,
    timeout: 60,
  },
  QUALITY: {
    name: "Quality Mode",
    description: "Highest accuracy, higher cost",
    costQualityBalance: 2,
    defaultModel: TIER2_MODELS.CLAUDE_SONNET,
    allowedModels: [
      ...Object.values(TIER2_MODELS),
      ...Object.values(TIER3_MODELS),
    ],
    temperature: 0.3,
    maxTokens: 4000,
    timeout: 120,
  },
  CODING: {
    name: "Coding Mode",
    description: "Optimized for code generation",
    costQualityBalance: 3,
    defaultModel: TIER2_MODELS.CLAUDE_SONNET,
    allowedModels: [
      TIER2_MODELS.CLAUDE_SONNET,
      TIER2_MODELS.GPT_4O,
      TIER2_MODELS.DEEPSEEK_R1,
      TIER1_MODELS.LLAMA_8B,
    ],
    temperature: 0.2,
    maxTokens: 4000,
    timeout: 120,
  },
  RESEARCH: {
    name: "Research Mode",
    description: "Large context, deep reasoning",
    costQualityBalance: 2,
    defaultModel: TIER2_MODELS.GEMINI_PRO,
    allowedModels: [
      TIER2_MODELS.GEMINI_PRO,
      TIER2_MODELS.CLAUDE_OPUS,
      TIER3_MODELS.GPT_5_TURBO,
      TIER3_MODELS.GEMINI_ULTRA,
    ],
    temperature: 0.5,
    maxTokens: 8000,
    timeout: 180,
  },
} as const;

// ===== BUDGET CONTROLS =====
export const BUDGET = {
  DAILY_LIMIT: 50, // USD
  MONTHLY_LIMIT: 1000, // USD
  LOW_BALANCE_ALERT: 10, // USD
} as const;

// ===== SECURITY SETTINGS =====
export const SECURITY = {
  ENABLE_ZDR: true, // Zero Data Retention
  ENABLE_GUARDRAILS: true,
  ENABLE_INJECTION_PROTECTION: true,
  ENABLE_SENSITIVE_DATA_DETECTION: true,
  DISABLE_TRAINING_ON_REQUESTS: true,
  DISABLE_PUBLISHING_PROMPTS: true,
} as const;

// ===== TASK COMPLEXITY ROUTING =====
export const TASK_COMPLEXITY_ROUTING = {
  SIMPLE: {
    tier: "TIER1",
    examples: [
      "chat messages",
      "classification",
      "summaries",
      "tagging",
      "extraction",
      "simple Q&A",
      "formatting",
    ],
  },
  MEDIUM: {
    tier: "TIER2",
    examples: [
      "code generation",
      "agent orchestration",
      "RAG queries",
      "tool use",
      "multi-step reasoning",
      "content analysis",
      "workflow planning",
    ],
  },
  COMPLEX: {
    tier: "TIER3",
    examples: [
      "architecture design",
      "critical reasoning",
      "large-context analysis",
      "debugging complex issues",
      "strategic planning",
      "system design",
      "security analysis",
    ],
  },
} as const;

// ===== ENVIRONMENT VARIABLES =====
export const OPENROUTER_CONFIG = {
  API_KEY: process.env.OPENROUTER_API_KEY || "",
  BASE_URL: "https://openrouter.ai/api/v1",
  COST_QUALITY_BALANCE: 5,
  DEFAULT_MODEL: TIER1_MODELS.GEMINI_FLASH,
  FALLBACK_MODEL: TIER1_MODELS.LLAMA_8B,
  DAILY_BUDGET: BUDGET.DAILY_LIMIT,
  MONTHLY_BUDGET: BUDGET.MONTHLY_LIMIT,
  ENABLE_GUARDRAILS: SECURITY.ENABLE_GUARDRAILS,
  ENABLE_ZDR: SECURITY.ENABLE_ZDR,
  ENABLE_INJECTION_PROTECTION: SECURITY.ENABLE_INJECTION_PROTECTION,
} as const;

// ===== HELPER FUNCTIONS =====

/**
 * Select a model based on task complexity
 */
export function selectModelByComplexity(
  complexity: "simple" | "medium" | "complex",
  contextLength: number = 0
): string {
  // Escalate if context is large
  if (contextLength > 100000) {
    return TIER3_MODELS.GEMINI_ULTRA;
  }

  if (contextLength > 8000) {
    return TIER2_MODELS.GEMINI_PRO;
  }

  // Route by complexity
  switch (complexity) {
    case "simple":
      return TIER1_MODELS.GEMINI_FLASH;
    case "medium":
      return TIER2_MODELS.CLAUDE_SONNET;
    case "complex":
      return TIER3_MODELS.GPT_5;
    default:
      return TIER1_MODELS.GEMINI_FLASH;
  }
}

/**
 * Get preset configuration by name
 */
export function getPreset(
  name: keyof typeof PRESETS
): (typeof PRESETS)[keyof typeof PRESETS] {
  return PRESETS[name];
}

/**
 * Validate OpenRouter API key
 */
export function validateOpenRouterConfig(): boolean {
  if (!OPENROUTER_CONFIG.API_KEY) {
    console.error("OPENROUTER_API_KEY is not configured");
    return false;
  }

  if (!OPENROUTER_CONFIG.BASE_URL) {
    console.error("OPENROUTER_BASE_URL is not configured");
    return false;
  }

  return true;
}

/**
 * Get allowed models for a specific tier
 */
export function getAllowedModelsForTier(
  tier: "TIER1" | "TIER2" | "TIER3"
): string[] {
  switch (tier) {
    case "TIER1":
      return Object.values(TIER1_MODELS);
    case "TIER2":
      return Object.values(TIER2_MODELS);
    case "TIER3":
      return Object.values(TIER3_MODELS);
    default:
      return Object.values(TIER1_MODELS);
  }
}

/**
 * Estimate cost for a request
 */
export function estimateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  // Simplified cost estimation (in USD)
  // Actual pricing varies by model and provider
  const costPerMillionInputTokens: { [key: string]: number } = {
    [TIER1_MODELS.GEMINI_FLASH]: 0.075,
    [TIER2_MODELS.CLAUDE_SONNET]: 3,
    [TIER2_MODELS.GPT_4O]: 5,
    [TIER3_MODELS.GPT_5]: 15,
  };

  const costPerMillionOutputTokens: { [key: string]: number } = {
    [TIER1_MODELS.GEMINI_FLASH]: 0.3,
    [TIER2_MODELS.CLAUDE_SONNET]: 15,
    [TIER2_MODELS.GPT_4O]: 15,
    [TIER3_MODELS.GPT_5]: 60,
  };

  const inputCost =
    ((costPerMillionInputTokens[model] || 0) / 1000000) * inputTokens;
  const outputCost =
    ((costPerMillionOutputTokens[model] || 0) / 1000000) * outputTokens;

  return inputCost + outputCost;
}

export default OPENROUTER_CONFIG;
