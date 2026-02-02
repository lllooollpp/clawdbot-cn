import { DEFAULT_ACCOUNT_ID } from "../../../routing/session-key.js";
import { resolveDefaultFeishuAccountId, resolveFeishuAccount } from "../../../feishu/accounts.js";
import { getChatChannelMeta } from "../../registry.js";
import type {
  ChannelOnboardingAdapter,
  ChannelOnboardingResult,
  ChannelOnboardingStatusContext,
} from "../onboarding-types.js";
import { promptAccountId } from "./helpers.js";

export const feishuOnboardingAdapter: ChannelOnboardingAdapter = {
  channel: "feishu",

  getStatus: async (ctx: ChannelOnboardingStatusContext) => {
    const accountId = ctx.accountOverrides.feishu ?? resolveDefaultFeishuAccountId(ctx.cfg);
    const account = resolveFeishuAccount({ cfg: ctx.cfg, accountId });
    const configured = Boolean(account.appId && account.appSecret);
    const label = getChatChannelMeta("feishu").label;

    return {
      channel: "feishu",
      configured,
      statusLines: [
        `${label}: ${
          configured ? "已配置" : "未配置 (需要 App ID/App Secret)"
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
          label: "飞书 (Feishu/Lark)",
          listAccountIds: (c) => {
            const feishu = c.channels?.feishu;
            if (!feishu) return [];
            const ids = new Set<string>();
            if (feishu.appId) ids.add(DEFAULT_ACCOUNT_ID);
            if (feishu.accounts) Object.keys(feishu.accounts).forEach((id) => ids.add(id));
            return Array.from(ids);
          },
          defaultAccountId: resolveDefaultFeishuAccountId(cfg),
        })
      : resolveDefaultFeishuAccountId(cfg);

    const account = resolveFeishuAccount({ cfg, accountId });

    const formResult = await prompter.form({
      title: "飞书配置",
      message:
        "请输入飞书开放平台应用的参数。你可以在飞书控制台的「凭证与基础信息」中找到这些信息。",
      fields: [
        {
          key: "appId",
          label: "App ID (cli_...)",
          type: "text",
          initialValue: account.appId,
          placeholder: "cli_...",
        },
        {
          key: "appSecret",
          label: "App Secret",
          type: "password",
          initialValue: account.appSecret,
        },
        {
          key: "encryptKey",
          label: "Encrypt Key (可选)",
          type: "text",
          initialValue: account.encryptKey,
          placeholder: "用于消息解密",
        },
        {
          key: "verificationToken",
          label: "Verification Token (可选)",
          type: "text",
          initialValue: account.verificationToken,
          placeholder: "用于消息校验",
        },
      ],
    });

    const appId = ((formResult.appId as string) || "").trim();
    const appSecret = ((formResult.appSecret as string) || "").trim();
    const encryptKey = ((formResult.encryptKey as string) || "").trim();
    const verificationToken = ((formResult.verificationToken as string) || "").trim();

    if (!appId || !appSecret) {
      throw new Error("App ID and App Secret are required");
    }

    const next: any = { ...cfg };
    if (!next.channels) next.channels = {};
    if (!next.channels.feishu) next.channels.feishu = {};

    const config: any = {
      enabled: true,
      appId,
      appSecret,
      encryptKey,
      verificationToken,
    };

    if (accountId === DEFAULT_ACCOUNT_ID) {
      next.channels.feishu = {
        ...next.channels.feishu,
        ...config,
      };
    } else {
      if (!next.channels.feishu.accounts) next.channels.feishu.accounts = {};
      next.channels.feishu.accounts[accountId] = {
        ...next.channels.feishu.accounts[accountId],
        ...config,
      };
    }

    return { cfg: next, accountId } as ChannelOnboardingResult;
  },
};
