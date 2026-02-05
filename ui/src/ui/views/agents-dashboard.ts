import { html, css, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { type AgentConfig } from "../../config/types.agents.js";
import { sendRequest } from "../controllers/gateway.js";

export type AgentsDashboardProps = {
  agents: AgentConfig[];
  defaultAgentId?: string;
};

@customElement("clawdbot-agents-dashboard")
export class AgentsDashboard extends LitElement {
  @property({ type: Object }) props: AgentsDashboardProps = { agents: [] };
  @state() selectedAgent: AgentConfig | null = null;
  @state() showFileManager = false;

  static styles = css`
    :host {
      display: block;
      padding: 16px;
      background: var(--background-color, #fff);
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .dashboard-title {
      font-size: 24px;
      font-weight: 600;
      color: var(--text-color, #000);
    }

    .agents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .agent-card {
      border: 1px solid var(--border-color, #ddd);
      border-radius: 8px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .agent-card:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-color: var(--primary-color, #007bff);
    }

    .agent-card.selected {
      border-color: var(--primary-color, #007bff);
      background: var(--selected-bg, #f0f8ff);
    }

    .agent-card.default {
      border-color: var(--success-color, #28a745);
    }

    .agent-name {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--text-color, #000);
    }

    .agent-id {
      font-size: 12px;
      color: var(--text-muted, #666);
      margin-bottom: 8px;
    }

    .agent-workspace {
      font-size: 13px;
      color: var(--text-secondary, #555);
      word-break: break-all;
    }

    .agent-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      margin-top: 8px;
    }

    .agent-badge.default {
      background: var(--success-color, #28a745);
      color: white;
    }

    .file-manager-panel {
      border: 1px solid var(--border-color, #ddd);
      border-radius: 8px;
      padding: 16px;
      margin-top: 16px;
    }

    .file-manager-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .file-manager-title {
      font-size: 18px;
      font-weight: 600;
    }

    .close-button {
      padding: 4px 12px;
      border: none;
      background: var(--danger-color, #dc3545);
      color: white;
      border-radius: 4px;
      cursor: pointer;
    }

    .close-button:hover {
      opacity: 0.9;
    }

    .file-list {
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid var(--border-color, #ddd);
      border-radius: 4px;
      padding: 8px;
    }

    .file-item {
      padding: 8px;
      border-bottom: 1px solid var(--border-light, #eee);
      cursor: pointer;
    }

    .file-item:hover {
      background: var(--hover-bg, #f5f5f5);
    }

    .file-item:last-child {
      border-bottom: none;
    }

    .no-agents {
      text-align: center;
      padding: 48px;
      color: var(--text-muted, #666);
    }
  `;

  render() {
    const { agents, defaultAgentId } = this.props;

    if (!agents || agents.length === 0) {
      return html`
        <div class="no-agents">
          <p>No agents configured</p>
        </div>
      `;
    }

    return html`
      <div class="dashboard-header">
        <h1 class="dashboard-title">Agents Dashboard</h1>
      </div>

      <div class="agents-grid">
        ${agents.map((agent) => {
          const isDefault = agent.default === true || agent.id === defaultAgentId;
          const isSelected = this.selectedAgent?.id === agent.id;

          return html`
            <div
              class="agent-card ${isDefault ? "default" : ""} ${isSelected ? "selected" : ""}"
              @click=${() => this.handleAgentClick(agent)}
            >
              <div class="agent-name">${agent.name || agent.id}</div>
              <div class="agent-id">ID: ${agent.id}</div>
              ${agent.workspace
                ? html`<div class="agent-workspace">📁 ${agent.workspace}</div>`
                : ""}
              ${isDefault ? html`<span class="agent-badge default">DEFAULT</span>` : ""}
            </div>
          `;
        })}
      </div>

      ${this.showFileManager && this.selectedAgent
        ? html`
            <div class="file-manager-panel">
              <div class="file-manager-header">
                <h2 class="file-manager-title">
                  Files: ${this.selectedAgent.name || this.selectedAgent.id}
                </h2>
                <button class="close-button" @click=${this.closeFileManager}>Close</button>
              </div>
              <div class="file-list">
                <div class="file-item">📄 BOOTSTRAP.md</div>
                <div class="file-item">📁 skills/</div>
                <div class="file-item">📁 .sessions/</div>
                <div class="file-item">📄 .registry/</div>
              </div>
            </div>
          `
        : ""}
    `;
  }

  private handleAgentClick(agent: AgentConfig) {
    this.selectedAgent = agent;
    this.showFileManager = true;
  }

  private closeFileManager() {
    this.showFileManager = false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "clawdbot-agents-dashboard": AgentsDashboard;
  }
}
