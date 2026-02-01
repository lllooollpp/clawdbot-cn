import fs from "node:fs/promises";
import path from "node:path";

import { DEFAULT_BOOTSTRAP_FILENAME } from "../agents/workspace.js";
import {
  DEFAULT_GATEWAY_DAEMON_RUNTIME,
  GATEWAY_DAEMON_RUNTIME_OPTIONS,
  type GatewayDaemonRuntime,
} from "../commands/daemon-runtime.js";
import { healthCommand } from "../commands/health.js";
import { formatHealthCheckFailure } from "../commands/health-format.js";
import {
  detectBrowserOpenSupport,
  formatControlUiSshHint,
  openUrl,
  openUrlInBackground,
  probeGatewayReachable,
  waitForGatewayReachable,
  resolveControlUiLinks,
} from "../commands/onboard-helpers.js";
import { formatCliCommand } from "../cli/command-format.js";
import type { OnboardOptions } from "../commands/onboard-types.js";
import type { ClawdbotConfig } from "../config/config.js";
import { resolveGatewayService } from "../daemon/service.js";
import { isSystemdUserServiceAvailable } from "../daemon/systemd.js";
import { ensureControlUiAssetsBuilt } from "../infra/control-ui-assets.js";
import type { RuntimeEnv } from "../runtime.js";
import { runTui } from "../tui/tui.js";
import { resolveUserPath } from "../utils.js";
import {
  buildGatewayInstallPlan,
  gatewayInstallErrorHint,
} from "../commands/daemon-install-helpers.js";
import type { GatewayWizardSettings, WizardFlow } from "./onboarding.types.js";
import type { WizardPrompter } from "./prompts.js";

type FinalizeOnboardingOptions = {
  flow: WizardFlow;
  opts: OnboardOptions;
  baseConfig: ClawdbotConfig;
  nextConfig: ClawdbotConfig;
  workspaceDir: string;
  settings: GatewayWizardSettings;
  prompter: WizardPrompter;
  runtime: RuntimeEnv;
};

