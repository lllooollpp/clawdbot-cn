import { performGitHubCopilotLogin } from "../providers/github-copilot-auth.js";
import type { ApplyAuthChoiceParams, ApplyAuthChoiceResult } from "./auth-choice.apply.js";
import { applyAuthProfileConfig, applyGitHubCopilotConfig } from "./onboard-auth.js";

export async function applyAuthChoiceGitHubCopilot(
  params: ApplyAuthChoiceParams,
): Promise<ApplyAuthChoiceResult | null> {
  if (params.authChoice !== "github-copilot") return null;

  let nextConfig = params.config;

  await params.prompter.note(
    [
      "这将通过 GitHub 设备授权流 (Device Flow) 启用 GitHub Copilot。",
      "需要有效的 GitHub Copilot 订阅。",
      "授权令牌将安全存储在本地（~/.clawdbot/credentials/）并自动刷新。",
    ].join("\n"),
    "GitHub Copilot",
  );

  try {
    await performGitHubCopilotLogin({
      prompter: params.prompter,
      runtime: params.runtime,
      yes: true,
    });
  } catch (err) {
    await params.prompter.note(`GitHub Copilot 登录失败：${String(err)}`, "GitHub Copilot");
    return { config: nextConfig };
  }

  nextConfig = applyAuthProfileConfig(nextConfig, {
    profileId: "github-copilot:github",
    provider: "github-copilot",
    mode: "token",
  });

  if (params.setDefaultModel) {
    nextConfig = applyGitHubCopilotConfig(nextConfig);
    await params.prompter.note("默认模型已设置为 github-copilot/gpt-4.1", "模型配置完成");
  }

  return { config: nextConfig };
}
