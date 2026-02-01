import { ensureAuthProfileStore, resolveAuthProfileOrder } from "../agents/auth-profiles.js";
import { resolveEnvApiKey } from "../agents/model-auth.js";
import {
  formatApiKeyPreview,
  normalizeApiKeyInput,
  validateApiKeyInput,
} from "./auth-choice.api-key.js";
import type { ApplyAuthChoiceParams, ApplyAuthChoiceResult } from "./auth-choice.apply.js";
import { applyDefaultModelChoice } from "./auth-choice.default-model.js";
import {
  applyGoogleGeminiModelDefault,
  GOOGLE_GEMINI_DEFAULT_MODEL,
} from "./google-gemini-model-default.js";
import {
  applyAuthProfileConfig,
  applyKimiCodeConfig,
  applyKimiCodeProviderConfig,
  applyMoonshotConfig,
  applyMoonshotProviderConfig,
  applyOpencodeZenConfig,
  applyOpencodeZenProviderConfig,
  applyOpenrouterConfig,
  applyOpenrouterProviderConfig,
  applyDeepSeekConfig,
  applyDeepSeekProviderConfig,
  applySiliconFlowConfig,
  applySiliconFlowProviderConfig,
  applyVolcengineConfig,
  applyVolcengineProviderConfig,
  applyBochaConfig,
  applyOllamaConfig,
  applyZhipuConfig,
  applyZhipuProviderConfig,
  applyDomesticMediaDefaults,
  applySyntheticConfig,
  applySyntheticProviderConfig,
  applyVeniceConfig,
  applyVeniceProviderConfig,
  applyVercelAiGatewayConfig,
  applyVercelAiGatewayProviderConfig,
  applyZaiConfig,
  KIMI_CODE_MODEL_REF,
  MOONSHOT_DEFAULT_MODEL_REF,
  OPENROUTER_DEFAULT_MODEL_REF,
  DEEPSEEK_DEFAULT_MODEL_REF,
  SILICONFLOW_DEFAULT_MODEL_REF,
  ZHIPU_DEFAULT_MODEL_REF,
  SYNTHETIC_DEFAULT_MODEL_REF,
  VENICE_DEFAULT_MODEL_REF,
  VERCEL_AI_GATEWAY_DEFAULT_MODEL_REF,
  setGeminiApiKey,
  setKimiCodeApiKey,
  setMoonshotApiKey,
  setOpencodeZenApiKey,
  setOpenrouterApiKey,
  setDeepSeekApiKey,
  setSiliconFlowApiKey,
  setVolcengineApiKey,
  setBochaApiKey,
  setZhipuApiKey,
  setSyntheticApiKey,
  setVeniceApiKey,
  setVercelAiGatewayApiKey,
  setZaiApiKey,
  ZAI_DEFAULT_MODEL_REF,
} from "./onboard-auth.js";
import { OPENCODE_ZEN_DEFAULT_MODEL } from "./opencode-zen-model-default.js";

