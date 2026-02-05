/**
 * 预设配置管理界面
 * 简洁的卡片式设计，支持增删改查
 */

import { html, nothing } from "lit";
import type { TemplateResult } from "lit";
import type { JsonSchema } from "./config-form.shared";
import type { ConfigUiHints } from "../types";
import {
  MODEL_PRESETS,
  CHANNEL_PRESETS,
  TOOL_PRESETS,
  type PresetItem,
  type PresetCategory,
} from "./config-presets";

export type ConfigFormProps = {
  schema: JsonSchema | null;
  uiHints: ConfigUiHints;
  value: Record<string, unknown> | null;
  disabled?: boolean;
  unsupportedPaths?: string[];
  searchQuery?: string;
  activeSection?: string | null;
  activeSubsection?: string | null;
  onPatch: (path: Array<string | number>, value: unknown) => void;
  onDiscoverModels?: (provider: string) => void;
  onSectionChange?: (section: string | null) => void;
};

// 配置状态
type ConfiguredItem = {
  preset: PresetItem;
  values: Record<string, unknown>;
  enabled: boolean;
};

// 将 configPath 字符串转换为路径数组
function configPathToArray(configPath: string): string[] {
  return configPath.split('.');
}

// 根据路径数组从对象中获取值
function getValueAtPath(obj: Record<string, unknown> | null, path: string[]): Record<string, unknown> | undefined {
  if (!obj) return undefined;
  let current: unknown = obj;
  for (const key of path) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return current as Record<string, unknown> | undefined;
}

// 展开嵌套字段键，如 { 'searxng.baseUrl': 'x' } -> { searxng: { baseUrl: 'x' } }
function expandNestedValues(values: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) continue;
    if (key.includes('.')) {
      const parts = key.split('.');
      let current = result;
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!(part in current)) {
          current[part] = {};
        }
        current = current[part] as Record<string, unknown>;
      }
      current[parts[parts.length - 1]] = value;
    } else {
      result[key] = value;
    }
  }
  return result;
}

// 展平嵌套对象用于表单显示，如 { searxng: { baseUrl: 'x' } } -> { 'searxng.baseUrl': 'x' }
function flattenForForm(values: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenForForm(value as Record<string, unknown>, newKey));
    } else {
      result[newKey] = value;
    }
  }
  return result;
}

// 从 value 中提取已配置的项目
function getConfiguredItems(
  category: PresetCategory,
  value: Record<string, unknown> | null,
  presets: PresetItem[]
): ConfiguredItem[] {
  if (!value) return [];
  
  const items: ConfiguredItem[] = [];
  
  for (const preset of presets) {
    let itemValue: Record<string, unknown> | undefined;
    let enabled = false;
    
    if (category === 'models') {
      // 模型配置在 models.providers.<id> 下
      const providers = (value.models as Record<string, unknown>)?.providers as Record<string, unknown> | undefined;
      itemValue = providers?.[preset.id] as Record<string, unknown> | undefined;
      enabled = !!itemValue?.apiKey || !!itemValue?.baseUrl;
    } else if (category === 'channels') {
      // 渠道配置在对应的顶级键下
      itemValue = value[preset.id] as Record<string, unknown> | undefined;
      enabled = itemValue?.enabled !== false && Object.keys(itemValue ?? {}).length > 0;
    } else if (category === 'tools') {
      // 工具配置使用 configPath 获取值
      const path = configPathToArray(preset.configPath);
      itemValue = getValueAtPath(value, path);
      // 对于同一个 configPath 的多个预设，检查 provider 字段来区分
      if (itemValue && preset.defaultValues?.provider) {
        // 只匹配 provider 相同的预设
        if (itemValue.provider !== preset.defaultValues.provider) {
          continue;
        }
      }
      enabled = itemValue?.enabled !== false;
    }
    
    if (itemValue && Object.keys(itemValue).length > 0) {
      items.push({ preset, values: itemValue, enabled });
    }
  }
  
  return items;
}

