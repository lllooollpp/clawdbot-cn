import type { ModelDefinitionConfig } from "../config/types.js";

export const DEFAULT_MINIMAX_BASE_URL = "https://api.minimax.io/v1";
export const MINIMAX_API_BASE_URL = "https://api.minimax.io/anthropic";
export const MINIMAX_HOSTED_MODEL_ID = "MiniMax-M2.1";
export const MINIMAX_HOSTED_MODEL_REF = `minimax/${MINIMAX_HOSTED_MODEL_ID}`;
export const DEFAULT_MINIMAX_CONTEXT_WINDOW = 200000;
export const DEFAULT_MINIMAX_MAX_TOKENS = 8192;

export const MOONSHOT_BASE_URL = "https://api.moonshot.ai/v1";
export const MOONSHOT_DEFAULT_MODEL_ID = "kimi-k2-0905-preview";
export const MOONSHOT_DEFAULT_MODEL_REF = `moonshot/${MOONSHOT_DEFAULT_MODEL_ID}`;
export const MOONSHOT_DEFAULT_CONTEXT_WINDOW = 256000;
export const MOONSHOT_DEFAULT_MAX_TOKENS = 8192;
export const KIMI_CODE_BASE_URL = "https://api.kimi.com/coding/v1";
export const KIMI_CODE_MODEL_ID = "kimi-for-coding";
export const KIMI_CODE_MODEL_REF = `kimi-code/${KIMI_CODE_MODEL_ID}`;
export const KIMI_CODE_CONTEXT_WINDOW = 262144;
export const KIMI_CODE_MAX_TOKENS = 32768;
export const KIMI_CODE_HEADERS = { "User-Agent": "KimiCLI/0.77" } as const;
export const KIMI_CODE_COMPAT = { supportsDeveloperRole: false } as const;

export const ZAI_DEFAULT_MODEL_REF = "zai/glm-4.7";

export const DEEPSEEK_BASE_URL = "https://api.deepseek.com";
export const DEEPSEEK_DEFAULT_MODEL_ID = "deepseek-chat";
export const DEEPSEEK_DEFAULT_MODEL_REF = `deepseek/${DEEPSEEK_DEFAULT_MODEL_ID}`;
export const DEEPSEEK_DEFAULT_CONTEXT_WINDOW = 64000;
export const DEEPSEEK_DEFAULT_MAX_TOKENS = 8192;

export const SILICONFLOW_BASE_URL = "https://api.siliconflow.cn/v1";
export const SILICONFLOW_DEFAULT_MODEL_ID = "deepseek-ai/DeepSeek-V3";
export const SILICONFLOW_DEFAULT_MODEL_REF = `siliconflow/${SILICONFLOW_DEFAULT_MODEL_ID}`;
export const SILICONFLOW_DEFAULT_CONTEXT_WINDOW = 32000;
export const SILICONFLOW_DEFAULT_MAX_TOKENS = 4096;

export const VOLCENGINE_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3";
export const VOLCENGINE_DEFAULT_MODEL_ID = "ep-xxxxxx"; // Placeholder for endpoint ID
export const VOLCENGINE_DEFAULT_MODEL_REF = `volcengine/${VOLCENGINE_DEFAULT_MODEL_ID}`;
export const VOLCENGINE_DEFAULT_CONTEXT_WINDOW = 128000;
export const VOLCENGINE_DEFAULT_MAX_TOKENS = 4096;

export const OLLAMA_BASE_URL = "http://127.0.0.1:11434/v1";
export const OLLAMA_DEFAULT_MODEL_ID = "qwen2.5:7b-instruct";
export const OLLAMA_DEFAULT_MODEL_REF = `ollama/${OLLAMA_DEFAULT_MODEL_ID}`;
export const OLLAMA_DEFAULT_CONTEXT_WINDOW = 32000;
export const OLLAMA_DEFAULT_MAX_TOKENS = 8192;

// Pricing: MiniMax doesn't publish public rates. Override in models.json for accurate costs.
export const MINIMAX_API_COST = {
  input: 15,
  output: 60,
  cacheRead: 2,
  cacheWrite: 10,
};
export const MINIMAX_HOSTED_COST = {
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
};
export const MINIMAX_LM_STUDIO_COST = {
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
};
export const MOONSHOT_DEFAULT_COST = {
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
};
export const KIMI_CODE_DEFAULT_COST = {
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
};

