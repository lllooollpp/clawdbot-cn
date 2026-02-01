import { randomToken } from "../commands/onboard-helpers.js";
import type { GatewayAuthChoice } from "../commands/onboard-types.js";
import type { ClawdbotConfig } from "../config/config.js";
import { findTailscaleBinary } from "../infra/tailscale.js";
import type { RuntimeEnv } from "../runtime.js";
import type {
  GatewayWizardSettings,
  QuickstartGatewayDefaults,
  WizardFlow,
} from "./onboarding.types.js";
import type { WizardPrompter } from "./prompts.js";

type ConfigureGatewayOptions = {
  flow: WizardFlow;
  baseConfig: ClawdbotConfig;
  nextConfig: ClawdbotConfig;
  localPort: number;
  quickstartGateway: QuickstartGatewayDefaults;
  prompter: WizardPrompter;
  runtime: RuntimeEnv;
};

type ConfigureGatewayResult = {
  nextConfig: ClawdbotConfig;
  settings: GatewayWizardSettings;
};

export async function configureGatewayForOnboarding(
  opts: ConfigureGatewayOptions,
): Promise<ConfigureGatewayResult> {
  const { flow, localPort, quickstartGateway, prompter } = opts;
  let { nextConfig } = opts;

  const port =
    flow === "quickstart"
      ? quickstartGateway.port
      : Number.parseInt(
          String(
            await prompter.text({
              message: "网关端口",
              initialValue: String(localPort),
              validate: (value) => (Number.isFinite(Number(value)) ? undefined : "无效的端口"),
            }),
          ),
          10,
        );

  let bind = (
    flow === "quickstart"
      ? quickstartGateway.bind
      : ((await prompter.select({
          message: "网关绑定 (Bind)",
          options: [
            { value: "loopback", label: "本地回环 (127.0.0.1)" },
            { value: "lan", label: "局域网 (LAN 0.0.0.0)" },
            { value: "tailnet", label: "Tailnet (Tailscale IP)" },
            { value: "auto", label: "自动 (本地回环 → 局域网)" },
            { value: "custom", label: "自定义 IP" },
          ],
        })) as "loopback" | "lan" | "auto" | "custom" | "tailnet")
  ) as "loopback" | "lan" | "auto" | "custom" | "tailnet";

  let customBindHost = quickstartGateway.customBindHost;
  if (bind === "custom") {
    const needsPrompt = flow !== "quickstart" || !customBindHost;
    if (needsPrompt) {
      const input = await prompter.text({
        message: "自定义 IP 地址",
        placeholder: "192.168.1.100",
        initialValue: customBindHost ?? "",
        validate: (value) => {
          if (!value) return "自定义绑定模式需要填写 IP 地址";
          const trimmed = value.trim();
          const parts = trimmed.split(".");
          if (parts.length !== 4) return "无效的 IPv4 地址 (例如: 192.168.1.100)";
          if (
            parts.every((part) => {
              const n = parseInt(part, 10);
              return !Number.isNaN(n) && n >= 0 && n <= 255 && part === String(n);
            })
          )
            return undefined;
          return "无效的 IPv4 地址 (每个字段必须在 0-255 之间)";
        },
      });
      customBindHost = typeof input === "string" ? input.trim() : undefined;
    }
  }

  let authMode = (
    flow === "quickstart"
      ? quickstartGateway.authMode
      : ((await prompter.select({
          message: "网关身份验证",
          options: [
            {
              value: "off",
              label: "关闭 (仅限本地访问)",
              hint: "不建议关闭，除非你完全信任本地进程",
            },
            {
              value: "token",
              label: "令牌 (Token)",
              hint: "推荐的默认设置（支持本地和远程访问）",
            },
            { value: "password", label: "密码 (Password)" },
          ],
          initialValue: "token",
        })) as GatewayAuthChoice)
  ) as GatewayAuthChoice;

  const tailscaleMode = (
    flow === "quickstart"
      ? quickstartGateway.tailscaleMode
      : ((await prompter.select({
          message: "Tailscale 暴露模式",
          options: [
            { value: "off", label: "关闭", hint: "不进行 Tailscale 暴露" },
            {
              value: "serve",
              label: "Serve",
              hint: "为您的 Tailnet 设备提供私有 HTTPS (内网打通)",
            },
            {
              value: "funnel",
              label: "Funnel",
              hint: "通过 Tailscale Funnel 提供公网 HTTPS 访问",
            },
          ],
        })) as "off" | "serve" | "funnel")
  ) as "off" | "serve" | "funnel";

  // Detect Tailscale binary before proceeding with serve/funnel setup.
  if (tailscaleMode !== "off") {
    const tailscaleBin = await findTailscaleBinary();
    if (!tailscaleBin) {
      await prompter.note(
        [
          "在 PATH 或 /Applications 中未找到 Tailscale 可执行文件。",
          "请确保已安装 Tailscale：",
          "  https://tailscale.com/download/mac",
          "",
          "你可以继续设置，但 serve/funnel 在运行时会失败。",
        ].join("\n"),
        "Tailscale 警告",
      );
    }
  }

  let tailscaleResetOnExit = flow === "quickstart" ? quickstartGateway.tailscaleResetOnExit : false;
  if (tailscaleMode !== "off" && flow !== "quickstart") {
    await prompter.note(
      ["文档:", "http://101.35.228.254/gateway/tailscale", "http://101.35.228.254/web"].join(
        "\n",
      ),
      "Tailscale",
    );
    tailscaleResetOnExit = Boolean(
      await prompter.confirm({
        message: "退出时重置 Tailscale serve/funnel？",
        initialValue: false,
      }),
    );
  }

  // Safety + constraints:
  // - Tailscale wants bind=loopback so we never expose a non-loopback server + tailscale serve/funnel at once.
  // - Auth off only allowed for bind=loopback.
  // - Funnel requires password auth.
  if (tailscaleMode !== "off" && bind !== "loopback") {
    await prompter.note("Tailscale 要求 bind=loopback。已自动调整绑定为本地回环 (loopback)。", "提示");
    bind = "loopback";
    customBindHost = undefined;
  }

  if (authMode === "off" && bind !== "loopback") {
    await prompter.note("非本地绑定需要身份验证。已自动切换为令牌 (token) 验证。", "提示");
    authMode = "token";
  }

  if (tailscaleMode === "funnel" && authMode !== "password") {
    await prompter.note("Tailscale funnel 要求使用密码验证。", "提示");
    authMode = "password";
  }

  let gatewayToken: string | undefined;
  if (authMode === "token") {
    if (flow === "quickstart") {
      gatewayToken = quickstartGateway.token ?? randomToken();
    } else {
      const tokenInput = await prompter.text({
        message: "网关令牌 (留空则自动生成)",
        placeholder: "多机访问或非本地访问时需要",
        initialValue: quickstartGateway.token ?? "",
      });
      gatewayToken = String(tokenInput).trim() || randomToken();
    }
  }

  if (authMode === "password") {
    const password =
      flow === "quickstart" && quickstartGateway.password
        ? quickstartGateway.password
        : await prompter.text({
            message: "网关密码",
            validate: (value) => (value?.trim() ? undefined : "必填项目"),
          });
    nextConfig = {
      ...nextConfig,
      gateway: {
        ...nextConfig.gateway,
        auth: {
          ...nextConfig.gateway?.auth,
          mode: "password",
          password: String(password).trim(),
        },
      },
    };
  } else if (authMode === "token") {
    nextConfig = {
      ...nextConfig,
      gateway: {
        ...nextConfig.gateway,
        auth: {
          ...nextConfig.gateway?.auth,
          mode: "token",
          token: gatewayToken,
        },
      },
    };
  }

  nextConfig = {
    ...nextConfig,
    gateway: {
      ...nextConfig.gateway,
      port,
      bind,
      ...(bind === "custom" && customBindHost ? { customBindHost } : {}),
      tailscale: {
        ...nextConfig.gateway?.tailscale,
        mode: tailscaleMode,
        resetOnExit: tailscaleResetOnExit,
      },
    },
  };

  return {
    nextConfig,
    settings: {
      port,
      bind,
      customBindHost: bind === "custom" ? customBindHost : undefined,
      authMode,
      gatewayToken,
      tailscaleMode,
      tailscaleResetOnExit,
    },
  };
}