// 获取未配置的预设（用于添加）
function getAvailablePresets(
  category: PresetCategory,
  value: Record<string, unknown> | null,
  presets: PresetItem[]
): PresetItem[] {
  const configured = getConfiguredItems(category, value, presets);
  const configuredIds = new Set(configured.map(c => c.preset.id));
  return presets.filter(p => !configuredIds.has(p.id));
}

// 渲染单个配置项卡片
function renderConfigCard(
  item: ConfiguredItem,
  onEdit: (id: string) => void,
  onDelete: (id: string) => void,
  onToggle: (id: string, enabled: boolean) => void
): TemplateResult {
  const { preset, values, enabled } = item;
  const hasApiKey = !!(values.apiKey || values.token || values.secret);
  const statusIcon = hasApiKey ? '🟢' : '🟡';
  const statusText = hasApiKey ? '已配置' : '未配置密钥';
  
  return html`
    <div class="preset-card ${enabled ? '' : 'preset-card--disabled'}">
      <div class="preset-card__header">
        <span class="preset-card__icon">${preset.icon}</span>
        <div class="preset-card__info">
          <h4 class="preset-card__name">${preset.name}</h4>
          <span class="preset-card__status">${statusIcon} ${statusText}</span>
        </div>
        <div class="preset-card__actions">
          <button class="preset-btn preset-btn--icon" title="编辑" @click=${() => onEdit(preset.id)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="preset-btn preset-btn--icon preset-btn--danger" title="删除" @click=${() => onDelete(preset.id)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
      <p class="preset-card__desc">${preset.description}</p>
    </div>
  `;
}

// 渲染预设选择器（用于添加新配置）
function renderPresetPicker(
  presets: PresetItem[],
  onSelect: (id: string) => void
): TemplateResult {
  if (presets.length === 0) {
    return html`<p class="preset-empty">所有可用选项都已添加</p>`;
  }
  
  // 按区域分组
  const chinaPresets = presets.filter(p => p.region === 'china');
  const intlPresets = presets.filter(p => p.region === 'international');
  const otherPresets = presets.filter(p => !p.region);
  
  const renderGroup = (items: PresetItem[], title?: string) => {
    if (items.length === 0) return nothing;
    return html`
      ${title ? html`<h5 class="preset-picker__group-title">${title}</h5>` : nothing}
      <div class="preset-picker__grid">
        ${items.map(preset => html`
          <button class="preset-picker__item" @click=${() => onSelect(preset.id)}>
            <span class="preset-picker__icon">${preset.icon}</span>
            <span class="preset-picker__name">${preset.name}</span>
          </button>
        `)}
      </div>
    `;
  };
  
  return html`
    <div class="preset-picker">
      ${renderGroup(chinaPresets, chinaPresets.length > 0 && intlPresets.length > 0 ? '🇨🇳 国内 (已更新)' : undefined)}
      ${renderGroup(intlPresets, chinaPresets.length > 0 && intlPresets.length > 0 ? '🌍 国际' : undefined)}
      ${renderGroup(otherPresets)}
    </div>
  `;
}

