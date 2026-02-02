// This file provides onboarding logic for the Feishu channel.

export const feishuOnboardingAdapter = {
  channel: "feishu",

  getStatus: async (ctx: any) => {
    const { cfg } = ctx;
    const feishu = cfg.channels?.feishu || {};
    const configured = Boolean(feishu.appId && feishu.appSecret);

    return {
      channel: "feishu",
      configured,
      statusLines: [
        `飞书: ${configured ? "已配置" : "未配置 (需要 App ID/App Secret)"}${
          feishu.enabled === false ? " (已禁用)" : ""
        }`,
      ],
      selectionHint: configured ? "已配置" : "未配置",
      quickstartScore: configured ? 0 : 3,
    };
  },

  configure: async (ctx: any) => {
    const { cfg, prompter } = ctx;
    const feishu = cfg.channels?.feishu || {};

    const formResult = await prompter.form({
      title: "飞书配置",
      message: "请输入飞书开放平台应用的参数。你可以在飞书控制台的「凭证与基础信息」中找到这些信息。",
      fields: [
        {
          key: "appId",
          label: "App ID (cli_...)",
          type: "text",
          initialValue: feishu.appId,
          placeholder: "cli_...",
        },
        {
          key: "appSecret",
          label: "App Secret",
          type: "password",
          initialValue: feishu.appSecret,
        },
        {
          key: "encryptKey",
          label: "Encrypt Key (可选)",
          type: "text",
          initialValue: feishu.encryptKey,
          placeholder: "用于消息解密",
        },
        {
          key: "verificationToken",
          label: "Verification Token (可选)",
          type: "text",
          initialValue: feishu.verificationToken,
          placeholder: "用于消息校验",
        },
      ],
    });

    const appId = String(formResult.appId ?? "").trim();
    const appSecret = String(formResult.appSecret ?? "").trim();
    const encryptKey = String(formResult.encryptKey ?? "").trim();
    const verificationToken = String(formResult.verificationToken ?? "").trim();

    if (!appId || !appSecret) {
      throw new Error("App ID and App Secret are required");
    }

    const next = { ...cfg };
    if (!next.channels) next.channels = {};
    next.channels.feishu = {
      ...next.channels.feishu,
      enabled: true,
      appId,
      appSecret,
      encryptKey,
      verificationToken,
    };

    return { cfg: next, accountId: "default" };
  },
};
