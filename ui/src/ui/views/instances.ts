import { html, nothing } from "lit";

import { formatPresenceAge, formatPresenceSummary } from "../presenter";
import type { PresenceEntry } from "../types";

export type InstancesProps = {
  loading: boolean;
  entries: PresenceEntry[];
  lastError: string | null;
  statusMessage: string | null;
  onRefresh: () => void;
};

export function renderInstances(props: InstancesProps) {
  return html`
    <section class="card">
      <div class="row" style="justify-content: space-between;">
        <div>
          <div class="card-title">连通实例 (Instances)</div>
          <div class="card-sub">来自网关与客户端的状态信号。</div>
        </div>
        <button class="btn" ?disabled=${props.loading} @click=${props.onRefresh}>
          ${props.loading ? "加载中…" : "刷新"}
        </button>
      </div>
      ${props.lastError
        ? html`<div class="callout danger" style="margin-top: 12px;">
            ${props.lastError}
          </div>`
        : nothing}
      ${props.statusMessage
        ? html`<div class="callout" style="margin-top: 12px;">
            ${props.statusMessage}
          </div>`
        : nothing}
      <div class="list" style="margin-top: 16px;">
        ${props.entries.length === 0
          ? html`<div class="muted">暂无上报的实例。</div>`
          : props.entries.map((entry) => renderEntry(entry))}
      </div>
    </section>
  `;
}

function renderEntry(entry: PresenceEntry) {
  const lastInput =
    entry.lastInputSeconds != null
      ? `${entry.lastInputSeconds} 秒前`
      : "无";
  const mode = entry.mode ?? "未知模式";
  const roles = Array.isArray(entry.roles) ? entry.roles.filter(Boolean) : [];
  const scopes = Array.isArray(entry.scopes) ? entry.scopes.filter(Boolean) : [];
  const scopesLabel =
    scopes.length > 0
      ? scopes.length > 3
        ? `${scopes.length} 个作用域`
        : `作用域: ${scopes.join(", ")}`
      : null;
  return html`
    <div class="list-item">
      <div class="list-main">
        <div class="list-title">${entry.host ?? "未知主机"}</div>
        <div class="list-sub">${formatPresenceSummary(entry)}</div>
        <div class="chip-row">
          <span class="chip">${mode}</span>
          ${roles.map((role) => html`<span class="chip">${role}</span>`)}
          ${scopesLabel ? html`<span class="chip">${scopesLabel}</span>` : nothing}
          ${entry.platform ? html`<span class="chip">${entry.platform}</span>` : nothing}
          ${entry.deviceFamily
            ? html`<span class="chip">${entry.deviceFamily}</span>`
            : nothing}
          ${entry.modelIdentifier
            ? html`<span class="chip">${entry.modelIdentifier}</span>`
            : nothing}
          ${entry.version ? html`<span class="chip">${entry.version}</span>` : nothing}
        </div>
      </div>
      <div class="list-meta">
        <div>${formatPresenceAge(entry)}</div>
        <div class="muted">最后输入: ${lastInput}</div>
        <div class="muted">原因: ${entry.reason ?? "无"}</div>
      </div>
    </div>
  `;
}