// 渲染编辑表单
function renderEditForm(
  preset: PresetItem,
  values: Record<string, unknown>,
  onSave: (values: Record<string, unknown>) => void,
  onCancel: () => void
): TemplateResult {
  // 展平嵌套值用于表单显示
  const flatValues = flattenForForm(values);
  const formValues = { ...preset.defaultValues, ...flatValues };
  
  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const newValues: Record<string, unknown> = {};
    for (const field of preset.fields) {
      // 处理 hidden 类型字段，使用预设定义的值
      if (field.type === 'hidden') {
        newValues[field.key] = field.value ?? preset.defaultValues?.[field.key];
        continue;
      }
      const value = formData.get(field.key);
      if (field.type === 'toggle') {
        newValues[field.key] = form.querySelector<HTMLInputElement>(`[name="${field.key}"]`)?.checked ?? false;
      } else if (field.type === 'number') {
        newValues[field.key] = value ? Number(value) : undefined;
      } else {
        newValues[field.key] = value || undefined;
      }
    }
    onSave(newValues);
  };
  
  return html`
    <div class="preset-edit">
      <div class="preset-edit__header">
        <span class="preset-edit__icon">${preset.icon}</span>
        <h3 class="preset-edit__title">${preset.name}</h3>
      </div>
      <form class="preset-edit__form" @submit=${handleSubmit}>
        ${preset.fields.filter(f => f.type !== 'hidden').map(field => html`
          <div class="preset-field">
            <label class="preset-field__label">
              ${field.label}
              ${field.required ? html`<span class="preset-field__required">*</span>` : nothing}
            </label>
            ${field.type === 'select' ? html`
              <select class="preset-field__input" name="${field.key}">
                ${field.options?.map(opt => html`
                  <option value="${opt.value}" ?selected=${formValues[field.key] === opt.value}>${opt.label}</option>
                `)}
              </select>
            ` : field.type === 'toggle' ? html`
              <label class="preset-toggle">
                <input type="checkbox" name="${field.key}" ?checked=${!!formValues[field.key]}>
                <span class="preset-toggle__slider"></span>
              </label>
            ` : html`
              <input
                class="preset-field__input"
                type="${field.type === 'password' ? 'password' : field.type === 'number' ? 'number' : 'text'}"
                name="${field.key}"
                .value=${String(formValues[field.key] ?? '')}
                placeholder="${field.placeholder ?? ''}"
                ?required=${field.required}
              >
            `}
            ${field.hint ? html`<p class="preset-field__hint">${field.hint}</p>` : nothing}
          </div>
        `)}
        <div class="preset-edit__actions">
          <button type="button" class="preset-btn preset-btn--secondary" @click=${onCancel}>取消</button>
          <button type="submit" class="preset-btn preset-btn--primary">保存</button>
        </div>
      </form>
    </div>
  `;
}