export async function finalizeOnboardingWizard(options: FinalizeOnboardingOptions) {
  const { flow, opts, baseConfig, nextConfig, settings, prompter, runtime } = options;

  const withWizardProgress = async <T>(
    label: string,
    options: { doneMessage?: string },
    work: (progress: { update: (message: string) => void }) => Promise<T>,
  ): Promise<T> => {
    const progress = prompter.progress(label);
    try {
      return await work(progress);
    } finally {
      progress.stop(options.doneMessage);
    }
  };

  const systemdAvailable =
    process.platform === "linux" ? await isSystemdUserServiceAvailable() : true;
  if (process.platform === "linux" && !systemdAvailable) {
    await prompter.note("Systemd 用户服务不可用。将跳过驻留检查和系统服务安装。", "Systemd");
  }

  if (process.platform === "linux" && systemdAvailable) {
    const { ensureSystemdUserLingerInteractive } = await import("../commands/systemd-linger.js");
    await ensureSystemdUserLingerInteractive({
      runtime,
      prompter: {
        confirm: prompter.confirm,
        note: prompter.note,
      },
      reason:
        "Linux 安装默认使用 systemd 用户服务。如果不开启驻留（Linger），systemd 在用户注销后会停止服务并关闭网关。",
      requireConfirm: false,
    });
  }

  const explicitInstallDaemon =
    typeof opts.installDaemon === "boolean" ? opts.installDaemon : undefined;
  let installDaemon: boolean;
  if (explicitInstallDaemon !== undefined) {
    installDaemon = explicitInstallDaemon;
  } else if (process.platform === "linux" && !systemdAvailable) {
    installDaemon = false;
  } else if (flow === "quickstart") {
    installDaemon = true;
  } else {
    installDaemon = await prompter.confirm({
      message: "安装网关服务 (Gateway Service, 推荐)",
      initialValue: true,
    });
  }

  if (process.platform === "linux" && !systemdAvailable && installDaemon) {
    await prompter.note(
      "Systemd 用户服务不可用，跳过服务安装。你可以手动使用容器管理器或 `docker compose up -d`。",
      "网关服务",
    );
    installDaemon = false;
  }

  if (installDaemon) {
    const daemonRuntime =
      flow === "quickstart"
        ? (DEFAULT_GATEWAY_DAEMON_RUNTIME as GatewayDaemonRuntime)
        : ((await prompter.select({
            message: "网关服务运行时 (Runtime)",
            options: GATEWAY_DAEMON_RUNTIME_OPTIONS,
            initialValue: opts.daemonRuntime ?? DEFAULT_GATEWAY_DAEMON_RUNTIME,
          })) as GatewayDaemonRuntime);
    if (flow === "quickstart") {
      await prompter.note("快速启动使用 Node 来运行网关服务 (稳定且受支持)。", "网关服务运行时");
    }
    const service = resolveGatewayService();
    const loaded = await service.isLoaded({ env: process.env });
    if (loaded) {
      const action = (await prompter.select({
        message: "检测到网关服务已安装",
        options: [
          { value: "restart", label: "重新启动 (Restart)" },
          { value: "reinstall", label: "重新安装 (Reinstall)" },
          { value: "skip", label: "跳过" },
        ],
      })) as "restart" | "reinstall" | "skip";
      if (action === "restart") {
        await withWizardProgress(
          "网关服务",
          { doneMessage: "网关服务已重启。" },
          async (progress) => {
            progress.update("正在重启网关服务…");
            await service.restart({
              env: process.env,
              stdout: process.stdout,
            });
          },
        );
      } else if (action === "reinstall") {
        await withWizardProgress(
          "网关服务",
          { doneMessage: "网关服务已卸载。" },
          async (progress) => {
            progress.update("正在卸载旧的网关服务…");
            await service.uninstall({ env: process.env, stdout: process.stdout });
          },
        );
      }
    }

    if (!loaded || (loaded && (await service.isLoaded({ env: process.env })) === false)) {
      const progress = prompter.progress("网关服务");
      let installError: string | null = null;
      try {
        progress.update("正在准备网关服务…");
        const { programArguments, workingDirectory, environment } = await buildGatewayInstallPlan({
          env: process.env,
          port: settings.port,
          token: settings.gatewayToken,
          runtime: daemonRuntime,
          warn: (message, title) => prompter.note(message, title),
          config: nextConfig,
        });

        progress.update("正在安装网关服务…");
        await service.install({
          env: process.env,
          stdout: process.stdout,
          programArguments,
          workingDirectory,
          environment,
        });
      } catch (err) {
        installError = err instanceof Error ? err.message : String(err);
      } finally {
        progress.stop(installError ? "网关服务安装失败。" : "网关服务安装成功。");
      }
      if (installError) {
        await prompter.note(`网关服务安装失败：${installError}`, "网关");
        await prompter.note(gatewayInstallErrorHint(), "网关");
      }
    }
  }

  if (!opts.skipHealth) {
    const probeLinks = resolveControlUiLinks({
      bind: nextConfig.gateway?.bind ?? "loopback",
      port: settings.port,
      customBindHost: nextConfig.gateway?.customBindHost,
      basePath: undefined,
    });
    // Daemon install/restart can briefly flap the WS; wait a bit so health check doesn't false-fail.
    await waitForGatewayReachable({
      url: probeLinks.wsUrl,
      token: settings.gatewayToken,
      deadlineMs: 15_000,
    });
    try {
      await healthCommand({ json: false, timeoutMs: 10_000 }, runtime);
    } catch (err) {
      runtime.error(formatHealthCheckFailure(err));
      await prompter.note(
        [
          "文档:",
          "http://101.35.228.254/gateway/health",
          "http://101.35.228.254/gateway/troubleshooting",
        ].join("\n"),
        "健康检查帮助",
      );
    }
  }

  const controlUiEnabled =
    nextConfig.gateway?.controlUi?.enabled ?? baseConfig.gateway?.controlUi?.enabled ?? true;
  if (!opts.skipUi && controlUiEnabled) {
    const controlUiAssets = await ensureControlUiAssetsBuilt(runtime);
    if (!controlUiAssets.ok && controlUiAssets.message) {
      runtime.error(controlUiAssets.message);
    }
  }

  await prompter.note(
    [
      "您可以添加以下节点来获得额外功能：",
      "- macOS 桌面端应用 (系统级控制 + 通知)",
      "- iOS 移动端应用 (相机/画布工具)",
      "- Android 移动端应用 (相机/画布工具)",
    ].join("\n"),
    "可选应用",
  );

  const controlUiBasePath =
    nextConfig.gateway?.controlUi?.basePath ?? baseConfig.gateway?.controlUi?.basePath;
  const links = resolveControlUiLinks({
    bind: settings.bind,
    port: settings.port,
    customBindHost: settings.customBindHost,
    basePath: controlUiBasePath,
  });
  const tokenParam =
    settings.authMode === "token" && settings.gatewayToken
      ? `?token=${encodeURIComponent(settings.gatewayToken)}`
      : "";
  const authedUrl = `${links.httpUrl}${tokenParam}`;
  const gatewayProbe = await probeGatewayReachable({
    url: links.wsUrl,
    token: settings.authMode === "token" ? settings.gatewayToken : undefined,
    password: settings.authMode === "password" ? nextConfig.gateway?.auth?.password : "",
  });
  const gatewayStatusLine = gatewayProbe.ok
    ? "网关状态: 可达 (reachable)"
    : `网关状态: 未检测到${gatewayProbe.detail ? ` (${gatewayProbe.detail})` : ""}`;
  const bootstrapPath = path.join(
    resolveUserPath(options.workspaceDir),
    DEFAULT_BOOTSTRAP_FILENAME,
  );
  const hasBootstrap = await fs
    .access(bootstrapPath)
    .then(() => true)
    .catch(() => false);

  await prompter.note(
    [
      `Web 控制面板: ${links.httpUrl}`,
      tokenParam ? `Web 控制面板 (带令牌): ${authedUrl}` : undefined,
      `网关 WS 地址: ${links.wsUrl}`,
      gatewayStatusLine,
      "文档: http://101.35.228.254/web/control-ui",
    ]
      .filter(Boolean)
      .join("\n"),
    "控制界面 (Control UI)",
  );

  let controlUiOpened = false;
  let controlUiOpenHint: string | undefined;
  let seededInBackground = false;
  let hatchChoice: "tui" | "web" | "later" | null = null;

  if (!opts.skipUi && gatewayProbe.ok) {
    if (hasBootstrap) {
      await prompter.note(
        [
          "这是一个赋予您的智能体灵魂的过程。",
          "请按照提示进行操作。",
          "您告诉它的信息越多，体验就会越好。",
          '我们将发送： "醒醒，我的朋友！"',
        ].join("\n"),
        "启动命令行界面 (TUI, 推荐！)",
      );
    }

    await prompter.note(
      [
        "网关令牌: 网关与控制面板共用的身份凭据。",
        "存储位置: ~/.clawdbot/clawdbot.json (gateway.auth.token) 或环境变量 CLAWDBOT_GATEWAY_TOKEN。",
        "Web 仪表板会在浏览器 localStorage (clawdbot.control.settings.v1) 中存一份副本。",
        `随时获取带有口令的链接： ${formatCliCommand("clawdbot dashboard --no-open")}`,
      ].join("\n"),
      "安全令牌 (Token)",
    );

    hatchChoice = (await prompter.select({
      message: "你想如何启动您的智能体？",
      options: [
        { value: "tui", label: "在终端中启动 (TUI, 推荐)" },
        { value: "web", label: "打开 Web 控制面板" },
        { value: "later", label: "稍后再说" },
      ],
      initialValue: "tui",
    })) as "tui" | "web" | "later";

    if (hatchChoice === "tui") {
      await runTui({
        url: links.wsUrl,
        token: settings.authMode === "token" ? settings.gatewayToken : undefined,
        password: settings.authMode === "password" ? nextConfig.gateway?.auth?.password : "",
        // Safety: onboarding TUI should not auto-deliver to lastProvider/lastTo.
        deliver: false,
        message: hasBootstrap ? "醒醒，我的朋友！" : undefined,
      });
      if (settings.authMode === "token" && settings.gatewayToken) {
        seededInBackground = await openUrlInBackground(authedUrl);
      }
      if (seededInBackground) {
        await prompter.note(
          `Web 控制面板已在后台预加载。稍后可通过以下命令打开： ${formatCliCommand(
            "clawdbot dashboard --no-open",
          )}`,
          "Web 控制面板",
        );
      }
    } else if (hatchChoice === "web") {
      const browserSupport = await detectBrowserOpenSupport();
      if (browserSupport.ok) {
        controlUiOpened = await openUrl(authedUrl);
        if (!controlUiOpened) {
          controlUiOpenHint = formatControlUiSshHint({
            port: settings.port,
            basePath: controlUiBasePath,
            token: settings.gatewayToken,
          });
        }
      } else {
        controlUiOpenHint = formatControlUiSshHint({
          port: settings.port,
          basePath: controlUiBasePath,
          token: settings.gatewayToken,
        });
      }
      await prompter.note(
        [
          `仪表板链接 (带令牌): ${authedUrl}`,
          controlUiOpened
            ? "已在浏览器中打开。请保留该标签页以控制 Clawdbot。"
            : "请将此 URL 复制到浏览器中打开以控制 Clawdbot。",
          controlUiOpenHint,
        ]
          .filter(Boolean)
          .join("\n"),
        "仪表板已就绪",
      );
    } else {
      await prompter.note(
        `准备就绪后再运行： ${formatCliCommand("clawdbot dashboard --no-open")}`,
        "稍后操作",
      );
    }
  } else if (opts.skipUi) {
    await prompter.note("跳过控制界面/命令行界面的提示。", "控制界面");
  }

  await prompter.note(
    ["请备份您的智能体工作区。", "文档: http://101.35.228.254/concepts/agent-workspace"].join("\n"),
    "工作区备份",
  );

  await prompter.note(
    "在您的计算机上运行智能体具有风险 — 请加固您的安全设置: http://101.35.228.254/security",
    "安全性",
  );

  const shouldOpenControlUi =
    !opts.skipUi &&
    settings.authMode === "token" &&
    Boolean(settings.gatewayToken) &&
    hatchChoice === null;
  if (shouldOpenControlUi) {
    const browserSupport = await detectBrowserOpenSupport();
    if (browserSupport.ok) {
      controlUiOpened = await openUrl(authedUrl);
      if (!controlUiOpened) {
        controlUiOpenHint = formatControlUiSshHint({
          port: settings.port,
          basePath: controlUiBasePath,
          token: settings.gatewayToken,
        });
      }
    } else {
      controlUiOpenHint = formatControlUiSshHint({
        port: settings.port,
        basePath: controlUiBasePath,
        token: settings.gatewayToken,
      });
    }

    await prompter.note(
      [
        `仪表板链接 (带令牌): ${authedUrl}`,
        controlUiOpened
          ? "已在浏览器中打开。请保留该标签页以控制 Clawdbot。"
          : "请将此 URL 复制到浏览器中打开以控制 Clawdbot。",
        controlUiOpenHint,
      ]
        .filter(Boolean)
        .join("\n"),
      "仪表板已就绪",
    );
  }

  const webSearchKey = (nextConfig.tools?.web?.search?.apiKey ?? "").trim();
  const webSearchEnv = (process.env.BRAVE_API_KEY ?? "").trim();
  const hasWebSearchKey = Boolean(webSearchKey || webSearchEnv);
  await prompter.note(
    hasWebSearchKey
      ? [
          "联网搜索已启用，您的智能体可以根据需要在网上查找信息。",
          "",
          webSearchKey
            ? "API 密钥：存储在配置中 (tools.web.search.apiKey)。"
            : "API 密钥：通过 BRAVE_API_KEY 环境变量提供（网关环境）。",
          "文档: http://101.35.228.254/tools/web",
        ].join("\n")
      : [
          "如果您希望智能体能够搜索网络，您需要一个 API 密钥。",
          "",
          "Clawdbot 使用 Brave Search 提供 `web_search` 工具。如果没有 Brave Search API 密钥，联网搜索将无法工作。",
          "",
          "交互式配置步骤：",
          `- 运行： ${formatCliCommand("clawdbot configure --section web")}`,
          "- 启用 web_search 并粘贴您的 Brave Search API 密钥",
          "",
          "替代方案：在网关环境变量中设置 BRAVE_API_KEY（无需更改配置文件）。",
          "文档: http://101.35.228.254/tools/web",
        ].join("\n"),
    "联网搜索 (可选)",
  );

  await prompter.note('后续操作： https://clawd.bot/showcase ("大家在用它做什么")。', "后续操作");

  await prompter.outro(
    controlUiOpened
      ? "配置完成。仪表板已随令牌一起打开；请保留该标签页以控制 Clawdbot。"
      : seededInBackground
        ? "配置完成。Web 控制面板已在后台预加载；随时可以通过上面的链接打开。"
        : "配置完成。请使用上面的仪表板链接来控制 Clawdbot。",
  );
}
