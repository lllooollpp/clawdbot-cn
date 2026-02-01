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

    const corpId = await prompter.input({
      message: "企业 ID (CorpID)",
      initialValue: account.corpId,
      placeholder: "ww...",
      validate: (v) => (v.trim() ? undefined : "CorpID 不能为空"),
    });

    const agentId = await prompter.input({
      message: "应用 AgentID",
      initialValue: account.agentId,
      placeholder: "1000002",
      validate: (v) => (v.trim() ? undefined : "AgentID 不能为空"),
    });

    const secret = await prompter.input({
      message: "应用 Secret",
      initialValue: account.secret,
      validate: (v) => (v.trim() ? undefined : "Secret 不能为空"),
    });

    const token = await prompter.input({
      message: "Webhook Token (可选)",
      initialValue: account.token,
      placeholder: "用于接收消息校验",
    });

    const encodingAesKey = await prompter.input({
      message: "EncodingAESKey (可选)",
      initialValue: account.encodingAesKey,
      placeholder: "用于消息解密",
    });

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
