import { html, nothing } from "lit";
import type { WizardStep } from "../controllers/wizard";

export type OnboardingViewState = {
  connected: boolean;
  basePath: string;
  onboardingWizardStep: WizardStep | null;
  onboardingWizardStatus: "running" | "done" | "cancelled" | "error" | null;
  onboardingWizardError: string | null;
  onboardingWizardBusy: boolean;
  onboardingWizardDraft: unknown;
  onWizardStart: () => void;
  onWizardNext: () => void;
  onWizardBack: () => void;
  onWizardCancel: () => void;
  onWizardDraftChange: (value: unknown) => void;
  onReconnect: () => void;
  onExit: () => void;
};

function renderMessage(message?: string) {
  if (!message) return nothing;
  return html`<div class="onboarding-message">${message}</div>`;
}

function isSelected(value: unknown, selected: unknown) {
  return Object.is(value, selected);
}

function renderSelectOptions(
  step: WizardStep,
  draft: unknown,
  onChange: (value: unknown) => void,
) {
  const options = step.options ?? [];
  return html`
    <div class="list onboarding-options">
      ${options.map((option) => {
        const selected = isSelected(option.value, draft);
        return html`
          <div
            class="list-item list-item-clickable ${selected ? "list-item-selected" : ""}"
            @click=${() => onChange(option.value)}
          >
            <div class="list-main">
              <div class="list-title">${option.label}</div>
              ${option.hint ? html`<div class="list-sub">${option.hint}</div>` : nothing}
            </div>
            <div class="list-meta">
              <div class="pill">${selected ? "已选择" : ""}</div>
            </div>
          </div>
        `;
      })}
    </div>
  `;
}

function renderMultiSelectOptions(
  step: WizardStep,
  draft: unknown,
  onChange: (value: unknown[]) => void,
) {
  const values = Array.isArray(draft) ? draft : [];
  const options = step.options ?? [];
  return html`
    <div class="list onboarding-options">
      ${options.map((option) => {
        const selected = values.some((value) => Object.is(value, option.value));
        return html`
          <div
            class="list-item list-item-clickable ${selected ? "list-item-selected" : ""}"
            @click=${() => {
              const next = selected
                ? values.filter((value) => !Object.is(value, option.value))
                : [...values, option.value];
              onChange(next);
            }}
          >
            <div class="list-main">
              <div class="list-title">${option.label}</div>
              ${option.hint ? html`<div class="list-sub">${option.hint}</div>` : nothing}
            </div>
            <div class="list-meta">
              <label class="field checkbox">
                <input type="checkbox" .checked=${selected} />
                <span>${selected ? "已启用" : ""}</span>
              </label>
            </div>
          </div>
        `;
      })}
    </div>
  `;
}

function renderTextInput(step: WizardStep, draft: unknown, onChange: (value: string) => void) {
  const value = typeof draft === "string" ? draft : "";
  const type = step.sensitive ? "password" : "text";
  return html`
    <label class="field">
      <span>${step.placeholder ?? ""}</span>
      <input
        type=${type}
        .value=${value}
        placeholder=${step.placeholder ?? ""}
        @input=${(event: Event) => onChange((event.target as HTMLInputElement).value)}
      />
    </label>
  `;
}

function renderConfirm(step: WizardStep, draft: unknown, onChange: (value: boolean) => void) {
  const value = typeof draft === "boolean" ? draft : false;
  return html`
    <label class="field checkbox">
      <input
        type="checkbox"
        .checked=${value}
        @change=${(event: Event) => onChange((event.target as HTMLInputElement).checked)}
      />
      <span>${step.message ?? "确认"}</span>
    </label>
  `;
}

function renderStepContent(
  step: WizardStep,
  draft: unknown,
  onChange: (value: unknown) => void,
) {
  switch (step.type) {
    case "note":
    case "action":
    case "progress":
      return renderMessage(step.message);
    case "select":
      return renderSelectOptions(step, draft, onChange);
    case "multiselect":
      return renderMultiSelectOptions(step, draft, (next) => onChange(next));
    case "text":
      return renderTextInput(step, draft, (value) => onChange(value));
    case "confirm":
      return renderConfirm(step, draft, (value) => onChange(value));
    case "form":
      return renderForm(step, draft, onChange);
    default:
      return renderMessage(step.message);
  }
}

function renderForm(step: WizardStep, draft: unknown, onChange: (value: unknown) => void) {
  const values = (draft as Record<string, unknown>) ?? {};
  const fields = step.fields ?? [];

  const onFieldChange = (key: string, value: unknown) => {
    // 使用更新函数确保获取最新的 draft 值，避免闭包问题
    onChange((prev: Record<string, unknown>) => ({ ...(prev ?? {}), [key]: value }));
  };

  return html`
    <div class="onboarding-form">
      ${fields.map((field) => {
        const value = values[field.key];
        return html`
          <div class="onboarding-field">
            <div class="onboarding-field-label">${field.label}</div>
            ${renderFieldInput(field, value, (v) => onFieldChange(field.key, v))}
          </div>
        `;
      })}
    </div>
  `;
}

