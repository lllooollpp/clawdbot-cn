import { html, nothing } from "lit";

import { formatAgo } from "../format";
import type { GoogleChatStatus } from "../types";
import { renderChannelConfigSection } from "./channels.config";
import type { ChannelsProps } from "./channels.types";

export function renderGoogleChatCard(params: {
  props: ChannelsProps;
  googleChat?: GoogleChatStatus | null;
  accountCountLabel: unknown;
}) {
  const { props, googleChat, accountCountLabel } = params;

  return html`
    <div class="card">
      <div class="card-title">Google Chat</div>
      <div class="card-sub">Chat API Webhook 状态与渠道配置。</div>
      ${accountCountLabel}

      <div class="status-list" style="margin-top: 16px;">
        <div>
          <span class="label">已配置</span>
          <span>${googleChat ? (googleChat.configured ? "是" : "否") : "无"}</span>
        </div>
        <div>
          <span class="label">运行中</span>
          <span>${googleChat ? (googleChat.running ? "是" : "否") : "无"}</span>
        </div>
        <div>
          <span class="label">凭据</span>
          <span>${googleChat?.credentialSource ?? "无"}</span>
        </div>
        <div>
          <span class="label">受众 (Audience)</span>
          <span>
            ${googleChat?.audienceType
              ? `${googleChat.audienceType}${googleChat.audience ? ` · ${googleChat.audience}` : ""}`
              : "无"}
          </span>
        </div>
        <div>
          <span class="label">上次启动</span>
          <span>${googleChat?.lastStartAt ? formatAgo(googleChat.lastStartAt) : "无"}</span>
        </div>
        <div>
          <span class="label">上次探测</span>
          <span>${googleChat?.lastProbeAt ? formatAgo(googleChat.lastProbeAt) : "无"}</span>
        </div>
      </div>

      ${googleChat?.lastError
        ? html`<div class="callout danger" style="margin-top: 12px;">
            ${googleChat.lastError}
          </div>`
        : nothing}

      ${googleChat?.probe
        ? html`<div class="callout" style="margin-top: 12px;">
            探测 ${googleChat.probe.ok ? "成功" : "失败"} ·
            ${googleChat.probe.status ?? ""} ${googleChat.probe.error ?? ""}
          </div>`
        : nothing}

      ${renderChannelConfigSection({ channelId: "googlechat", props })}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${() => props.onRefresh(true)}>
          刷新探测
        </button>
      </div>
    </div>
  `;
}
