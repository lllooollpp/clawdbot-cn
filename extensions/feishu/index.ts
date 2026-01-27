import type { ClawdbotPluginApi } from "clawdbot/plugin-sdk";
import { emptyPluginConfigSchema } from "clawdbot/plugin-sdk";

import { feishuPlugin } from "./src/channel.js";
import { setFeishuRuntime } from "./src/runtime.js";

const plugin = {
  id: "feishu",
  name: "飞书 (Feishu/Lark)",
  description: "飞书 (Lark) 渠道插件",
  configSchema: emptyPluginConfigSchema(),
  register(api: ClawdbotPluginApi) {
    setFeishuRuntime(api.runtime);
    api.registerChannel({ plugin: feishuPlugin });
  },
};

export default plugin;
