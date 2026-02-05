/**
 * 预设配置定义
 * 用于"预设配置管理"系统，提供常用配置模板
 */

export type PresetCategory = 'models' | 'channels' | 'tools' | 'gateway' | 'agents' | 'system';

export type PresetItem = {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: PresetCategory;
  region?: 'china' | 'international';
  fields: PresetField[];
  defaultValues?: Record<string, unknown>;
  configPath?: string;
};

export type PresetField = {
  key: string;
  label: string;
  type: 'text' | 'password' | 'select' | 'toggle' | 'number' | 'textarea' | 'hidden';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  hint?: string;
  value?: unknown; // 用于 hidden 类型字段的固定值
};

// ============ 模型供应商预设 ============

export const MODEL_PRESETS: PresetItem[] = [
  // 国内模型
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: '🧠',
    description: 'DeepSeek AI 大模型',
    category: 'models',
    region: 'china',
    configPath: 'models.providers.deepseek',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'sk-...' },
      { key: 'baseUrl', label: 'Base URL', type: 'text', placeholder: 'https://api.deepseek.com' },
    ],
    defaultValues: { baseUrl: 'https://api.deepseek.com' },
  },
  {
    id: 'siliconflow',
    name: '硅基流动',
    icon: '🌊',
    description: 'SiliconFlow 模型平台',
    category: 'models',
    region: 'china',
    configPath: 'models.providers.siliconflow',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'baseUrl', label: 'Base URL', type: 'text', placeholder: 'https://api.siliconflow.cn/v1' },
    ],
    defaultValues: { baseUrl: 'https://api.siliconflow.cn/v1' },
  },
  {
    id: 'volcengine',
    name: '火山引擎 (豆包)',
    icon: '🌋',
    description: '字节跳动火山引擎 Doubao 模型',
    category: 'models',
    region: 'china',
    configPath: 'models.providers.volcengine',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'baseUrl', label: 'Base URL', type: 'text', placeholder: 'https://ark.cn-beijing.volces.com/api/v3' },
    ],
    defaultValues: { baseUrl: 'https://ark.cn-beijing.volces.com/api/v3' },
  },
  {
    id: 'qwen',
    name: '通义千问',
    icon: '🔮',
    description: '阿里云 Qwen / DashScope',
    category: 'models',
    region: 'china',
    configPath: 'models.providers.qwen',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'baseUrl', label: 'Base URL', type: 'text', placeholder: 'https://dashscope.aliyuncs.com/compatible-mode/v1' },
    ],
    defaultValues: { baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1' },
  },
  {
    id: 'lmstudio',
    name: 'LM Studio',
    icon: '🏠',
    description: '本地运行的 LM Studio',
    category: 'models',
    region: 'china',
    configPath: 'models.providers.lmstudio',
    fields: [
      { key: 'baseUrl', label: 'Base URL', type: 'text', required: true, placeholder: 'http://localhost:1234/v1' },
    ],
    defaultValues: { baseUrl: 'http://localhost:1234/v1' },
  },
  {
    id: 'ollama',
    name: 'Ollama',
    icon: '🦙',
    description: '本地 Ollama 模型',
    category: 'models',
    region: 'china',
    configPath: 'models.providers.ollama',
    fields: [
      { key: 'baseUrl', label: 'Base URL', type: 'text', required: true, placeholder: 'http://localhost:11434' },
    ],
    defaultValues: { baseUrl: 'http://localhost:11434' },
  },
  // 国际模型
  {
    id: 'openai',
    name: 'OpenAI',
    icon: '🤖',
    description: 'GPT-4o, GPT-4, GPT-3.5',
    category: 'models',
    region: 'international',
    configPath: 'models.providers.openai',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'sk-...' },
      { key: 'baseUrl', label: 'Base URL', type: 'text', placeholder: 'https://api.openai.com/v1' },
    ],
    defaultValues: { baseUrl: 'https://api.openai.com/v1' },
  },
  {
    id: 'copilot',
    name: 'GitHub Copilot',
    icon: '🐙',
    description: '通过 Copilot Proxy 使用 GitHub 提供的模型',
    category: 'models',
    region: 'international',
    configPath: 'models.providers.copilot',
    fields: [
      { key: 'baseUrl', label: 'Base URL', type: 'text', placeholder: 'http://localhost:18181/v1' },
      { key: 'api', label: 'API 类型', type: 'hidden', value: 'github-copilot' },
    ],
    defaultValues: { baseUrl: 'http://localhost:18181/v1', api: 'github-copilot' },
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    icon: '🧩',
    description: 'Claude 3.5, Claude 3',
    category: 'models',
    region: 'international',
    configPath: 'models.providers.anthropic',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
    ],
  },
  {
    id: 'google',
    name: 'Google AI',
    icon: '🔷',
    description: 'Gemini Pro, Gemini Ultra',
    category: 'models',
    region: 'international',
    configPath: 'models.providers.google',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
    ],
  },
  {
    id: 'bedrock',
    name: 'Amazon Bedrock',
    icon: '☁️',
    description: 'AWS Bedrock 托管模型',
    category: 'models',
    region: 'international',
    configPath: 'models.providers.bedrock',
    fields: [
      { key: 'region', label: 'AWS Region', type: 'text', required: true, placeholder: 'us-east-1' },
      { key: 'accessKeyId', label: 'Access Key ID', type: 'password' },
      { key: 'secretAccessKey', label: 'Secret Access Key', type: 'password' },
    ],
    defaultValues: { region: 'us-east-1' },
  },
  {
    id: 'azure',
    name: 'Azure OpenAI',
    icon: '🔵',
    description: 'Azure 托管的 OpenAI 服务',
    category: 'models',
    region: 'international',
    configPath: 'models.providers.azure',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'endpoint', label: 'Endpoint', type: 'text', required: true, placeholder: 'https://xxx.openai.azure.com' },
      { key: 'deploymentName', label: 'Deployment Name', type: 'text', required: true },
    ],
  },
];

