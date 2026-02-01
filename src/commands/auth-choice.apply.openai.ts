import { loginOpenAICodex } from "@mariozechner/pi-ai";
import { CODEX_CLI_PROFILE_ID, ensureAuthProfileStore } from "../agents/auth-profiles.js";
import { resolveEnvApiKey } from "../agents/model-auth.js";
import { upsertSharedEnvVar } from "../infra/env-file.js";
import { isRemoteEnvironment } from "./oauth-env.js";
import {
  formatApiKeyPreview,
  normalizeApiKeyInput,
  validateApiKeyInput,
} from "./auth-choice.api-key.js";
import type { ApplyAuthChoiceParams, ApplyAuthChoiceResult } from "./auth-choice.apply.js";
import { createVpsAwareOAuthHandlers } from "./oauth-flow.js";
import { applyAuthProfileConfig, writeOAuthCredentials } from "./onboard-auth.js";
import { openUrl } from "./onboard-helpers.js";
import {
  applyOpenAICodexModelDefault,
  OPENAI_CODEX_DEFAULT_MODEL,
} from "./openai-codex-model-default.js";

export async function applyAuthChoiceOpenAI(
  params: ApplyAuthChoiceParams,
): Promise<ApplyAuthChoiceResult | null> {
  let authChoice = params.authChoice;
  if (authChoice === "apiKey" && params.opts?.tokenProvider === "openai") {
    authChoice = "openai-api-key";
  }

  if (authChoice === "openai-api-key") {
    const envKey = resolveEnvApiKey("openai");
    if (envKey) {
      const useExisting = await params.prompter.confirm({
        message: `使用现有的 OPENAI_API_KEY（${envKey.source}，${formatApiKeyPreview(envKey.apiKey)}）吗？`,
        initialValue: true,
      });
      if (useExisting) {
        const result = upsertSharedEnvVar({
          key: "OPENAI_API_KEY",
          value: envKey.apiKey,
        });
        if (!process.env.OPENAI_API_KEY) {
          process.env.OPENAI_API_KEY = envKey.apiKey;
        }
        await params.prompter.note(
          `已将 OPENAI_API_KEY 复制到 ${result.path} 以实现 launchd 兼容性。`,
          "OpenAI API 密钥",
        );
        return { config: params.config };
      }
    }

    let key: string | undefined;
    if (params.opts?.token && params.opts?.tokenProvider === "openai") {
      key = params.opts.token;
    } else {
      key = await params.prompter.text({
        message: "输入 OpenAI API 密钥",
        validate: validateApiKeyInput,
      });
    }

    const trimmed = normalizeApiKeyInput(String(key));
    const result = upsertSharedEnvVar({
      key: "OPENAI_API_KEY",
      value: trimmed,
    });
    process.env.OPENAI_API_KEY = trimmed;
    await params.prompter.note(
      `已将 OPENAI_API_KEY 保存到 ${result.path} 以实现 launchd 兼容性。`,
      "OpenAI API 密钥",
    );
    return { config: params.config };
  }

  if (params.authChoice === "openai-codex") {
    let nextConfig = params.config;
    let agentModelOverride: string | undefined;
    const noteAgentModel = async (model: string) => {
      if (!params.agentId) return;
      await params.prompter.note(
        `代理 "${params.agentId}" 的默认模型已设置为 ${model}。`,
        "模型配置完成",
      );
    };

    const isRemote = isRemoteEnvironment();
    await params.prompter.note(
      isRemote
        ? [
            "您正在远程/VPS 环境中运行。",
            "将显示一个 URL，请在您的本地浏览器中打开它。",
            "登录后，请将重定向 URL 粘贴回此处。",
          ].join("\n")
        : [
            "浏览器将打开以进行 OpenAI 认证。",
            "如果回调没有自动完成，请粘贴重定向 URL。",
            "OpenAI OAuth 使用 localhost:1455 进行回调。",
          ].join("\n"),
      "OpenAI Codex OAuth 授权",
    );
    const spin = params.prompter.progress("正在启动 OAuth 流程…");
    try {
      const { onAuth, onPrompt } = createVpsAwareOAuthHandlers({
        isRemote,
        prompter: params.prompter,
        runtime: params.runtime,
        spin,
        openUrl,
        localBrowserMessage: "请在浏览器中完成登录…",
      });

      const creds = await loginOpenAICodex({
        onAuth,
        onPrompt,
        onProgress: (msg) => spin.update(msg),
      });
      spin.stop("OpenAI OAuth 认证完成");
      if (creds) {
        await writeOAuthCredentials("openai-codex", creds, params.agentDir);
        nextConfig = applyAuthProfileConfig(nextConfig, {
          profileId: "openai-codex:default",
          provider: "openai-codex",
          mode: "oauth",
        });
        if (params.setDefaultModel) {
          const applied = applyOpenAICodexModelDefault(nextConfig);
          nextConfig = applied.next;
          if (applied.changed) {
            await params.prompter.note(
              `默认模型已设置为 ${OPENAI_CODEX_DEFAULT_MODEL}`,
              "模型配置完成",
            );
          }
        } else {
          agentModelOverride = OPENAI_CODEX_DEFAULT_MODEL;
          await noteAgentModel(OPENAI_CODEX_DEFAULT_MODEL);
        }
      }
    } catch (err) {
      spin.stop("OpenAI OAuth 认证失败");
      params.runtime.error(String(err));
      await params.prompter.note(
        "OAuth 遇到问题？请访问 http://101.35.228.254/start/faq",
        "OAuth 帮助",
      );
    }
    return { config: nextConfig, agentModelOverride };
  }

  if (params.authChoice === "codex-cli") {
    let nextConfig = params.config;
    let agentModelOverride: string | undefined;
    const noteAgentModel = async (model: string) => {
      if (!params.agentId) return;
      await params.prompter.note(
        `Default model set to ${model} for agent "${params.agentId}".`,
        "Model configured",
      );
    };

    const store = ensureAuthProfileStore(params.agentDir);
    if (!store.profiles[CODEX_CLI_PROFILE_ID]) {
      await params.prompter.note(
        "在 ~/.codex/auth.json 中未找到 Codex CLI 凭据。",
        "Codex CLI OAuth 授权",
      );
      return { config: nextConfig, agentModelOverride };
    }
    nextConfig = applyAuthProfileConfig(nextConfig, {
      profileId: CODEX_CLI_PROFILE_ID,
      provider: "openai-codex",
      mode: "oauth",
    });
    if (params.setDefaultModel) {
      const applied = applyOpenAICodexModelDefault(nextConfig);
      nextConfig = applied.next;
      if (applied.changed) {
        await params.prompter.note(
          `默认模型已设置为 ${OPENAI_CODEX_DEFAULT_MODEL}`,
          "模型配置完成",
        );
      }
    } else {
      agentModelOverride = OPENAI_CODEX_DEFAULT_MODEL;
      await noteAgentModel(OPENAI_CODEX_DEFAULT_MODEL);
    }
    return { config: nextConfig, agentModelOverride };
  }

  return null;
}
