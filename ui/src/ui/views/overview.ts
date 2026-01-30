import { html } from "lit";

import type { GatewayHelloOk } from "../gateway";
import { formatAgo, formatDurationMs } from "../format";
import { formatNextRun } from "../presenter";
import type { UiSettings } from "../storage";

export type OverviewProps = {
  connected: boolean;
  hello: GatewayHelloOk | null;
  settings: UiSettings;
  password: string;
  lastError: string | null;
  presenceCount: number;
  sessionsCount: number | null;
  cronEnabled: boolean | null;
  cronNext: number | null;
  lastChannelsRefresh: number | null;
  onSettingsChange: (next: UiSettings) => void;
  onPasswordChange: (next: string) => void;
  onSessionKeyChange: (next: string) => void;
  onConnect: () => void;
  onRefresh: () => void;
};

export function renderOverview(props: OverviewProps) {
  const snapshot = props.hello?.snapshot as
    | { uptimeMs?: number; policy?: { tickIntervalMs?: number } }
    | undefined;
  const uptime = snapshot?.uptimeMs ? formatDurationMs(snapshot.uptimeMs) : "无";
  const tick = snapshot?.policy?.tickIntervalMs
    ? `${snapshot.policy.tickIntervalMs}ms`
    : "无";
  const authHint = (() => {
    if (props.connected || !props.lastError) return null;
    const lower = props.lastError.toLowerCase();
    const authFailed = lower.includes("unauthorized") || lower.includes("connect failed");
    if (!authFailed) return null;
    const hasToken = Boolean(props.settings.token.trim());
    const hasPassword = Boolean(props.password.trim());
    if (!hasToken && !hasPassword) {
      return html`
        <div class="muted" style="margin-top: 8px;">
          此网关需要身份验证。请添加令牌或密码，然后点击“连接”。
          <div style="margin-top: 6px;">
            <span class="mono">openclaw dashboard --no-open</span> → 获取带令牌的 URL<br />
            <span class="mono">openclaw doctor --generate-gateway-token</span> → 设置令牌
          </div>
          <div style="margin-top: 6px;">
            <a
              class="session-link"
              href="https://docs.clawd.bot/web/dashboard"
              target="_blank"
              rel="noreferrer"
              title="控制面板身份验证文档（在新标签页中打开）"
              >文档：控制面板身份验证</a
            >
          </div>
        </div>
      `;
    }
    return html`
      <div class="muted" style="margin-top: 8px;">
        身份验证失败。请通过
        <span class="mono">openclaw dashboard --no-open</span> 重新复制带令牌的 URL，或者更新令牌，然后点击“连接”。
        <div style="margin-top: 6px;">
          <a
            class="session-link"
            href="https://docs.clawd.bot/web/dashboard"
            target="_blank"
            rel="noreferrer"
            title="控制面板身份验证文档（在新标签页中打开）"
            >文档：控制面板身份验证</a
          >
        </div>
      </div>
    `;
  })();
  const insecureContextHint = (() => {
    if (props.connected || !props.lastError) return null;
    const isSecureContext = typeof window !== "undefined" ? window.isSecureContext : true;
    if (isSecureContext !== false) return null;
    const lower = props.lastError.toLowerCase();
    if (!lower.includes("secure context") && !lower.includes("device identity required")) {
      return null;
    }
    return html`
      <div class="muted" style="margin-top: 8px;">
        此页面处于 HTTP 环境，浏览器会拦截设备身份。请使用 HTTPS (Tailscale Serve) 或在网关主机上打开
        <span class="mono">http://127.0.0.1:18789</span>。
        <div style="margin-top: 6px;">
          如果必须使用 HTTP，请设置
          <span class="mono">gateway.controlUi.allowInsecureAuth: true</span> (仅令牌验证)。
        </div>
        <div style="margin-top: 6px;">
          <a
            class="session-link"
            href="https://docs.clawd.bot/gateway/tailscale"
            target="_blank"
            rel="noreferrer"
            title="Tailscale Serve 文档（在新标签页中打开）"
            >文档：Tailscale Serve</a
          >
          <span class="muted"> · </span>
          <a
            class="session-link"
            href="https://docs.clawd.bot/web/control-ui#insecure-http"
            target="_blank"
            rel="noreferrer"
            title="不安全 HTTP 文档（在新标签页中打开）"
            >文档：不安全 HTTP</a
          >
        </div>
      </div>
    `;
  })();

  return html`
    <section class="grid grid-cols-2">
      <div class="card">
        <div class="card-title">网关访问</div>
        <div class="card-sub">控制面板如何连接网关及其身份验证方式。</div>
        <div class="form-grid" style="margin-top: 16px;">
          <label class="field">
            <span>WebSocket 地址</span>
            <input
              .value=${props.settings.gatewayUrl}
              @input=${(e: Event) => {
                const v = (e.target as HTMLInputElement).value;
                props.onSettingsChange({ ...props.settings, gatewayUrl: v });
              }}
              placeholder="ws://127.0.0.1:18789"
            />
          </label>
          <label class="field">
            <span>网关令牌 (Token)</span>
            <input
              .value=${props.settings.token}
              @input=${(e: Event) => {
                const v = (e.target as HTMLInputElement).value;
                props.onSettingsChange({ ...props.settings, token: v });
              }}
              placeholder="网关访问令牌"
            />
          </label>
          <label class="field">
            <span>密码 (不存储)</span>
            <input
              type="password"
              .value=${props.password}
              @input=${(e: Event) => {
                const v = (e.target as HTMLInputElement).value;
                props.onPasswordChange(v);
              }}
              placeholder="系统或共享密码"
            />
          </label>
          <label class="field">
            <span>默认会话键 (Session Key)</span>
            <input
              .value=${props.settings.sessionKey}
              @input=${(e: Event) => {
                const v = (e.target as HTMLInputElement).value;
                props.onSessionKeyChange(v);
              }}
            />
          </label>
        </div>
        <div class="row" style="margin-top: 14px;">
          <button class="btn" @click=${() => props.onConnect()}>连接</button>
          <button class="btn" @click=${() => props.onRefresh()}>刷新</button>
          <span class="muted">点击“连接”以应用连接设置。</span>
        </div>
      </div>

      <div class="card">
        <div class="card-title">快照</div>
        <div class="card-sub">最新的网关握手信息。</div>
        <div class="stat-grid" style="margin-top: 16px;">
          <div class="stat">
            <div class="stat-label">状态</div>
            <div class="stat-value ${props.connected ? "ok" : "warn"}">
              ${props.connected ? "已连接" : "未连接"}
            </div>
          </div>
          <div class="stat">
            <div class="stat-label">运行时间</div>
            <div class="stat-value">${uptime}</div>
          </div>
          <div class="stat">
            <div class="stat-label">心跳间隔 (Tick)</div>
            <div class="stat-value">${tick}</div>
          </div>
          <div class="stat">
            <div class="stat-label">渠道上次刷新</div>
            <div class="stat-value">
              ${props.lastChannelsRefresh
                ? formatAgo(props.lastChannelsRefresh)
                : "无"}
            </div>
          </div>
        </div>
        ${props.lastError
          ? html`<div class="callout danger" style="margin-top: 14px;">
              <div>${props.lastError}</div>
              ${authHint ?? ""}
              ${insecureContextHint ?? ""}
            </div>`
          : html`<div class="callout" style="margin-top: 14px;">
              使用“渠道”页面链接 WhatsApp, Telegram, Discord, Signal 或 iMessage。
            </div>`}
      </div>
    </section>

    <section class="grid grid-cols-3" style="margin-top: 18px;">
      <div class="card stat-card">
        <div class="stat-label">实例</div>
        <div class="stat-value">${props.presenceCount}</div>
        <div class="muted">过去 5 分钟内的在线心跳数量。</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">会话</div>
        <div class="stat-value">${props.sessionsCount ?? "无"}</div>
        <div class="muted">网关追踪的近期会话键数量。</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">定时任务</div>
        <div class="stat-value">
          ${props.cronEnabled == null
            ? "无"
            : props.cronEnabled
              ? "已启用"
              : "已禁用"}
        </div>
        <div class="muted">下次唤醒：${formatNextRun(props.cronNext)}</div>
      </div>
    </section>

    <section class="card" style="margin-top: 18px;">
      <div class="card-title">备忘录</div>
      <div class="card-sub">远程控制设置的快速提醒。</div>
      <div class="note-grid" style="margin-top: 14px;">
        <div>
          <div class="note-title">Tailscale serve</div>
          <div class="muted">
            推荐使用 serve 模式，将网关保持在 loopback 并使用 tailnet 身份验证。
          </div>
        </div>
        <div>
          <div class="note-title">会话清理</div>
          <div class="muted">使用 /new 或 sessions.patch 重置上下文。</div>
        </div>
        <div>
          <div class="note-title">Cron 提醒</div>
          <div class="muted">对循环运行的任务使用独立的会话。</div>
        </div>
      </div>
    </section>
  `;
}
