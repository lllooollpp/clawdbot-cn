import type { ClawdbotConfig } from "../config/config.js";
import type { RuntimeEnv } from "../runtime.js";
import type { WizardPrompter } from "../wizard/prompts.js";
import { buildWorkspaceHookStatus } from "../hooks/hooks-status.js";
import { resolveAgentWorkspaceDir, resolveDefaultAgentId } from "../agents/agent-scope.js";
import { formatCliCommand } from "../cli/command-format.js";

export async function setupInternalHooks(
  cfg: ClawdbotConfig,
  runtime: RuntimeEnv,
  prompter: WizardPrompter,
): Promise<ClawdbotConfig> {
  await prompter.note(
    [
      "Hook 允许你在执行 Agent 命令时自动执行操作。",
      "例如：当执行 /new 时将会话上下文保存到记忆中。",
      "",
      "了解更多：http://101.35.228.254/hooks",
    ].join("\n"),
    "Hook",
  );

  // Discover available hooks using the hook discovery system
  const workspaceDir = resolveAgentWorkspaceDir(cfg, resolveDefaultAgentId(cfg));
  const report = buildWorkspaceHookStatus(workspaceDir, { config: cfg });

  // Show every eligible hook so users can opt in during onboarding.
  const eligibleHooks = report.hooks.filter((h) => h.eligible);

  if (eligibleHooks.length === 0) {
    await prompter.note("未发现符合条件的 Hook。你以后可以在配置中进行设置。", "无可用 Hook");
    return cfg;
  }

  const toEnable = await prompter.multiselect({
    message: "启用 Hook？",
    options: [
      { value: "__skip__", label: "暂时跳过" },
      ...eligibleHooks.map((hook) => ({
        value: hook.name,
        label: `${hook.emoji ?? "🔗"} ${hook.name}`,
        hint: hook.description,
      })),
    ],
  });

  const selected = toEnable.filter((name) => name !== "__skip__");
  if (selected.length === 0) {
    return cfg;
  }

  // Enable selected hooks using the new entries config format
  const entries = { ...cfg.hooks?.internal?.entries };
  for (const name of selected) {
    entries[name] = { enabled: true };
  }

  const next: ClawdbotConfig = {
    ...cfg,
    hooks: {
      ...cfg.hooks,
      internal: {
        enabled: true,
        entries,
      },
    },
  };

  await prompter.note(
    [
      `已启用 ${selected.length} 个 Hook: ${selected.join(", ")}`,
      "",
      "你以后可以使用以下命令管理 Hook：",
      `  ${formatCliCommand("clawdbot hooks list")}`,
      `  ${formatCliCommand("clawdbot hooks enable <name>")}`,
      `  ${formatCliCommand("clawdbot hooks disable <name>")}`,
    ].join("\n"),
    "Hook 已配置",
  );

  return next;
}
