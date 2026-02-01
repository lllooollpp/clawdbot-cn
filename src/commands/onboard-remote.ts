import type { ClawdbotConfig } from "../config/config.js";
import type { GatewayBonjourBeacon } from "../infra/bonjour-discovery.js";
import { discoverGatewayBeacons } from "../infra/bonjour-discovery.js";
import type { WizardPrompter } from "../wizard/prompts.js";
import { detectBinary } from "./onboard-helpers.js";

const DEFAULT_GATEWAY_URL = "ws://127.0.0.1:18789";

function pickHost(beacon: GatewayBonjourBeacon): string | undefined {
  return beacon.tailnetDns || beacon.lanHost || beacon.host;
}

function buildLabel(beacon: GatewayBonjourBeacon): string {
  const host = pickHost(beacon);
  const port = beacon.gatewayPort ?? beacon.port ?? 18789;
  const title = beacon.displayName ?? beacon.instanceName;
  const hint = host ? `${host}:${port}` : "未知主机";
  return `${title} (${hint})`;
}

function ensureWsUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return DEFAULT_GATEWAY_URL;
  return trimmed;
}

export async function promptRemoteGatewayConfig(
  cfg: ClawdbotConfig,
  prompter: WizardPrompter,
): Promise<ClawdbotConfig> {
  let selectedBeacon: GatewayBonjourBeacon | null = null;
  let suggestedUrl = cfg.gateway?.remote?.url ?? DEFAULT_GATEWAY_URL;

  const hasBonjourTool = (await detectBinary("dns-sd")) || (await detectBinary("avahi-browse"));
  const wantsDiscover = hasBonjourTool
    ? await prompter.confirm({
        message: "在局域网中发现网关 (Bonjour)？",
        initialValue: true,
      })
    : false;

  if (!hasBonjourTool) {
    await prompter.note(
      [
        "Bonjour 发现需要 dns-sd (macOS) 或 avahi-browse (Linux)。",
        "文档：http://101.35.228.254/gateway/discovery",
      ].join("\n"),
      "发现",
    );
  }

  if (wantsDiscover) {
    const spin = prompter.progress("正在搜索网关…");
    const beacons = await discoverGatewayBeacons({ timeoutMs: 2000 });
    spin.stop(beacons.length > 0 ? `发现 ${beacons.length} 个网关` : "未发现网关");

    if (beacons.length > 0) {
      const selection = await prompter.select({
        message: "选择网关",
        options: [
          ...beacons.map((beacon, index) => ({
            value: String(index),
            label: buildLabel(beacon),
          })),
          { value: "manual", label: "手动输入 URL" },
        ],
      });
      if (selection !== "manual") {
        const idx = Number.parseInt(String(selection), 10);
        selectedBeacon = Number.isFinite(idx) ? (beacons[idx] ?? null) : null;
      }
    }
  }

  if (selectedBeacon) {
    const host = pickHost(selectedBeacon);
    const port = selectedBeacon.gatewayPort ?? 18789;
    if (host) {
      const mode = await prompter.select({
        message: "连接方式",
        options: [
          {
            value: "direct",
            label: `直接连接网关 WS (${host}:${port})`,
          },
          { value: "ssh", label: "SSH 隧道 (回环)" },
        ],
      });
      if (mode === "direct") {
        suggestedUrl = `ws://${host}:${port}`;
      } else {
        suggestedUrl = DEFAULT_GATEWAY_URL;
        await prompter.note(
          [
            "在使用 CLI 之前请先启动隧道：",
            `ssh -N -L 18789:127.0.0.1:18789 <user>@${host}${
              selectedBeacon.sshPort ? ` -p ${selectedBeacon.sshPort}` : ""
            }`,
            "文档：http://101.35.228.254/gateway/remote",
          ].join("\n"),
          "SSH 隧道",
        );
      }
    }
  }

  const urlInput = await prompter.text({
    message: "网关 WebSocket URL",
    initialValue: suggestedUrl,
    validate: (value) =>
      String(value).trim().startsWith("ws://") || String(value).trim().startsWith("wss://")
        ? undefined
        : "URL 必须以 ws:// 或 wss:// 开头",
  });
  const url = ensureWsUrl(String(urlInput));

  const authChoice = (await prompter.select({
    message: "网关认证",
    options: [
      { value: "token", label: "Token (推荐)" },
      { value: "off", label: "无认证" },
    ],
  })) as "token" | "off";

  let token = cfg.gateway?.remote?.token ?? "";
  if (authChoice === "token") {
    token = String(
      await prompter.text({
        message: "网关 Token",
        initialValue: token,
        validate: (value) => (value?.trim() ? undefined : "必填"),
      }),
    ).trim();
  } else {
    token = "";
  }

  return {
    ...cfg,
    gateway: {
      ...cfg.gateway,
      mode: "remote",
      remote: {
        url,
        token: token || undefined,
      },
    },
  };
}
