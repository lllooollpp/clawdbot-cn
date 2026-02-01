import { githubCopilotLoginCommand } from "../providers/github-copilot-auth.js";
import type { ApplyAuthChoiceParams, ApplyAuthChoiceResult } from "./auth-choice.apply.js";
import { applyAuthProfileConfig } from "./onboard-auth.js";

export async function applyAuthChoiceGitHubCopilot(
  params: ApplyAuthChoiceParams,
): Promise<ApplyAuthChoiceResult | null> {
  if (params.authChoice !== "github-copilot") return null;

  let nextConfig = params.config;

  await params.prompter.note(
    ["这将打开 GitHub 设备登录以授权 Copilot。", "需要有效的 GitHub Copilot 订阅。"].join("\n"),
    "GitHub Copilot",
  );

  if (!process.stdin.isTTY) {
    await params.prompter.note("GitHub Copilot 登录需要交互式 TTY。", "GitHub Copilot");
    return { config: nextConfig };
  }

  try {
    await githubCopilotLoginCommand({ yes: true }, params.runtime);
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
    const model = "github-copilot/gpt-4o";
    nextConfig = {
      ...nextConfig,
      agents: {
        ...nextConfig.agents,
        defaults: {
          ...nextConfig.agents?.defaults,
          model: {
            ...(typeof nextConfig.agents?.defaults?.model === "object"
              ? nextConfig.agents.defaults.model
              : undefined),
            primary: model,
          },
        },
      },
    };
    await params.prompter.note(`默认模型已设置为 ${model}`, "模型配置完成");
  }

  return { config: nextConfig };
}