// ============ 渠道预设 ============

export const CHANNEL_PRESETS: PresetItem[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: '💬',
    description: 'WhatsApp 消息渠道',
    category: 'channels',
    configPath: 'channels.whatsapp',
    fields: [
      { key: 'enabled', label: '启用', type: 'toggle' },
    ],
    defaultValues: { enabled: true },
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: '✈️',
    description: 'Telegram Bot',
    category: 'channels',
    configPath: 'channels.telegram',
    fields: [
      { key: 'token', label: 'Bot Token', type: 'password', required: true },
    ],
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: '🎮',
    description: 'Discord Bot',
    category: 'channels',
    configPath: 'channels.discord',
    fields: [
      { key: 'token', label: 'Bot Token', type: 'password', required: true },
      { key: 'applicationId', label: 'Application ID', type: 'text' },
    ],
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: '📢',
    description: 'Slack 工作区集成',
    category: 'channels',
    configPath: 'channels.slack',
    fields: [
      { key: 'token', label: 'Bot Token', type: 'password', required: true },
      { key: 'signingSecret', label: 'Signing Secret', type: 'password' },
    ],
  },
  {
    id: 'wecom',
    name: '企业微信',
    icon: '💼',
    description: '企业微信机器人',
    category: 'channels',
    region: 'china',
    configPath: 'channels.wecom',
    fields: [
      { key: 'corpId', label: '企业 ID', type: 'text', required: true },
      { key: 'agentId', label: '应用 ID', type: 'text', required: true },
      { key: 'secret', label: '应用 Secret', type: 'password', required: true },
    ],
  },
  {
    id: 'feishu',
    name: '飞书',
    icon: '🪶',
    description: '飞书机器人',
    category: 'channels',
    region: 'china',
    configPath: 'channels.feishu',
    fields: [
      { key: 'appId', label: 'App ID', type: 'text', required: true },
      { key: 'appSecret', label: 'App Secret', type: 'password', required: true },
    ],
  },
  {
    id: 'signal',
    name: 'Signal',
    icon: '🔐',
    description: 'Signal 安全消息',
    category: 'channels',
    configPath: 'channels.signal',
    fields: [
      { key: 'enabled', label: '启用', type: 'toggle' },
    ],
    defaultValues: { enabled: true },
  },
  {
    id: 'imessage',
    name: 'iMessage',
    icon: '🍎',
    description: 'Apple iMessage (需要 Mac)',
    category: 'channels',
    configPath: 'channels.imessage',
    fields: [
      { key: 'enabled', label: '启用', type: 'toggle' },
    ],
    defaultValues: { enabled: true },
  },
  {
    id: 'matrix',
    name: 'Matrix',
    icon: '🔷',
    description: 'Matrix/Element 协议',
    category: 'channels',
    configPath: 'channels.matrix',
    fields: [
      { key: 'homeserver', label: 'Homeserver URL', type: 'text', required: true },
      { key: 'accessToken', label: 'Access Token', type: 'password', required: true },
    ],
  },
];

// ============ 工具预设 ============