// 渲染分类区块
function renderCategorySection(
  title: string,
  icon: string,
  category: PresetCategory,
  presets: PresetItem[],
  props: ConfigFormProps,
  editingId: string | null,
  showPicker: boolean,
  onEditStart: (id: string | null) => void,
  onPickerToggle: (show: boolean) => void
): TemplateResult {
  const configured = getConfiguredItems(category, props.value, presets);
  const available = getAvailablePresets(category, props.value, presets);
  
  const handleEdit = (id: string) => onEditStart(id);
  const handleDelete = (id: string) => {
    const preset = presets.find(p => p.id === id);
    if (!preset) return;
    // 使用 configPath 构建删除路径
    if (category === 'models') {
      props.onPatch(['models', 'providers', id], undefined);
    } else if (category === 'channels') {
      props.onPatch([id], undefined);
    } else {
      const path = configPathToArray(preset.configPath);
      props.onPatch(path, undefined);
    }
  };
  const handleToggle = (id: string, enabled: boolean) => {
    const preset = presets.find(p => p.id === id);
    if (!preset) return;
    if (category === 'models') {
      props.onPatch(['models', 'providers', id, 'enabled'], enabled);
    } else if (category === 'channels') {
      props.onPatch([id, 'enabled'], enabled);
    } else {
      const path = configPathToArray(preset.configPath);
      props.onPatch([...path, 'enabled'], enabled);
    }
  };
  const handleAdd = (id: string) => {
    const preset = presets.find(p => p.id === id);
    if (!preset) return;
    const defaultValues = preset.defaultValues ?? {};
    if (category === 'models') {
      props.onPatch(['models', 'providers', id], defaultValues);
    } else if (category === 'channels') {
      props.onPatch([id], { enabled: true, ...defaultValues });
    } else {
      // 使用 configPath 构建保存路径
      const path = configPathToArray(preset.configPath);
      props.onPatch(path, { enabled: true, ...defaultValues });
    }
    onPickerToggle(false);
    onEditStart(id);
  };
  const handleSave = (id: string, values: Record<string, unknown>) => {
    const preset = presets.find(p => p.id === id);
    if (!preset) return;
    if (category === 'models') {
      props.onPatch(['models', 'providers', id], values);
    } else if (category === 'channels') {
      props.onPatch([id], values);
    } else {
      // 使用 configPath 构建保存路径，并展开嵌套字段
      const path = configPathToArray(preset.configPath);
      // 处理嵌套字段如 'searxng.baseUrl' -> { searxng: { baseUrl: value } }
      const expandedValues = expandNestedValues(values);
      props.onPatch(path, expandedValues);
    }
    onEditStart(null);
  };
  
  // 如果正在编辑某个项目
  const editingPreset = editingId ? presets.find(p => p.id === editingId) : null;
  const editingValues = editingId ? configured.find(c => c.preset.id === editingId)?.values ?? {} : {};
  
  if (editingPreset) {
    return html`
      <section class="preset-section">
        <div class="preset-section__header">
          <span class="preset-section__icon">${icon}</span>
          <h3 class="preset-section__title">${title}</h3>
        </div>
        ${renderEditForm(editingPreset, editingValues, (values) => handleSave(editingId!, values), () => onEditStart(null))}
      </section>
    `;
  }
  
  return html`
    <section class="preset-section">
      <div class="preset-section__header">
        <span class="preset-section__icon">${icon}</span>
        <h3 class="preset-section__title">${title}</h3>
        <button class="preset-btn preset-btn--add" @click=${() => onPickerToggle(!showPicker)}>
          ${showPicker ? '取消' : '+ 添加'}
        </button>
      </div>
      
      ${showPicker ? html`
        <div class="preset-section__picker">
          ${renderPresetPicker(available, handleAdd)}
        </div>
      ` : nothing}
      
      <div class="preset-section__list">
        ${configured.length === 0 ? html`
          <p class="preset-empty">暂无配置，点击"+ 添加"开始</p>
        ` : configured.map(item => renderConfigCard(item, handleEdit, handleDelete, handleToggle))}
      </div>
    </section>
  `;
}

// 状态管理（简单的闭包状态）
let editingState: { category: PresetCategory | null; id: string | null } = { category: null, id: null };
let pickerState: { category: PresetCategory | null } = { category: null };

// 主渲染函数
export function renderConfigForm(props: ConfigFormProps): TemplateResult {
  const { activeSection } = props;
  
  // 如果有活动区块，只渲染该区块
  const sections: Array<{ key: string; title: string; icon: string; category: PresetCategory; presets: PresetItem[] }> = [
    { key: 'models', title: '模型供应商', icon: '🤖', category: 'models', presets: MODEL_PRESETS },
    { key: 'channels', title: '消息渠道', icon: '💬', category: 'channels', presets: CHANNEL_PRESETS },
    { key: 'tools', title: '工具', icon: '🛠️', category: 'tools', presets: TOOL_PRESETS },
  ];
  
  const filtered = activeSection 
    ? sections.filter(s => s.key === activeSection)
    : sections;
  
  return html`
    <div class="preset-manager">
      ${filtered.map(section => {
        const isEditing = editingState.category === section.category;
        const showPicker = pickerState.category === section.category;
        
        return renderCategorySection(
          section.title,
          section.icon,
          section.category,
          section.presets,
          props,
          isEditing ? editingState.id : null,
          showPicker,
          (id) => {
            if (id) {
              editingState = { category: section.category, id };
            } else {
              editingState = { category: null, id: null };
            }
          },
          (show) => {
            pickerState = { category: show ? section.category : null };
          }
        );
      })}
    </div>
  `;
}
