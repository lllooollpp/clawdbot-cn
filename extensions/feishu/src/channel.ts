import {
  FeishuConfigSchema,
  getFeishuRuntime,
  resolveFeishuAccount,
  listFeishuAccountIds,
  DEFAULT_ACCOUNT_ID,
  buildChannelConfigSchema,
  type ChannelPlugin,
} from "clawdbot/plugin-sdk";
import { getFeishuClient } from "./runtime.js";

export const feishuPlugin: ChannelPlugin<any> = {
  id: "feishu",
  meta: {
    id: "feishu",
    label: "飞书 (Feishu/Lark)",
    selectionLabel: "飞书 (Feishu/Lark)",
    detailLabel: "飞书",
    docsPath: "/channels/feishu",
    blurb: "可以通过飞书开放平台 Webhook 进行消息收发。",
    systemImage: "send",
  },
  capabilities: {
    chatTypes: ["direct", "group"],
    reactions: false,
    threads: true,
    media: true,
  },
  reload: { configPrefixes: ["channels.feishu"] },
  configSchema: buildChannelConfigSchema(FeishuConfigSchema),
  config: {
    listAccountIds: (cfg) => listFeishuAccountIds(cfg),
    resolveAccount: (cfg, accountId) => resolveFeishuAccount({ cfg, accountId }),
  },

  ready: async ({ accountId = DEFAULT_ACCOUNT_ID }) => {
    const { appId, appSecret, enabled } = resolveFeishuAccount({
      cfg: getFeishuRuntime().config,
      accountId,
    });
    if (!enabled) return false;
    return !!(appId && appSecret);
  },

  status: async ({ accountId = DEFAULT_ACCOUNT_ID }) => {
    const { appId, enabled } = resolveFeishuAccount({
      cfg: getFeishuRuntime().config,
      accountId,
    });
    if (!enabled) return { status: "disabled" };
    if (!appId) return { status: "error", issues: ["Missing App ID"] };
    
    try {
      // Simple verification call
      const client = getFeishuClient(accountId);
      const tenantInfo = await client.tokenManager.getTenantAccessToken();
      return { 
        status: "ok", 
        detail: `App ID: ${appId}`,
        metadata: { appId } 
      };
    } catch (err: any) {
      return { status: "error", issues: [err.message] };
    }
  },

  outbound: {
    deliveryMode: "direct",
    sendText: async (ctx) => {
      const { accountId = DEFAULT_ACCOUNT_ID, to, text, threadId, replyToId } = ctx;
      const client = getFeishuClient(accountId || DEFAULT_ACCOUNT_ID);

      const receive_id_type = to.startsWith('oc_') ? 'chat_id' : 'open_id';
      const content = JSON.stringify({ text });

      try {
        // Feishu reply to thread or specific message
        const targetMessageId = replyToId || threadId;
        
        if (targetMessageId) {
          await client.im.message.reply({
            path: { message_id: String(targetMessageId) },
            data: {
              content,
              msg_type: 'text',
              uuid: ctx.deps?.messageId || undefined,
            },
          });
        } else {
          await client.im.message.create({
            params: { receive_id_type },
            data: {
              receive_id: to,
              content,
              msg_type: 'text',
              uuid: ctx.deps?.messageId || undefined,
            },
          });
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },
  },
};
