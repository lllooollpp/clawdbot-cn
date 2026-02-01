import { resolveEnvApiKey } from "../agents/model-auth.js";
import {
  formatApiKeyPreview,
  normalizeApiKeyInput,
  validateApiKeyInput,
} from "./auth-choice.api-key.js";
import type { ApplyAuthChoiceParams, ApplyAuthChoiceResult } from "./auth-choice.apply.js";
import { applyDefaultModelChoice } from "./auth-choice.default-model.js";
import {
  applyAuthProfileConfig,
  applyMinimaxApiConfig,
  applyMinimaxApiProviderConfig,
  applyMinimaxConfig,
  applyMinimaxProviderConfig,
  setMinimaxApiKey,
} from "./onboard-auth.js";

export async function applyAuthChoiceMiniMax(
  params: ApplyAuthChoiceParams,
): Promise<ApplyAuthChoiceResult | null> {
  let nextConfig = params.config;
  let agentModelOverride: string | undefined;
  const noteAgentModel = async (model: string) => {
    if (!params.agentId) return;
    await params.prompter.note(
      `代理 "${params.agentId}" 的默认模型已设置为 ${model}。`,
      "模型配置完成",
    );
  };

  if (
    params.authChoice === "minimax-cloud" ||
    params.authChoice === "minimax-api" ||
    params.authChoice === "minimax-api-lightning"
  ) {
    const modelId =
      params.authChoice === "minimax-api-lightning" ? "MiniMax-M2.1-lightning" : "MiniMax-M2.1";
    let hasCredential = false;
    const envKey = resolveEnvApiKey("minimax");
    if (envKey) {
      const useExisting = await params.prompter.confirm({
        message: `使用现有的 MINIMAX_API_KEY（${envKey.source}，${formatApiKeyPreview(envKey.apiKey)}）吗？`,
        initialValue: true,
      });
      if (useExisting) {
        await setMinimaxApiKey(envKey.apiKey, params.agentDir);
        hasCredential = true;
      }
    }
    if (!hasCredential) {
      const key = await params.prompter.text({
        message: "输入 MiniMax API 密钥",
        validate: validateApiKeyInput,
      });
      await setMinimaxApiKey(normalizeApiKeyInput(String(key)), params.agentDir);
    }
    nextConfig = applyAuthProfileConfig(nextConfig, {
      profileId: "minimax:default",
      provider: "minimax",
      mode: "api_key",
    });
    {
      const modelRef = `minimax/${modelId}`;
      const applied = await applyDefaultModelChoice({
        config: nextConfig,
        setDefaultModel: params.setDefaultModel,
        defaultModel: modelRef,
        applyDefaultConfig: (config) => applyMinimaxApiConfig(config, modelId),
        applyProviderConfig: (config) => applyMinimaxApiProviderConfig(config, modelId),
        noteAgentModel,
        prompter: params.prompter,
      });
      nextConfig = applied.config;
      agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
    }
    return { config: nextConfig, agentModelOverride };
  }

  if (params.authChoice === "minimax") {
    const applied = await applyDefaultModelChoice({
      config: nextConfig,
      setDefaultModel: params.setDefaultModel,
      defaultModel: "lmstudio/minimax-m2.1-gs32",
      applyDefaultConfig: applyMinimaxConfig,
      applyProviderConfig: applyMinimaxProviderConfig,
      noteAgentModel,
      prompter: params.prompter,
    });
    nextConfig = applied.config;
    agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
    return { config: nextConfig, agentModelOverride };
  }

  return null;
}
