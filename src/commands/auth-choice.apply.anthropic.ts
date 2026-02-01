import {
  CLAUDE_CLI_PROFILE_ID,
  ensureAuthProfileStore,
  upsertAuthProfile,
} from "../agents/auth-profiles.js";
import {
  formatApiKeyPreview,
  normalizeApiKeyInput,
  validateApiKeyInput,
} from "./auth-choice.api-key.js";
import type { ApplyAuthChoiceParams, ApplyAuthChoiceResult } from "./auth-choice.apply.js";
import { buildTokenProfileId, validateAnthropicSetupToken } from "./auth-token.js";
import { applyAuthProfileConfig, setAnthropicApiKey } from "./onboard-auth.js";

export async function applyAuthChoiceAnthropic(
  params: ApplyAuthChoiceParams,
): Promise<ApplyAuthChoiceResult | null> {
  if (params.authChoice === "claude-cli") {
    let nextConfig = params.config;
    const store = ensureAuthProfileStore(params.agentDir, {
      allowKeychainPrompt: false,
    });
    const hasClaudeCli = Boolean(store.profiles[CLAUDE_CLI_PROFILE_ID]);
    if (!hasClaudeCli && process.platform === "darwin") {
      await params.prompter.note(
        [
          "macOS 接下来将显示钥匙串 (Keychain) 提示。",
          "请选择“始终允许”，这样 launchd 网关就可以在没有提示的情况下启动。",
          "如果您选择“允许”或“拒绝”，每次重启都会在钥匙串警报处阻塞。",
        ].join("\n"),
        "Claude Code CLI 钥匙串",
      );
      const proceed = await params.prompter.confirm({
        message: "现在检查钥匙串中的 Claude Code CLI 凭据吗？",
        initialValue: true,
      });
      if (!proceed) return { config: nextConfig };
    }

    const storeWithKeychain = hasClaudeCli
      ? store
      : ensureAuthProfileStore(params.agentDir, {
          allowKeychainPrompt: true,
        });

    if (!storeWithKeychain.profiles[CLAUDE_CLI_PROFILE_ID]) {
      if (process.stdin.isTTY) {
        const runNow = await params.prompter.confirm({
          message: "现在运行 `claude setup-token` 吗？",
          initialValue: true,
        });
        if (runNow) {
          const res = await (async () => {
            const { spawnSync } = await import("node:child_process");
            return spawnSync("claude", ["setup-token"], { stdio: "inherit" });
          })();
          if (res.error) {
            await params.prompter.note(
              `运行 claude 失败：${String(res.error)}`,
              "Claude setup-token",
            );
          }
        }
      } else {
        await params.prompter.note("`claude setup-token` 需要交互式 TTY。", "Claude setup-token");
      }

      const refreshed = ensureAuthProfileStore(params.agentDir, {
        allowKeychainPrompt: true,
      });
      if (!refreshed.profiles[CLAUDE_CLI_PROFILE_ID]) {
        await params.prompter.note(
          process.platform === "darwin"
            ? "在钥匙串（“Claude Code-credentials”）或 ~/.claude/.credentials.json 中未找到 Claude Code CLI 凭据。"
            : "在 ~/.claude/.credentials.json 中未找到 Claude Code CLI 凭据。",
          "Claude Code CLI OAuth 授权",
        );
        return { config: nextConfig };
      }
    }
    nextConfig = applyAuthProfileConfig(nextConfig, {
      profileId: CLAUDE_CLI_PROFILE_ID,
      provider: "anthropic",
      mode: "oauth",
    });
    return { config: nextConfig };
  }

  if (params.authChoice === "setup-token" || params.authChoice === "oauth") {
    let nextConfig = params.config;
    await params.prompter.note(
      [
        "这将运行 `claude setup-token` 以创建一个长效 Anthropic 令牌。",
        "需要交互式 TTY 和 Claude Pro/Max 订阅。",
      ].join("\n"),
      "Anthropic setup-token",
    );

    if (!process.stdin.isTTY) {
      await params.prompter.note("`claude setup-token` 需要交互式 TTY。", "Anthropic setup-token");
      return { config: nextConfig };
    }

    const proceed = await params.prompter.confirm({
      message: "现在运行 `claude setup-token` 吗？",
      initialValue: true,
    });
    if (!proceed) return { config: nextConfig };

    const res = await (async () => {
      const { spawnSync } = await import("node:child_process");
      return spawnSync("claude", ["setup-token"], { stdio: "inherit" });
    })();
    if (res.error) {
      await params.prompter.note(`运行 claude 失败：${String(res.error)}`, "Anthropic setup-token");
      return { config: nextConfig };
    }
    if (typeof res.status === "number" && res.status !== 0) {
      await params.prompter.note(
        `claude setup-token 失败（退出代码 ${res.status}）`,
        "Anthropic setup-token",
      );
      return { config: nextConfig };
    }

    const store = ensureAuthProfileStore(params.agentDir, {
      allowKeychainPrompt: true,
    });
    if (!store.profiles[CLAUDE_CLI_PROFILE_ID]) {
      await params.prompter.note(
        `运行 setup-token 后未找到 Claude Code CLI 凭据。预期为 ${CLAUDE_CLI_PROFILE_ID}。`,
        "Anthropic setup-token",
      );
      return { config: nextConfig };
    }

    nextConfig = applyAuthProfileConfig(nextConfig, {
      profileId: CLAUDE_CLI_PROFILE_ID,
      provider: "anthropic",
      mode: "oauth",
    });
    return { config: nextConfig };
  }

  if (params.authChoice === "token") {
    let nextConfig = params.config;
    const provider = (await params.prompter.select({
      message: "令牌提供商",
      options: [{ value: "anthropic", label: "Anthropic (仅支持)" }],
    })) as "anthropic";
    await params.prompter.note(
      ["在终端中运行 `claude setup-token`。", "然后将生成的令牌粘贴在下面。"].join("\n"),
      "Anthropic 令牌",
    );

    const tokenRaw = await params.prompter.text({
      message: "粘贴 Anthropic setup-token",
      validate: (value) => validateAnthropicSetupToken(String(value ?? "")),
    });
    const token = String(tokenRaw).trim();

    const profileNameRaw = await params.prompter.text({
      message: "令牌名称（留空则为 default）",
      placeholder: "default",
    });
    const namedProfileId = buildTokenProfileId({
      provider,
      name: String(profileNameRaw ?? ""),
    });

    upsertAuthProfile({
      profileId: namedProfileId,
      agentDir: params.agentDir,
      credential: {
        type: "token",
        provider,
        token,
      },
    });

    nextConfig = applyAuthProfileConfig(nextConfig, {
      profileId: namedProfileId,
      provider,
      mode: "token",
    });
    return { config: nextConfig };
  }

  if (params.authChoice === "apiKey") {
    if (params.opts?.tokenProvider && params.opts.tokenProvider !== "anthropic") {
      return null;
    }

    let nextConfig = params.config;
    let hasCredential = false;
    const envKey = process.env.ANTHROPIC_API_KEY?.trim();

    if (params.opts?.token) {
      await setAnthropicApiKey(normalizeApiKeyInput(params.opts.token), params.agentDir);
      hasCredential = true;
    }

    if (!hasCredential && envKey) {
      const useExisting = await params.prompter.confirm({
        message: `使用现有的 ANTHROPIC_API_KEY（环境变量，${formatApiKeyPreview(envKey)}）吗？`,
        initialValue: true,
      });
      if (useExisting) {
        await setAnthropicApiKey(envKey, params.agentDir);
        hasCredential = true;
      }
    }
    if (!hasCredential) {
      const key = await params.prompter.text({
        message: "输入 Anthropic API 密钥",
        validate: validateApiKeyInput,
      });
      await setAnthropicApiKey(normalizeApiKeyInput(String(key)), params.agentDir);
    }
    nextConfig = applyAuthProfileConfig(nextConfig, {
      profileId: "anthropic:default",
      provider: "anthropic",
      mode: "api_key",
    });
    return { config: nextConfig };
  }

  return null;
}