const MINIMAX_MODEL_CATALOG = {
  "MiniMax-M2.1": { name: "MiniMax M2.1", reasoning: false },
  "MiniMax-M2.1-lightning": {
    name: "MiniMax M2.1 Lightning",
    reasoning: false,
  },
} as const;

type MinimaxCatalogId = keyof typeof MINIMAX_MODEL_CATALOG;

export function buildMinimaxModelDefinition(params: {
  id: string;
  name?: string;
  reasoning?: boolean;
  cost: ModelDefinitionConfig["cost"];
  contextWindow: number;
  maxTokens: number;
}): ModelDefinitionConfig {
  const catalog = MINIMAX_MODEL_CATALOG[params.id as MinimaxCatalogId];
  return {
    id: params.id,
    name: params.name ?? catalog?.name ?? `MiniMax ${params.id}`,
    reasoning: params.reasoning ?? catalog?.reasoning ?? false,
    input: ["text"],
    cost: params.cost,
    contextWindow: params.contextWindow,
    maxTokens: params.maxTokens,
  };
}

export function buildMinimaxApiModelDefinition(modelId: string): ModelDefinitionConfig {
  return buildMinimaxModelDefinition({
    id: modelId,
    cost: MINIMAX_API_COST,
    contextWindow: DEFAULT_MINIMAX_CONTEXT_WINDOW,
    maxTokens: DEFAULT_MINIMAX_MAX_TOKENS,
  });
}

export function buildMoonshotModelDefinition(): ModelDefinitionConfig {
  return {
    id: MOONSHOT_DEFAULT_MODEL_ID,
    name: "Kimi K2 0905 Preview",
    reasoning: false,
    input: ["text"],
    cost: MOONSHOT_DEFAULT_COST,
    contextWindow: MOONSHOT_DEFAULT_CONTEXT_WINDOW,
    maxTokens: MOONSHOT_DEFAULT_MAX_TOKENS,
  };
}

export function buildKimiCodeModelDefinition(): ModelDefinitionConfig {
  return {
    id: KIMI_CODE_MODEL_ID,
    name: "Kimi For Coding",
    reasoning: true,
    input: ["text"],
    cost: KIMI_CODE_DEFAULT_COST,
    contextWindow: KIMI_CODE_CONTEXT_WINDOW,
    maxTokens: KIMI_CODE_MAX_TOKENS,
    headers: KIMI_CODE_HEADERS,
    compat: KIMI_CODE_COMPAT,
  };
}

export function buildDeepSeekModelDefinition(): ModelDefinitionConfig {
  return {
    id: DEEPSEEK_DEFAULT_MODEL_ID,
    name: "DeepSeek V3",
    reasoning: false,
    input: ["text"],
    cost: { input: 1, output: 2, cacheRead: 0.1, cacheWrite: 0.1 },
    contextWindow: DEEPSEEK_DEFAULT_CONTEXT_WINDOW,
    maxTokens: DEEPSEEK_DEFAULT_MAX_TOKENS,
  };
}

export function buildSiliconFlowModelDefinition(): ModelDefinitionConfig {
  return {
    id: SILICONFLOW_DEFAULT_MODEL_ID,
    name: "DeepSeek V3 (SiliconFlow)",
    reasoning: false,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: SILICONFLOW_DEFAULT_CONTEXT_WINDOW,
    maxTokens: SILICONFLOW_DEFAULT_MAX_TOKENS,
  };
}

export function buildVolcengineModelDefinition(modelId?: string): ModelDefinitionConfig {
  const id = modelId ?? VOLCENGINE_DEFAULT_MODEL_ID;
  return {
    id,
    name: `Volcengine (${id})`,
    reasoning: false,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: VOLCENGINE_DEFAULT_CONTEXT_WINDOW,
    maxTokens: VOLCENGINE_DEFAULT_MAX_TOKENS,
  };
}

export function buildOllamaModelDefinition(modelId?: string): ModelDefinitionConfig {
  const id = modelId ?? OLLAMA_DEFAULT_MODEL_ID;
  return {
    id,
    name: `Ollama (${id})`,
    reasoning: false,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: OLLAMA_DEFAULT_CONTEXT_WINDOW,
    maxTokens: OLLAMA_DEFAULT_MAX_TOKENS,
  };
}
