import { DEFAULT_ACCOUNT_ID } from "../../../routing/session-key.js";
import { resolveDefaultWeComAccountId, resolveWeComAccount } from "../../../wecom/accounts.js";
import { getChatChannelMeta } from "../../registry.js";
import type {
  ChannelOnboardingAdapter,
  ChannelOnboardingResult,
  ChannelOnboardingStatusContext,
} from "../onboarding-types.js";
import { promptAccountId } from "./helpers.js";

export const wecomOnboardingAdapter: ChannelOnboardingAdapter = {
  channel: "wecom",

  getStatus: async (ctx: ChannelOnboardingStatusContext) => {
    const accountId = ctx.accountOverrides.wecom ?? resolveDefaultWeComAccountId(ctx.cfg);
    const account = resolveWeComAccount({ cfg: ctx.cfg, accountId });
    const configured = Boolean(account.corpId && account.agentId && account.secret);
    const label = getChatChannelMeta("wecom").label;

    return {
      channel: "wecom",
      configured,
      statusLines: [
        `${label}: ${
          configured ? "已配置" : "未配置 (需要 CorpID/AgentID/Secret)"
        }${account.enabled === false ? " (已禁用)" : ""}`,
      ],
      selectionHint: configured ? "已配置" : "未配置",
      quickstartScore: configured ? 0 : 3,
    };
  },

  configure: async (ctx) => {
    const { cfg, prompter, shouldPromptAccountIds } = ctx;

    const accountId = shouldPromptAccountIds
      ? await promptAccountId({
          cfg,
          prompter,
          label: "企业微信 (WeCom)",
          listAccountIds: (c) => {
            const wecom = c.channels?.wecom;
            if (!wecom) return [];
            const ids = new Set<string>();
            if (wecom.corpId) ids.add(DEFAULT_ACCOUNT_ID);
            if (wecom.accounts) Object.keys(wecom.accounts).forEach((id) => ids.add(id));
            return Array.from(ids);
          },
          defaultAccountId: resolveDefaultWeComAccountId(cfg),
        })
      : resolveDefaultWeComAccountId(cfg);

    const account = resolveWeComAccount({ cfg, accountId });

    const formResult = await prompter.form({
      title: "企业微信配置",
      message: "请输入应用的相关参数。你可以在企业微信后台的「应用管理」中找到这些信息。",
      fields: [
        {
          key: "corpId",
          label: "企业 ID (CorpID)",
          type: "text",
          initialValue: account.corpId,
          placeholder: "ww...",
        },
        {
          key: "agentId",
          label: "应用 AgentID",
          type: "text",
          initialValue: account.agentId,
          placeholder: "1000002",
        },
        {
          key: "secret",
          label: "应用 Secret",
          type: "password",
          initialValue: account.secret,
        },
        {
          key: "token",
          label: "Webhook Token (可选)",
          type: "text",
          initialValue: account.token,
          placeholder: "用于接收消息校验",
        },
        {
          key: "encodingAesKey",
          label: "EncodingAESKey (可选)",
          type: "text",
          initialValue: account.encodingAesKey,
          placeholder: "用于消息解密",
        },
      ],
    });

    const corpId = String(formResult.corpId ?? "").trim();
    const agentId = String(formResult.agentId ?? "").trim();
    const secret = String(formResult.secret ?? "").trim();
    const token = String(formResult.token ?? "").trim();
    const encodingAesKey = String(formResult.encodingAesKey ?? "").trim();

    if (!corpId || !agentId || !secret) {
      throw new Error("CorpID, AgentID and Secret are required");
    }

    const next: any = { ...cfg };
    if (!next.channels) next.channels = {};
    if (!next.channels.wecom) next.channels.wecom = {};

    const config: any = {
      enabled: true,
      corpId,
      agentId,
      secret,
      token,
      encodingAesKey,
    };

    if (accountId === DEFAULT_ACCOUNT_ID) {
      next.channels.wecom = {
        ...next.channels.wecom,
        ...config,
      };
    } else {
      if (!next.channels.wecom.accounts) next.channels.wecom.accounts = {};
      next.channels.wecom.accounts[accountId] = {
        ...next.channels.wecom.accounts[accountId],
        ...config,
      };
    }

    return { cfg: next, accountId } as ChannelOnboardingResult;
  },
};
