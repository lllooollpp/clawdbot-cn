import type { AuthProfileStore } from "../agents/auth-profiles.js";
import { CLAUDE_CLI_PROFILE_ID, CODEX_CLI_PROFILE_ID } from "../agents/auth-profiles.js";
import { colorize, isRich, theme } from "../terminal/theme.js";
import type { AuthChoice } from "./onboard-types.js";

export type AuthChoiceOption = {
  value: AuthChoice;
  label: string;
  hint?: string;
};

export type AuthChoiceGroupId =
  | "domestic"
  | "openai"
  | "anthropic"
  | "google"
  | "copilot"
  | "openrouter"
  | "ai-gateway"
  | "moonshot"
  | "zai"
  | "opencode-zen"
  | "minimax"
  | "synthetic"
  | "venice"
  | "qwen";

export type AuthChoiceGroup = {
  value: AuthChoiceGroupId;
  label: string;
  hint?: string;
  options: AuthChoiceOption[];
};

const AUTH_CHOICE_GROUP_DEFS: {
  value: AuthChoiceGroupId;
  label: string;
  hint?: string;
  choices: AuthChoice[];
}[] = [
  {
    value: "domestic",
    label: "国内优先 / 本地模型 (Domestic Priority 🇨🇳)",
    hint: "DeepSeek, SiliconFlow, 智谱 AI, 火山引擎, 博查, Ollama",
    choices: [
      "deepseek-api-key",
      "siliconflow-api-key",
      "volcengine-api-key",
      "zhipu-api-key",
      "bocha-api-key",
      "ollama",
    ],
  },
  {
    value: "openai",
    label: "OpenAI",
    hint: "Codex OAuth + API 密钥",
    choices: ["codex-cli", "openai-codex", "openai-api-key"],
  },
  {
    value: "anthropic",
    label: "Anthropic",
    hint: "Claude Code CLI + API 密钥",
    choices: ["token", "claude-cli", "apiKey"],
  },
  {
    value: "minimax",
    label: "MiniMax (海螺 AI)",
    hint: "推荐使用 M2.1",
    choices: ["minimax-api", "minimax-api-lightning"],
  },
  {
    value: "qwen",
    label: "通义千问 (Qwen)",
    hint: "OAuth 授权",
    choices: ["qwen-portal"],
  },
  {
    value: "synthetic",
    label: "Synthetic (合成接口)",
    hint: "兼容 Anthropic 的多模型接口",
    choices: ["synthetic-api-key"],
  },
  {
    value: "venice",
    label: "Venice AI",
    hint: "更注重隐私的模型 (无审查)",
    choices: ["venice-api-key"],
  },
  {
    value: "google",
    label: "Google",
    hint: "Gemini API 密钥 + OAuth",
    choices: ["gemini-api-key", "google-antigravity", "google-gemini-cli"],
  },
  {
    value: "copilot",
    label: "Copilot",
    hint: "GitHub + 本地代理",
    choices: ["github-copilot", "copilot-proxy"],
  },
  {
    value: "openrouter",
    label: "OpenRouter",
    hint: "API 密钥",
    choices: ["openrouter-api-key"],
  },
  {
    value: "ai-gateway",
    label: "Vercel AI Gateway",
    hint: "API 密钥",
    choices: ["ai-gateway-api-key"],
  },
  {
    value: "moonshot",
    label: "Moonshot AI (月之暗面)",
    hint: "Kimi K2 + Kimi Code",
    choices: ["moonshot-api-key", "kimi-code-api-key"],
  },
  {
    value: "zai",
    label: "Z.AI (智谱清言 GLM 4.7)",
    hint: "API 密钥",
    choices: ["zai-api-key"],
  },
  {
    value: "opencode-zen",
    label: "OpenCode Zen",
    hint: "API 密钥",
    choices: ["opencode-zen"],
  },
];

function formatOAuthHint(expires?: number, opts?: { allowStale?: boolean }): string {
  const rich = isRich();
  if (!expires) {
    return colorize(rich, theme.muted, "令牌不可用");
  }
  const now = Date.now();
  const remaining = expires - now;
  if (remaining <= 0) {
    if (opts?.allowStale) {
      return colorize(rich, theme.warn, "令牌已存在 · 使用时刷新");
    }
    return colorize(rich, theme.error, "令牌已过期");
  }
  const minutes = Math.round(remaining / (60 * 1000));
  const duration =
    minutes >= 120
      ? `${Math.round(minutes / 60)}h`
      : minutes >= 60
        ? "1h"
        : `${Math.max(minutes, 1)}m`;
  const label = `令牌正常 · ${duration} 后过期`;
  if (minutes <= 10) {
    return colorize(rich, theme.warn, label);
  }
  return colorize(rich, theme.success, label);
}