export async function applyAuthChoiceApiProviders(
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

  let authChoice = params.authChoice;
  if (
    authChoice === "apiKey" &&
    params.opts?.tokenProvider &&
    params.opts.tokenProvider !== "anthropic" &&
    params.opts.tokenProvider !== "openai"
  ) {
    if (params.opts.tokenProvider === "openrouter") {
      authChoice = "openrouter-api-key";
    } else if (params.opts.tokenProvider === "vercel-ai-gateway") {
      authChoice = "ai-gateway-api-key";
    } else if (params.opts.tokenProvider === "moonshot") {
      authChoice = "moonshot-api-key";
    } else if (params.opts.tokenProvider === "kimi-code") {
      authChoice = "kimi-code-api-key";
    } else if (params.opts.tokenProvider === "google") {
      authChoice = "gemini-api-key";
    } else if (params.opts.tokenProvider === "deepseek") {
      authChoice = "deepseek-api-key";
    } else if (params.opts.tokenProvider === "siliconflow") {
      authChoice = "siliconflow-api-key";
    } else if (params.opts.tokenProvider === "volcengine") {
      authChoice = "volcengine-api-key";
    } else if (params.opts.tokenProvider === "bocha") {
      authChoice = "bocha-api-key";
    } else if (params.opts.tokenProvider === "zhipu") {
      authChoice = "zhipu-api-key";
    } else if (params.opts.tokenProvider === "ollama") {
      authChoice = "ollama";
    } else if (params.opts.tokenProvider === "zai") {
      authChoice = "zai-api-key";
    } else if (params.opts.tokenProvider === "synthetic") {
      authChoice = "synthetic-api-key";
    } else if (params.opts.tokenProvider === "venice") {
      authChoice = "venice-api-key";
    } else if (params.opts.tokenProvider === "opencode") {
      authChoice = "opencode-zen";
    }
  }

  if (authChoice === "openrouter-api-key") {
    const store = ensureAuthProfileStore(params.agentDir, {
      allowKeychainPrompt: false,
    });
    const profileOrder = resolveAuthProfileOrder({
      cfg: nextConfig,
      store,
      provider: "openrouter",
    });
    const existingProfileId = profileOrder.find((profileId) => Boolean(store.profiles[profileId]));
    const existingCred = existingProfileId ? store.profiles[existingProfileId] : undefined;
    let profileId = "openrouter:default";
    let mode: "api_key" | "oauth" | "token" = "api_key";
    let hasCredential = false;

    if (existingProfileId && existingCred?.type) {
      profileId = existingProfileId;
      mode =
        existingCred.type === "oauth"
          ? "oauth"
          : existingCred.type === "token"
            ? "token"
            : "api_key";
      hasCredential = true;
    }

    if (!hasCredential && params.opts?.token && params.opts?.tokenProvider === "openrouter") {
      await setOpenrouterApiKey(normalizeApiKeyInput(params.opts.token), params.agentDir);
      hasCredential = true;
    }

    if (!hasCredential) {
      const envKey = resolveEnvApiKey("openrouter");
      if (envKey) {
        const useExisting = await params.prompter.confirm({
          message: `使用现有的 OPENROUTER_API_KEY（${envKey.source}，${formatApiKeyPreview(envKey.apiKey)}）吗？`,
          initialValue: true,
        });
        if (useExisting) {
          await setOpenrouterApiKey(envKey.apiKey, params.agentDir);
          hasCredential = true;
        }
      }
    }

    if (!hasCredential) {
      const key = await params.prompter.text({
        message: "输入 OpenRouter API 密钥",
        validate: validateApiKeyInput,
      });
      await setOpenrouterApiKey(normalizeApiKeyInput(String(key)), params.agentDir);
      hasCredential = true;
    }

    if (hasCredential) {
      nextConfig = applyAuthProfileConfig(nextConfig, {
        profileId,
        provider: "openrouter",
        mode,
      });
    }
    {
      const applied = await applyDefaultModelChoice({
        config: nextConfig,
        setDefaultModel: params.setDefaultModel,
        defaultModel: OPENROUTER_DEFAULT_MODEL_REF,
        applyDefaultConfig: applyOpenrouterConfig,
        applyProviderConfig: applyOpenrouterProviderConfig,
        noteDefault: OPENROUTER_DEFAULT_MODEL_REF,
        noteAgentModel,
        prompter: params.prompter,
      });
      nextConfig = applied.config;
      agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
    }
    return { config: nextConfig, agentModelOverride };
  }

  if (authChoice === "ai-gateway-api-key") {
    let hasCredential = false;

    if (
      !hasCredential &&
      params.opts?.token &&
      params.opts?.tokenProvider === "vercel-ai-gateway"
    ) {
      await setVercelAiGatewayApiKey(normalizeApiKeyInput(params.opts.token), params.agentDir);
      hasCredential = true;
    }

    const envKey = resolveEnvApiKey("vercel-ai-gateway");
    if (envKey) {
      const useExisting = await params.prompter.confirm({
        message: `使用现有的 AI_GATEWAY_API_KEY（${envKey.source}，${formatApiKeyPreview(envKey.apiKey)}）吗？`,
        initialValue: true,
      });
      if (useExisting) {
        await setVercelAiGatewayApiKey(envKey.apiKey, params.agentDir);
        hasCredential = true;
      }
    }
    if (!hasCredential) {
      const key = await params.prompter.text({
        message: "输入 Vercel AI Gateway API 密钥",
        validate: validateApiKeyInput,
      });
      await setVercelAiGatewayApiKey(normalizeApiKeyInput(String(key)), params.agentDir);
    }
    nextConfig = applyAuthProfileConfig(nextConfig, {
      profileId: "vercel-ai-gateway:default",
      provider: "vercel-ai-gateway",
      mode: "api_key",
    });
    {
      const applied = await applyDefaultModelChoice({
        config: nextConfig,
        setDefaultModel: params.setDefaultModel,
        defaultModel: VERCEL_AI_GATEWAY_DEFAULT_MODEL_REF,
        applyDefaultConfig: applyVercelAiGatewayConfig,
        applyProviderConfig: applyVercelAiGatewayProviderConfig,
        noteDefault: VERCEL_AI_GATEWAY_DEFAULT_MODEL_REF,
        noteAgentModel,
        prompter: params.prompter,
      });
      nextConfig = applied.config;
      agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
    }
    return { config: nextConfig, agentModelOverride };
  }

  if (authChoice === "moonshot-api-key") {
    let hasCredential = false;

    if (!hasCredential && params.opts?.token && params.opts?.tokenProvider === "moonshot") {
      await setMoonshotApiKey(normalizeApiKeyInput(params.opts.token), params.agentDir);
      hasCredential = true;
    }

    const envKey = resolveEnvApiKey("moonshot");
    if (envKey) {
      const useExisting = await params.prompter.confirm({
        message: `使用现有的 MOONSHOT_API_KEY（${envKey.source}，${formatApiKeyPreview(envKey.apiKey)}）吗？`,
        initialValue: true,
      });
      if (useExisting) {
        await setMoonshotApiKey(envKey.apiKey, params.agentDir);
        hasCredential = true;
      }
    }
    if (!hasCredential) {
      const key = await params.prompter.text({
        message: "输入 Moonshot API 密钥",
        validate: validateApiKeyInput,
      });
      await setMoonshotApiKey(normalizeApiKeyInput(String(key)), params.agentDir);
    }
    nextConfig = applyAuthProfileConfig(nextConfig, {
      profileId: "moonshot:default",
      provider: "moonshot",
      mode: "api_key",
    });
    {
      const applied = await applyDefaultModelChoice({
        config: nextConfig,
        setDefaultModel: params.setDefaultModel,
        defaultModel: MOONSHOT_DEFAULT_MODEL_REF,
        applyDefaultConfig: applyMoonshotConfig,
        applyProviderConfig: applyMoonshotProviderConfig,
        noteAgentModel,
        prompter: params.prompter,
      });
      nextConfig = applied.config;
      agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
    }
    return { config: nextConfig, agentModelOverride };
  }

  if (authChoice === "kimi-code-api-key") {
    let hasCredential = false;
    if (!hasCredential && params.opts?.token && params.opts?.tokenProvider === "kimi-code") {
      await setKimiCodeApiKey(normalizeApiKeyInput(params.opts.token), params.agentDir);
      hasCredential = true;
    }

    if (!hasCredential) {
      await params.prompter.note(
        [
          "Kimi Code 使用专用的端点和 API 密钥。",
          "在此处获取 API 密钥：https://www.kimi.com/code/zh (中文版: https://kimi.moonshot.cn)",
        ].join("\n"),
        "Kimi Code",
      );
    }
    const envKey = resolveEnvApiKey("kimi-code");
    if (envKey) {
      const useExisting = await params.prompter.confirm({
        message: `使用现有的 KIMICODE_API_KEY（${envKey.source}，${formatApiKeyPreview(envKey.apiKey)}）吗？`,
        initialValue: true,
      });
      if (useExisting) {
        await setKimiCodeApiKey(envKey.apiKey, params.agentDir);
        hasCredential = true;
      }
    }
    if (!hasCredential) {
      const key = await params.prompter.text({
        message: "输入 Kimi Code API 密钥",
        validate: validateApiKeyInput,
      });
      await setKimiCodeApiKey(normalizeApiKeyInput(String(key)), params.agentDir);
    }
    nextConfig = applyAuthProfileConfig(nextConfig, {
      profileId: "kimi-code:default",
      provider: "kimi-code",
      mode: "api_key",
    });
    {
      const applied = await applyDefaultModelChoice({
        config: nextConfig,
        setDefaultModel: params.setDefaultModel,
        defaultModel: KIMI_CODE_MODEL_REF,
        applyDefaultConfig: applyKimiCodeConfig,
        applyProviderConfig: applyKimiCodeProviderConfig,
        noteDefault: KIMI_CODE_MODEL_REF,
        noteAgentModel,
        prompter: params.prompter,
      });
      nextConfig = applied.config;
      agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
    }
    return { config: nextConfig, agentModelOverride };
  }

  if (authChoice === "deepseek-api-key") {
    let hasCredential = false;

    if (!hasCredential && params.opts?.token && params.opts?.tokenProvider === "deepseek") {
      await setDeepSeekApiKey(normalizeApiKeyInput(params.opts.token), params.agentDir);
      hasCredential = true;
    }

    const envKey = resolveEnvApiKey("deepseek");
    if (envKey) {
      const useExisting = await params.prompter.confirm({
        message: `使用现有的 DEEPSEEK_API_KEY（${envKey.source}，${formatApiKeyPreview(envKey.apiKey)}）吗？`,
        initialValue: true,
      });
      if (useExisting) {
        await setDeepSeekApiKey(envKey.apiKey, params.agentDir);
        hasCredential = true;
      }
    }
    if (!hasCredential) {
      const key = await params.prompter.text({
        message: "输入 DeepSeek API 密钥",
        validate: validateApiKeyInput,
      });
      await setDeepSeekApiKey(normalizeApiKeyInput(String(key)), params.agentDir);
    }
    nextConfig = applyAuthProfileConfig(nextConfig, {
      profileId: "deepseek:default",
      provider: "deepseek",
      mode: "api_key",
    });
    nextConfig = applyDomesticMediaDefaults(nextConfig);
    {
      const applied = await applyDefaultModelChoice({
        config: nextConfig,
        setDefaultModel: params.setDefaultModel,
        defaultModel: DEEPSEEK_DEFAULT_MODEL_REF,
        applyDefaultConfig: applyDeepSeekConfig,
        applyProviderConfig: applyDeepSeekProviderConfig,
        noteDefault: DEEPSEEK_DEFAULT_MODEL_REF,
        noteAgentModel,
        prompter: params.prompter,
      });
      nextConfig = applied.config;
      agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
    }
    return { config: nextConfig, agentModelOverride };
  }

  if (authChoice === "siliconflow-api-key") {
    let hasCredential = false;

    if (!hasCredential && params.opts?.token && params.opts?.tokenProvider === "siliconflow") {
      await setSiliconFlowApiKey(normalizeApiKeyInput(params.opts.token), params.agentDir);
      hasCredential = true;
    }

    const envKey = resolveEnvApiKey("siliconflow");
    if (envKey) {
      const useExisting = await params.prompter.confirm({
        message: `使用现有的 SILICONFLOW_API_KEY（${envKey.source}，${formatApiKeyPreview(envKey.apiKey)}）吗？`,
        initialValue: true,
      });
      if (useExisting) {
        await setSiliconFlowApiKey(envKey.apiKey, params.agentDir);
        hasCredential = true;
      }
    }
    if (!hasCredential) {
      const key = await params.prompter.text({
        message: "输入 SiliconFlow API 密钥",
        validate: validateApiKeyInput,
      });
      await setSiliconFlowApiKey(normalizeApiKeyInput(String(key)), params.agentDir);
    }
    nextConfig = applyAuthProfileConfig(nextConfig, {
      profileId: "siliconflow:default",
      provider: "siliconflow",
      mode: "api_key",
    });
    nextConfig = applyDomesticMediaDefaults(nextConfig);
    {
      const applied = await applyDefaultModelChoice({
        config: nextConfig,
        setDefaultModel: params.setDefaultModel,
        defaultModel: SILICONFLOW_DEFAULT_MODEL_REF,
        applyDefaultConfig: applySiliconFlowConfig,
        applyProviderConfig: applySiliconFlowProviderConfig,
        noteDefault: SILICONFLOW_DEFAULT_MODEL_REF,
        noteAgentModel,
        prompter: params.prompter,
      });
      nextConfig = applied.config;
      agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
    }
    return { config: nextConfig, agentModelOverride };
  }

  if (authChoice === "volcengine-api-key") {
    let hasCredential = false;

    if (!hasCredential && params.opts?.token && params.opts?.tokenProvider === "volcengine") {
      await setVolcengineApiKey(normalizeApiKeyInput(params.opts.token), params.agentDir);
      hasCredential = true;
    }

    const envKey = resolveEnvApiKey("volcengine");
    if (envKey) {
      const useExisting = await params.prompter.confirm({
        message: `使用现有的 VOLCENGINE_API_KEY（${envKey.source}，${formatApiKeyPreview(envKey.apiKey)}）吗？`,
        initialValue: true,
      });
      if (useExisting) {
        await setVolcengineApiKey(envKey.apiKey, params.agentDir);
        hasCredential = true;
      }
    }
    if (!hasCredential) {
      const key = await params.prompter.text({
        message: "输入火山引擎 (Volcengine) API 密钥",
        validate: validateApiKeyInput,
      });
      await setVolcengineApiKey(normalizeApiKeyInput(String(key)), params.agentDir);
    }
    const modelId = await params.prompter.text({
      message: "输入火山引擎端点 ID (ep-xxxxxx)",
      validate: (v) => (v?.startsWith("ep-") ? undefined : "必须以 ep- 开头"),
    });

    nextConfig = applyAuthProfileConfig(nextConfig, {
      profileId: "volcengine:default",
      provider: "volcengine",
      mode: "api_key",
    });
    nextConfig = applyDomesticMediaDefaults(nextConfig);
    {
      const applied = await applyDefaultModelChoice({
        config: nextConfig,
        setDefaultModel: params.setDefaultModel,
        defaultModel: `volcengine/${modelId}`,
        applyDefaultConfig: (cfg) => applyVolcengineConfig(cfg, { modelId: String(modelId) }),
        applyProviderConfig: (cfg) =>
          applyVolcengineProviderConfig(cfg, { modelId: String(modelId) }),
        noteDefault: `volcengine/${modelId}`,
        noteAgentModel,
        prompter: params.prompter,
      });
      nextConfig = applied.config;
      agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
    }
    return { config: nextConfig, agentModelOverride };
  }

  if (authChoice === "bocha-api-key") {
    let hasCredential = false;
    if (!hasCredential && params.opts?.token && params.opts?.tokenProvider === "bocha") {
      await setBochaApiKey(normalizeApiKeyInput(params.opts.token), params.agentDir);
      hasCredential = true;
    }
    const envKey = resolveEnvApiKey("bocha");
    if (envKey) {
      const useExisting = await params.prompter.confirm({
        message: `使用现有的 BOCHA_API_KEY（${envKey.source}，${formatApiKeyPreview(envKey.apiKey)}）吗？`,
        initialValue: true,
      });
      if (useExisting) {
        await setBochaApiKey(envKey.apiKey, params.agentDir);
        hasCredential = true;
      }
    }
    if (!hasCredential) {
      const key = await params.prompter.text({
        message: "输入博查搜索 (Bocha Search) API 密钥 (🇨🇳)",
        validate: validateApiKeyInput,
      });
      await setBochaApiKey(normalizeApiKeyInput(String(key)), params.agentDir);
    }
    nextConfig = applyBochaConfig(nextConfig);
    nextConfig = applyDomesticMediaDefaults(nextConfig);
    await params.prompter.note("博查搜索已配置为主要网页搜索提供商。", "搜索配置完成");
    // Since Bocha is for search, we still need a reasoning model.
    // If we don't have one, we default to DeepSeek as it's the best domestic alternative.
    const hasDeepSeek =
      Boolean(resolveEnvApiKey("deepseek")) ||
      Boolean(nextConfig.auth?.profiles?.["deepseek:default"]);
    if (!hasDeepSeek) {
      await params.prompter.note(
        "搜索配置完成。现在让我们设置推理模型（推荐 DeepSeek）。",
        "模型设置",
      );
      // We'll recurse or just transition to DeepSeek
      return applyAuthChoiceApiProviders({ ...params, authChoice: "deepseek-api-key" });
    }
    return { config: nextConfig };
  }

  if (authChoice === "zhipu-api-key") {
    let hasCredential = false;
    if (!hasCredential && params.opts?.token && params.opts?.tokenProvider === "zhipu") {
      await setZhipuApiKey(normalizeApiKeyInput(params.opts.token), params.agentDir);
      hasCredential = true;
    }
    const envKey = resolveEnvApiKey("zhipu");
    if (envKey) {
      const useExisting = await params.prompter.confirm({
        message: `使用现有的 ZHIPU_API_KEY（${envKey.source}，${formatApiKeyPreview(envKey.apiKey)}）吗？`,
        initialValue: true,
      });
      if (useExisting) {
        await setZhipuApiKey(envKey.apiKey, params.agentDir);
        hasCredential = true;
      }
    }
    if (!hasCredential) {
      const key = await params.prompter.text({
        message: "输入智谱 AI API 密钥 (🇨🇳)",
        validate: validateApiKeyInput,
      });
      await setZhipuApiKey(normalizeApiKeyInput(String(key)), params.agentDir);
    }
    nextConfig = applyAuthProfileConfig(nextConfig, {
      profileId: "zhipu:default",
      provider: "zhipu",
      mode: "api_key",
    });
    nextConfig = applyDomesticMediaDefaults(nextConfig);
    {
      const applied = await applyDefaultModelChoice({
        config: nextConfig,
        setDefaultModel: params.setDefaultModel,
        defaultModel: ZHIPU_DEFAULT_MODEL_REF,
        applyDefaultConfig: applyZhipuConfig,
        applyProviderConfig: applyZhipuProviderConfig,
        noteDefault: ZHIPU_DEFAULT_MODEL_REF,
        noteAgentModel,
        prompter: params.prompter,
      });
      nextConfig = applied.config;
      agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
    }
    return { config: nextConfig, agentModelOverride };
  }

  if (authChoice === "ollama") {
    const baseUrl = await params.prompter.text({
      message: "输入 Ollama 基础 URL",
      initialValue: "http://127.0.0.1:11434/v1",
    });
    const modelId = await params.prompter.text({
      message: "输入 Ollama 模型名称",
      initialValue: "qwen2.5:7b-instruct",
    });

    const configParams = {
      baseUrl: String(baseUrl).trim(),
      modelId: String(modelId).trim(),
    };

    nextConfig = applyOllamaConfig(nextConfig, configParams);
    const modelRef = `ollama/${configParams.modelId}`;
    await params.prompter.note(
      `Ollama 已配置，模型为 ${configParams.modelId}。`,
      "本地模型配置完成",
    );

    // Set as default if requested
    if (params.setDefaultModel) {
      nextConfig = applyOllamaConfig(nextConfig, configParams);
    } else {
      agentModelOverride = modelRef;
      await noteAgentModel(modelRef);
    }
    return { config: nextConfig, agentModelOverride };
  }

  if (authChoice === "gemini-api-key") {
    let hasCredential = false;

    if (!hasCredential && params.opts?.token && params.opts?.tokenProvider === "google") {
      await setGeminiApiKey(normalizeApiKeyInput(params.opts.token), params.agentDir);
      hasCredential = true;
    }

    const envKey = resolveEnvApiKey("google");
    if (envKey) {
      const useExisting = await params.prompter.confirm({
        message: `使用现有的 GEMINI_API_KEY（${envKey.source}，${formatApiKeyPreview(envKey.apiKey)}）吗？`,
        initialValue: true,
      });
      if (useExisting) {
        await setGeminiApiKey(envKey.apiKey, params.agentDir);
        hasCredential = true;
      }
    }
    if (!hasCredential) {
      const key = await params.prompter.text({
        message: "输入 Gemini API 密钥",
        validate: validateApiKeyInput,
      });
      await setGeminiApiKey(normalizeApiKeyInput(String(key)), params.agentDir);
    }
    nextConfig = applyAuthProfileConfig(nextConfig, {
      profileId: "google:default",
      provider: "google",
      mode: "api_key",
    });
    if (params.setDefaultModel) {
      const applied = applyGoogleGeminiModelDefault(nextConfig);
      nextConfig = applied.next;
      if (applied.changed) {
        await params.prompter.note(
          `默认模型已设置为 ${GOOGLE_GEMINI_DEFAULT_MODEL}`,
          "模型配置完成",
        );
      }
    } else {
      agentModelOverride = GOOGLE_GEMINI_DEFAULT_MODEL;
      await noteAgentModel(GOOGLE_GEMINI_DEFAULT_MODEL);
    }
    return { config: nextConfig, agentModelOverride };
  }

  if (authChoice === "zai-api-key") {
    let hasCredential = false;

    if (!hasCredential && params.opts?.token && params.opts?.tokenProvider === "zai") {
      await setZaiApiKey(normalizeApiKeyInput(params.opts.token), params.agentDir);
      hasCredential = true;
    }

    const envKey = resolveEnvApiKey("zai");
    if (envKey) {
      const useExisting = await params.prompter.confirm({
        message: `使用现有的 ZAI_API_KEY（${envKey.source}，${formatApiKeyPreview(envKey.apiKey)}）吗？`,
        initialValue: true,
      });
      if (useExisting) {
        await setZaiApiKey(envKey.apiKey, params.agentDir);
        hasCredential = true;
      }
    }
    if (!hasCredential) {
      const key = await params.prompter.text({
        message: "输入 Z.AI API 密钥",
        validate: validateApiKeyInput,
      });
      await setZaiApiKey(normalizeApiKeyInput(String(key)), params.agentDir);
    }
    nextConfig = applyAuthProfileConfig(nextConfig, {
      profileId: "zai:default",
      provider: "zai",
      mode: "api_key",
    });
    {
      const applied = await applyDefaultModelChoice({
        config: nextConfig,
        setDefaultModel: params.setDefaultModel,
        defaultModel: ZAI_DEFAULT_MODEL_REF,
        applyDefaultConfig: applyZaiConfig,
        applyProviderConfig: (config) => ({
          ...config,
          agents: {
            ...config.agents,
            defaults: {
              ...config.agents?.defaults,
              models: {
                ...config.agents?.defaults?.models,
                [ZAI_DEFAULT_MODEL_REF]: {
                  ...config.agents?.defaults?.models?.[ZAI_DEFAULT_MODEL_REF],
                  alias: config.agents?.defaults?.models?.[ZAI_DEFAULT_MODEL_REF]?.alias ?? "GLM",
                },
              },
            },
          },
        }),
        noteDefault: ZAI_DEFAULT_MODEL_REF,
        noteAgentModel,
        prompter: params.prompter,
      });
      nextConfig = applied.config;
      agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
    }
    return { config: nextConfig, agentModelOverride };
  }

  if (authChoice === "synthetic-api-key") {
    if (params.opts?.token && params.opts?.tokenProvider === "synthetic") {
      await setSyntheticApiKey(String(params.opts.token).trim(), params.agentDir);
    } else {
      const key = await params.prompter.text({
        message: "输入 Synthetic API 密钥",
        validate: (value) => (value?.trim() ? undefined : "必填"),
      });
      await setSyntheticApiKey(String(key).trim(), params.agentDir);
    }
    nextConfig = applyAuthProfileConfig(nextConfig, {
      profileId: "synthetic:default",
      provider: "synthetic",
      mode: "api_key",
    });
    {
      const applied = await applyDefaultModelChoice({
        config: nextConfig,
        setDefaultModel: params.setDefaultModel,
        defaultModel: SYNTHETIC_DEFAULT_MODEL_REF,
        applyDefaultConfig: applySyntheticConfig,
        applyProviderConfig: applySyntheticProviderConfig,
        noteDefault: SYNTHETIC_DEFAULT_MODEL_REF,
        noteAgentModel,
        prompter: params.prompter,
      });
      nextConfig = applied.config;
      agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
    }
    return { config: nextConfig, agentModelOverride };
  }

  if (authChoice === "venice-api-key") {
    let hasCredential = false;

    if (!hasCredential && params.opts?.token && params.opts?.tokenProvider === "venice") {
      await setVeniceApiKey(normalizeApiKeyInput(params.opts.token), params.agentDir);
      hasCredential = true;
    }

    if (!hasCredential) {
      await params.prompter.note(
        [
          "Venice AI 提供注重隐私且无审查模型的推理服务。",
          "在此处获取 API 密钥：https://venice.ai/settings/api",
          "支持 'private'（完全私有）和 'anonymized'（匿名代理）模式。",
        ].join("\n"),
        "Venice AI",
      );
    }

    const envKey = resolveEnvApiKey("venice");
    if (envKey) {
      const useExisting = await params.prompter.confirm({
        message: `使用现有的 VENICE_API_KEY（${envKey.source}，${formatApiKeyPreview(envKey.apiKey)}）吗？`,
        initialValue: true,
      });
      if (useExisting) {
        await setVeniceApiKey(envKey.apiKey, params.agentDir);
        hasCredential = true;
      }
    }
    if (!hasCredential) {
      const key = await params.prompter.text({
        message: "输入 Venice AI API 密钥",
        validate: validateApiKeyInput,
      });
      await setVeniceApiKey(normalizeApiKeyInput(String(key)), params.agentDir);
    }
    nextConfig = applyAuthProfileConfig(nextConfig, {
      profileId: "venice:default",
      provider: "venice",
      mode: "api_key",
    });
    {
      const applied = await applyDefaultModelChoice({
        config: nextConfig,
        setDefaultModel: params.setDefaultModel,
        defaultModel: VENICE_DEFAULT_MODEL_REF,
        applyDefaultConfig: applyVeniceConfig,
        applyProviderConfig: applyVeniceProviderConfig,
        noteDefault: VENICE_DEFAULT_MODEL_REF,
        noteAgentModel,
        prompter: params.prompter,
      });
      nextConfig = applied.config;
      agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
    }
    return { config: nextConfig, agentModelOverride };
  }

  if (authChoice === "opencode-zen") {
    let hasCredential = false;
    if (!hasCredential && params.opts?.token && params.opts?.tokenProvider === "opencode") {
      await setOpencodeZenApiKey(normalizeApiKeyInput(params.opts.token), params.agentDir);
      hasCredential = true;
    }

    if (!hasCredential) {
      await params.prompter.note(
        [
          "OpenCode Zen 提供对 Claude, GPT, Gemini 等多种模型的访问。",
          "在此处获取 API 密钥：https://opencode.ai/auth",
          "需要有效的 OpenCode Zen 订阅。",
        ].join("\n"),
        "OpenCode Zen",
      );
    }
    const envKey = resolveEnvApiKey("opencode");
    if (envKey) {
      const useExisting = await params.prompter.confirm({
        message: `使用现有的 OPENCODE_API_KEY（${envKey.source}，${formatApiKeyPreview(envKey.apiKey)}）吗？`,
        initialValue: true,
      });
      if (useExisting) {
        await setOpencodeZenApiKey(envKey.apiKey, params.agentDir);
        hasCredential = true;
      }
    }
    if (!hasCredential) {
      const key = await params.prompter.text({
        message: "输入 OpenCode Zen API 密钥",
        validate: validateApiKeyInput,
      });
      await setOpencodeZenApiKey(normalizeApiKeyInput(String(key)), params.agentDir);
    }
    nextConfig = applyAuthProfileConfig(nextConfig, {
      profileId: "opencode:default",
      provider: "opencode",
      mode: "api_key",
    });
    {
      const applied = await applyDefaultModelChoice({
        config: nextConfig,
        setDefaultModel: params.setDefaultModel,
        defaultModel: OPENCODE_ZEN_DEFAULT_MODEL,
        applyDefaultConfig: applyOpencodeZenConfig,
        applyProviderConfig: applyOpencodeZenProviderConfig,
        noteDefault: OPENCODE_ZEN_DEFAULT_MODEL,
        noteAgentModel,
        prompter: params.prompter,
      });
      nextConfig = applied.config;
      agentModelOverride = applied.agentModelOverride ?? agentModelOverride;
    }
    return { config: nextConfig, agentModelOverride };
  }

  return null;
}