export const TOOL_PRESETS: PresetItem[] = [
  {
    id: 'browser',
    name: '浏览器',
    icon: '🌐',
    description: '网页浏览和抓取',
    category: 'tools',
    configPath: 'tools.browser',
    fields: [
      { key: 'enabled', label: '启用', type: 'toggle' },
      { key: 'headless', label: '无头模式', type: 'toggle' },
    ],
    defaultValues: { enabled: true, headless: true },
  },
  {
    id: 'web-fetch-domestic',
    name: '网页抓取 (国内优化)',
    icon: '🕸️',
    description: '针对国内环境优化的网页内容提取',
    category: 'tools',
    configPath: 'tools.web.fetch',
    fields: [
      { key: 'enabled', label: '启用', type: 'toggle' },
      { key: 'proxyUrl', label: '代理地址', type: 'text', placeholder: 'http://127.0.0.1:7890', hint: '用于访问国外网站，支持 HTTP/HTTPS 代理' },
      { key: 'jina.enabled', label: '启用 Jina Reader', type: 'toggle' },
      { key: 'jina.apiKey', label: 'Jina API Key', type: 'password', hint: '可选，免费版有速率限制' },
    ],
    defaultValues: { enabled: true, 'jina.enabled': true },
  },
  {
    id: 'search-searxng',
    name: 'SearXNG',
    icon: '🔎',
    description: '自建 SearXNG 搜索引擎（无需认证）',
    category: 'tools',
    configPath: 'tools.web.search',
    fields: [
      { key: 'provider', label: 'Provider', type: 'hidden', value: 'searxng' },
      { key: 'searxng.baseUrl', label: '服务地址', type: 'text', required: true, placeholder: 'http://localhost:8080' },
      { key: 'searxng.apiKey', label: 'API Key (可选)', type: 'password', hint: '如果 SearXNG 需要认证，填写这里' },
      { key: 'searxng.engines', label: '搜索引擎 (可选)', type: 'text', hint: '逗号分隔，如: google,bing' },
      { key: 'searxng.language', label: '语言 (可选)', type: 'text', placeholder: 'zh-CN' },
      { key: 'searxng.safesearch', label: '安全搜索', type: 'number', hint: '0=关闭, 1=中等, 2=严格' },
    ],
    defaultValues: { provider: 'searxng', 'searxng.baseUrl': 'http://localhost:8080' },
  },
  {
    id: 'search-bocha',
    name: 'Bocha 搜索',
    icon: '🔍',
    description: '博查搜索引擎',
    category: 'tools',
    region: 'china',
    configPath: 'tools.web.search',
    fields: [
      { key: 'provider', label: 'Provider', type: 'hidden', value: 'bocha' },
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
    ],
    defaultValues: { provider: 'bocha' },
  },
  {
    id: 'search-brave',
    name: 'Brave Search',
    icon: '🦁',
    description: 'Brave 搜索 API',
    category: 'tools',
    region: 'international',
    configPath: 'tools.web.search',
    fields: [
      { key: 'provider', label: 'Provider', type: 'hidden', value: 'brave' },
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
    ],
    defaultValues: { provider: 'brave' },
  },
  {
    id: 'search-perplexity',
    name: 'Perplexity',
    icon: '💡',
    description: 'Perplexity AI 搜索',
    category: 'tools',
    region: 'international',
    configPath: 'tools.web.search',
    fields: [
      { key: 'provider', label: 'Provider', type: 'hidden', value: 'perplexity' },
      { key: 'perplexity.apiKey', label: 'API Key', type: 'password', required: true },
    ],
    defaultValues: { provider: 'perplexity' },
  },
  {
    id: 'tts-edge',
    name: 'Edge TTS',
    icon: '🔊',
    description: '免费的 Edge 语音合成',
    category: 'tools',
    configPath: 'tools.tts.edge',
    fields: [
      { key: 'enabled', label: '启用', type: 'toggle' },
      { key: 'voice', label: '默认语音', type: 'select', options: [
        { value: 'zh-CN-XiaoxiaoNeural', label: '晓晓 (女)' },
        { value: 'zh-CN-YunxiNeural', label: '云希 (男)' },
        { value: 'zh-CN-YunjianNeural', label: '云健 (男)' },
        { value: 'en-US-JennyNeural', label: 'Jenny (Female)' },
        { value: 'en-US-GuyNeural', label: 'Guy (Male)' },
      ]},
    ],
    defaultValues: { enabled: true, voice: 'zh-CN-XiaoxiaoNeural' },
  },
  {
    id: 'tts-openai',
    name: 'OpenAI TTS',
    icon: '🎙️',
    description: 'OpenAI 语音合成',
    category: 'tools',
    region: 'international',
    configPath: 'tools.tts.openai',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'voice', label: '语音', type: 'select', options: [
        { value: 'alloy', label: 'Alloy' },
        { value: 'echo', label: 'Echo' },
        { value: 'fable', label: 'Fable' },
        { value: 'onyx', label: 'Onyx' },
        { value: 'nova', label: 'Nova' },
        { value: 'shimmer', label: 'Shimmer' },
      ]},
    ],
    defaultValues: { voice: 'alloy' },
  },
  {
    id: 'tts-aliyun',
    name: '阿里云 TTS',
    icon: '🔈',
    description: '阿里云语音合成',
    category: 'tools',
    region: 'china',
    configPath: 'tools.tts.aliyun',
    fields: [
      { key: 'accessKeyId', label: 'AccessKey ID', type: 'password', required: true },
      { key: 'accessKeySecret', label: 'AccessKey Secret', type: 'password', required: true },
      { key: 'appKey', label: 'App Key', type: 'text', required: true },
    ],
  },
  {
    id: 'image-dalle',
    name: 'DALL-E',
    icon: '🎨',
    description: 'OpenAI 图像生成',
    category: 'tools',
    region: 'international',
    configPath: 'tools.image.dalle',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'model', label: '模型', type: 'select', options: [
        { value: 'dall-e-3', label: 'DALL-E 3' },
        { value: 'dall-e-2', label: 'DALL-E 2' },
      ]},
    ],
    defaultValues: { model: 'dall-e-3' },
  },
  {
    id: 'image-wanxiang',
    name: '通义万相',
    icon: '🖼️',
    description: '阿里云 AI 图像生成',
    category: 'tools',
    region: 'china',
    configPath: 'tools.image.wanxiang',
    fields: [
      { key: 'apiKey', label: 'DashScope API Key', type: 'password', required: true },
    ],
  },
];

