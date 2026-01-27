import {
  WeComConfigSchema,
  getWeComRuntime,
  resolveWeComAccount,
  listWeComAccountIds,
  DEFAULT_ACCOUNT_ID,
  buildChannelConfigSchema,
  type ChannelPlugin,
} from "clawdbot/plugin-sdk";
import { getWeComClient } from "./runtime.js";

export const wecomPlugin: ChannelPlugin<any> = {
  id: "wecom",
  meta: {
    id: "wecom",
    label: "企业微信 (WeCom)",
    selectionLabel: "企业微信 (WeCom)",
    detailLabel: "企业微信",
    docsPath: "/channels/wecom",
    blurb: "支持通过企业微信自建应用进行消息收发。",
    systemImage: "bubble.left.and.bubble.right",
  },
  capabilities: {
    chatTypes: ["direct", "group"],
    reactions: false,
    threads: false, // WeCom primary message send doesn't support threads easily
    media: true,
  },
  reload: { configPrefixes: ["channels.wecom"] },
  configSchema: buildChannelConfigSchema(WeComConfigSchema),
  config: {
    listAccountIds: (cfg) => listWeComAccountIds(cfg),
    resolveAccount: (cfg, accountId) => resolveWeComAccount({ cfg, accountId }),
  },

  ready: async ({ accountId = DEFAULT_ACCOUNT_ID }) => {
    const { corpId, agentId, secret, enabled } = resolveWeComAccount({
      cfg: getWeComRuntime().config as any,
      accountId,
    });
    if (!enabled) return false;
    return !!(corpId && agentId && secret);
  },

  status: async ({ accountId = DEFAULT_ACCOUNT_ID }) => {
    const { corpId, enabled } = resolveWeComAccount({
      cfg: getWeComRuntime().config as any,
      accountId,
    });
    if (!enabled) return { status: "disabled" };
    if (!corpId) return { status: "error", issues: ["Missing Corp ID"] };
    
    try {
      const client = getWeComClient(accountId);
      await client.getAccessToken();
      return { 
        status: "ok", 
        detail: `Corp ID: ${corpId}`,
        metadata: { corpId } 
      };
    } catch (err: any) {
      return { status: "error", issues: [err.message] };
    }
  },

  outbound: {
    deliveryMode: "direct",
    sendText: async (ctx) => {
      const { accountId = DEFAULT_ACCOUNT_ID, to, text } = ctx;
      const { agentId } = resolveWeComAccount({
        cfg: getWeComRuntime().config as any,
        accountId,
      });
      const client = getWeComClient(accountId || DEFAULT_ACCOUNT_ID);

      try {
        await client.sendMessage({
          touser: to,
          msgtype: "text",
          agentid: agentId,
          text: { content: text },
          duplicate_check_interval: 1800
        });
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },
  },
};