function renderFieldInput(
  field: WizardStep["fields"] extends Array<infer T> ? T : any,
  value: unknown,
  onChange: (value: unknown) => void,
) {
  switch (field.type) {
    case "text":
    case "password":
      return html`
        <input
          type=${field.type}
          class="input"
          .value=${String(value ?? "")}
          placeholder=${field.placeholder ?? ""}
          @input=${(e: Event) => onChange((e.target as HTMLInputElement).value)}
        />
      `;
    case "confirm":
      return html`
        <label class="field checkbox">
          <input
            type="checkbox"
            .checked=${Boolean(value)}
            @change=${(e: Event) => onChange((e.target as HTMLInputElement).checked)}
          />
          <span>${field.placeholder ?? "启用"}</span>
        </label>
      `;
    case "select":
      return html`
        <select
          class="input"
          @change=${(e: Event) => onChange((e.target as HTMLSelectElement).value)}
        >
          ${(field.options ?? []).map(
            (opt: any) => html`
              <option value=${opt.value} ?selected=${Object.is(opt.value, value)}>
                ${opt.label}
              </option>
            `,
          )}
        </select>
      `;
    default:
      return nothing;
  }
}

function renderWizardStep(state: OnboardingViewState, step: WizardStep) {
  const canContinue = !state.onboardingWizardBusy;
  const title = step.title ?? "";
  const showHeaderMessage =
    step.message && (step.type === "text" || step.type === "select" || step.type === "multiselect");
  return html`
    <div class="card onboarding-card">
      <div class="onboarding-step-header">
        <div>
          <div class="card-title">${title || "继续设置"}</div>
          ${showHeaderMessage ? renderMessage(step.message) : nothing}
        </div>
        <div class="pill">${step.type}</div>
      </div>
      <div class="onboarding-step-body">
        ${renderStepContent(step, state.onboardingWizardDraft, state.onWizardDraftChange)}
      </div>
      <div class="onboarding-actions">
        <button class="btn" @click=${() => state.onWizardCancel()} ?disabled=${state.onboardingWizardBusy}>
          取消
        </button>
        ${step.supportsBack
          ? html`
              <button class="btn" @click=${() => state.onWizardBack()} ?disabled=${state.onboardingWizardBusy}>
                上一步
              </button>
            `
          : nothing}
        <button class="btn primary" @click=${() => state.onWizardNext()} ?disabled=${!canContinue}>
          继续
        </button>
      </div>
    </div>
  `;
}

function renderWizardStatus(state: OnboardingViewState) {
  if (state.onboardingWizardStatus === "done") {
    return html`
      <div class="card onboarding-card">
        <div class="card-title">向导已完成</div>
        <div class="card-sub">配置已经写入网关。你可以进入控制台继续使用。</div>
        <div class="onboarding-actions">
          <button class="btn primary" @click=${() => state.onExit()}>进入控制台</button>
        </div>
      </div>
    `;
  }
  if (state.onboardingWizardStatus === "cancelled") {
    return html`
      <div class="card onboarding-card">
        <div class="card-title">向导已取消</div>
        <div class="card-sub">你可以稍后在设置里重新运行向导。</div>
        <div class="onboarding-actions">
          <button class="btn" @click=${() => state.onWizardStart()}>重新开始</button>
          <button class="btn primary" @click=${() => state.onExit()}>进入控制台</button>
        </div>
      </div>
    `;
  }
  if (state.onboardingWizardStatus === "error") {
    return html`
      <div class="card onboarding-card">
        <div class="card-title">向导遇到错误</div>
        <div class="card-sub">${state.onboardingWizardError ?? "请稍后重试。"}</div>
        <div class="onboarding-actions">
          <button class="btn" @click=${() => state.onWizardStart()}>重试</button>
        </div>
      </div>
    `;
  }
  return nothing;
}

export function renderOnboarding(state: OnboardingViewState) {
  const step = state.onboardingWizardStep;
  return html`
    <div class="shell shell--onboarding">
      <main class="content onboarding-content">
        <div class="onboarding-container">
          <div class="onboarding-header">
            <div>
              <div class="onboarding-title">Clawdbot 启动向导</div>
              <div class="onboarding-sub">一步步完成本机网关配置。</div>
            </div>
            <div class="pill ${state.connected ? "" : "danger"}">
              ${state.connected ? "网关已连接" : "等待网关连接"}
            </div>
          </div>

          ${!state.connected
            ? html`
                <div class="card onboarding-card">
                  <div class="card-title">连接网关</div>
                  <div class="card-sub">确保网关已启动，随后点击重试。</div>
                  <div class="onboarding-actions">
                    <button class="btn primary" @click=${() => state.onReconnect()}>
                      重新连接
                    </button>
                  </div>
                </div>
              `
            : nothing}

          ${state.onboardingWizardError
            ? html`<div class="pill danger">${state.onboardingWizardError}</div>`
            : nothing}

          ${step ? renderWizardStep(state, step) : nothing}
          ${renderWizardStatus(state)}

          ${!step && state.connected && state.onboardingWizardBusy
            ? html`
                <div class="card onboarding-card">
                  <div class="card-title">正在准备下一步…</div>
                  <div class="card-sub">请稍候，向导正在加载。</div>
                </div>
              `
            : nothing}

          ${!step && state.onboardingWizardStatus === null && state.connected
            ? html`
                <div class="card onboarding-card">
                  <div class="card-title">准备开始</div>
                  <div class="card-sub">我们将引导你配置模型、渠道与技能。</div>
                  <div class="onboarding-actions">
                    <button class="btn primary" @click=${() => state.onWizardStart()}>
                      开始向导
                    </button>
                  </div>
                </div>
              `
            : nothing}
        </div>
      </main>
    </div>
  `;
}