// ============ 网关/系统预设 ============

export const GATEWAY_PRESETS: PresetItem[] = [
  {
    id: 'gateway-basic',
    name: '网关设置',
    icon: '⚙️',
    description: '网关基础配置',
    category: 'gateway',
    configPath: 'gateway',
    fields: [
      { key: 'mode', label: '运行模式', type: 'select', options: [
        { value: 'local', label: '本地模式' },
        { value: 'remote', label: '远程模式' },
      ]},
      { key: 'port', label: '端口', type: 'number', placeholder: '19001' },
      { key: 'host', label: '绑定地址', type: 'text', placeholder: '127.0.0.1' },
    ],
    defaultValues: { mode: 'local', port: 19001, host: '127.0.0.1' },
  },
  {
    id: 'environment',
    name: '环境变量',
    icon: '🌍',
    description: '环境变量配置',
    category: 'system',
    configPath: 'environment',
    fields: [
      { key: 'variables', label: '环境变量 (JSON)', type: 'textarea', placeholder: '{"KEY": "value"}' },
    ],
  },
  {
    id: 'logging',
    name: '日志设置',
    icon: '📝',
    description: '日志级别和输出',
    category: 'system',
    configPath: 'logging',
    fields: [
      { key: 'level', label: '日志级别', type: 'select', options: [
        { value: 'debug', label: 'Debug' },
        { value: 'info', label: 'Info' },
        { value: 'warn', label: 'Warn' },
        { value: 'error', label: 'Error' },
      ]},
      { key: 'file', label: '日志文件路径', type: 'text', placeholder: '~/.clawdbot/logs/gateway.log' },
    ],
    defaultValues: { level: 'info' },
  },
];

// ============ 智能体预设 ============

export const AGENT_PRESETS: PresetItem[] = [
  {
    id: 'agent-default',
    name: '默认智能体',
    icon: '🤖',
    description: '基础智能体配置',
    category: 'agents',
    configPath: 'agents.default',
    fields: [
      { key: 'name', label: '名称', type: 'text', placeholder: 'Clawdbot' },
      { key: 'model', label: '模型', type: 'text', placeholder: 'gpt-4o' },
      { key: 'systemPrompt', label: '系统提示词', type: 'textarea' },
    ],
  },
];

// ============ 获取所有预设 ============

export function getAllPresets(): PresetItem[] {
  return [...MODEL_PRESETS, ...CHANNEL_PRESETS, ...TOOL_PRESETS, ...GATEWAY_PRESETS, ...AGENT_PRESETS];
}

export function getPresetsByCategory(category: PresetCategory): PresetItem[] {
  switch (category) {
    case 'models': return MODEL_PRESETS;
    case 'channels': return CHANNEL_PRESETS;
    case 'tools': return TOOL_PRESETS;
    case 'gateway': return GATEWAY_PRESETS;
    case 'agents': return AGENT_PRESETS;
    case 'system': return GATEWAY_PRESETS.filter(p => p.category === 'system');
  }
}

export function getPresetById(id: string): PresetItem | undefined {
  return getAllPresets().find(p => p.id === id);
}

export function groupPresetsByRegion(presets: PresetItem[]): { china: PresetItem[]; international: PresetItem[]; other: PresetItem[] } {
  return {
    china: presets.filter(p => p.region === 'china'),
    international: presets.filter(p => p.region === 'international'),
    other: presets.filter(p => !p.region),
  };
}
