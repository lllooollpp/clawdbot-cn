import { html, nothing } from "lit";

import { formatAgo } from "../format";
import type { SignalStatus } from "../types";
import type { ChannelsProps } from "./channels.types";
import { renderChannelConfigSection } from "./channels.config";

export function renderSignalCard(params: {
  props: ChannelsProps;
  signal?: SignalStatus | null;
  accountCountLabel: unknown;
}) {
  const { props, signal, accountCountLabel } = params;

  return html`
    <div class="card">
      <div class="card-title">Signal</div>
      <div class="card-sub">signal-cli 状态与渠道配置。</div>
      ${accountCountLabel}

      <div class="status-list" style="margin-top: 16px;">
        <div>
          <span class="label">已配置</span>
          <span>${signal?.configured ? "是" : "否"}</span>
        </div>
        <div>
          <span class="label">运行中</span>
          <span>${signal?.running ? "是" : "否"}</span>
        </div>
        <div>
          <span class="label">基础 URL</span>
          <span>${signal?.baseUrl ?? "无"}</span>
        </div>
        <div>
          <span class="label">上次启动</span>
          <span>${signal?.lastStartAt ? formatAgo(signal.lastStartAt) : "无"}</span>
        </div>
        <div>
          <span class="label">上次探测</span>
          <span>${signal?.lastProbeAt ? formatAgo(signal.lastProbeAt) : "无"}</span>
        </div>
      </div>

      ${signal?.lastError
        ? html`<div class="callout danger" style="margin-top: 12px;">
            ${signal.lastError}
          </div>`
        : nothing}

      ${signal?.probe
        ? html`<div class="callout" style="margin-top: 12px;">
            探测 ${signal.probe.ok ? "成功" : "失败"} ·
            ${signal.probe.status ?? ""} ${signal.probe.error ?? ""}
          </div>`
        : nothing}

      ${renderChannelConfigSection({ channelId: "signal", props })}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${() => props.onRefresh(true)}>
          刷新探测
        </button>
      </div>
    </div>
  `;
}