export function buildAuthChoiceOptions(params: {
  store: AuthProfileStore;
  includeSkip: boolean;
  includeClaudeCliIfMissing?: boolean;
  platform?: NodeJS.Platform;
}): AuthChoiceOption[] {
  const options: AuthChoiceOption[] = [];
  const platform = params.platform ?? process.platform;

  const codexCli = params.store.profiles[CODEX_CLI_PROFILE_ID];
  if (codexCli?.type === "oauth") {
    options.push({
      value: "codex-cli",
      label: "OpenAI Codex OAuth (Codex CLI)",
      hint: formatOAuthHint(codexCli.expires, { allowStale: true }),
    });
  }

  const claudeCli = params.store.profiles[CLAUDE_CLI_PROFILE_ID];
  if (claudeCli?.type === "oauth" || claudeCli?.type === "token") {
    options.push({
      value: "claude-cli",
      label: "Anthropic 令牌 (Claude Code CLI)",
      hint: `复用现有的 Claude Code 认证 · ${formatOAuthHint(claudeCli.expires)}`,
    });
  } else if (params.includeClaudeCliIfMissing && platform === "darwin") {
    options.push({
      value: "claude-cli",
      label: "Anthropic 令牌 (Claude Code CLI)",
      hint: "复用现有的 Claude Code 认证 · 需要访问钥匙串",
    });
  }

  options.push({
    value: "token",
    label: "Anthropic 令牌 (粘贴 setup-token)",
    hint: "在其他地方运行 `claude setup-token`，然后将得到的令牌粘贴到此处",
  });

  options.push({
    value: "openai-codex",
    label: "OpenAI Codex (ChatGPT OAuth)",
  });
  options.push({ value: "chutes", label: "Chutes (OAuth)" });
  options.push({ value: "openai-api-key", label: "OpenAI API 密钥" });
  options.push({ value: "openrouter-api-key", label: "OpenRouter API 密钥" });
  options.push({
    value: "ai-gateway-api-key",
    label: "Vercel AI Gateway API 密钥",
  });
  options.push({ value: "moonshot-api-key", label: "Moonshot AI (Kimi) API 密钥" });
  options.push({ value: "kimi-code-api-key", label: "Kimi Code API 密钥" });
  options.push({
    value: "deepseek-api-key",
    label: "DeepSeek API 密钥",
    hint: "DeepSeek V3/R1 (国内首选 🇨🇳)",
  });
  options.push({
    value: "siliconflow-api-key",
    label: "SiliconFlow (硅基流动) API 密钥",
    hint: "聚合国内主流开源模型 (🇨🇳)",
  });
  options.push({
    value: "volcengine-api-key",
    label: "Volcengine Ark (火山引擎方舟) 🇨🇳",
    hint: "字节跳动 Ark 平台 (豆包/Doubao 系列模型)",
  });
  options.push({
    value: "zhipu-api-key",
    label: "Zhipu AI (智谱清言) API 密钥 🇨🇳",
    hint: "GLM-4 系列模型 (国产 LLM 标杆)",
  });
  options.push({
    value: "bocha-api-key",
    label: "Bocha Search (博查搜索) API 密钥 🇨🇳",
    hint: "国内联网搜索替代方案",
  });
  options.push({
    value: "ollama",
    label: "Ollama (本地大模型 🏠)",
    hint: "在您自己的机器上运行开源模型",
  });
  options.push({ value: "synthetic-api-key", label: "Synthetic API 密钥" });
  options.push({
    value: "venice-api-key",
    label: "Venice AI API 密钥",
    hint: "注重隐私的推理 (无审查模型)",
  });
  options.push({
    value: "github-copilot",
    label: "GitHub Copilot (设备登录授权)",
    hint: "使用 GitHub Device 认证流程",
  });
  options.push({ value: "gemini-api-key", label: "Google Gemini API 密钥" });
  options.push({
    value: "google-antigravity",
    label: "Google Antigravity OAuth",
    hint: "使用内置的 Antigravity 认证插件",
  });
  options.push({
    value: "google-gemini-cli",
    label: "Google Gemini CLI OAuth",
    hint: "使用内置的 Gemini CLI 认证插件",
  });
  options.push({ value: "zai-api-key", label: "Z.AI (GLM 4.7) API 密钥" });
  options.push({ value: "qwen-portal", label: "通义千问 (Qwen) OAuth" });
  options.push({
    value: "copilot-proxy",
    label: "Copilot 代理 (本地)",
    hint: "VS Code Copilot 模型的本地代理",
  });
  options.push({ value: "apiKey", label: "Anthropic API 密钥" });
  // Token flow is currently Anthropic-only; use CLI for advanced providers.
  options.push({
    value: "opencode-zen",
    label: "OpenCode Zen (多模型代理)",
    hint: "通过 opencode.ai/zen 访问 Claude, GPT, Gemini",
  });
  options.push({ value: "minimax-api", label: "MiniMax M2.1" });
  options.push({
    value: "minimax-api-lightning",
    label: "MiniMax M2.1 Lightning",
    hint: "更快的响应，更高的输出成本",
  });
  if (params.includeSkip) {
    options.push({ value: "skip", label: "暂不设置" });
  }

  return options;
}

export function buildAuthChoiceGroups(params: {
  store: AuthProfileStore;
  includeSkip: boolean;
  includeClaudeCliIfMissing?: boolean;
  platform?: NodeJS.Platform;
}): {
  groups: AuthChoiceGroup[];
  skipOption?: AuthChoiceOption;
} {
  const options = buildAuthChoiceOptions({
    ...params,
    includeSkip: false,
  });
  const optionByValue = new Map<AuthChoice, AuthChoiceOption>(
    options.map((opt) => [opt.value, opt]),
  );

  const groups = AUTH_CHOICE_GROUP_DEFS.map((group) => ({
    ...group,
    options: group.choices
      .map((choice) => optionByValue.get(choice))
      .filter((opt): opt is AuthChoiceOption => Boolean(opt)),
  }));

  const skipOption = params.includeSkip
    ? ({ value: "skip", label: "暂不设置" } satisfies AuthChoiceOption)
    : undefined;

  return { groups, skipOption };
}
