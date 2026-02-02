// This file is symlinked or copied to the extension dir
// It provides onboarding logic for the WeCom channel.

export const wecomOnboardingAdapter = {
  channel: "wecom",

  getStatus: async (ctx: any) => {
    const { cfg, accountOverrides } = ctx;
    // Simple check without full dependency on internal account helpers if possible
    // but we can try to use them since jiti will resolve them.
    const wecom = cfg.channels?.wecom || {};
    const configured = Boolean(wecom.corpId && wecom.agentId && wecom.secret);

    return {
      channel: "wecom",
      configured,
      statusLines: [
        `企业微信: ${configured ? "已配置" : "未配置 (需要 CorpID/AgentID/Secret)"}${
          wecom.enabled === false ? " (已禁用)" : ""
        }`,
      ],
      selectionHint: configured ? "已配置" : "未配置",
      quickstartScore: configured ? 0 : 3,
    };
  },

  configure: async (ctx: any) => {
    const { cfg, prompter } = ctx;
    const wecom = cfg.channels?.wecom || {};

    const formResult = await prompter.form({
      title: "企业微信配置",
      message: "请输入应用的相关参数。你可以在企业微信后台的「应用管理」中找到这些信息。",
      fields: [
        {
          key: "corpId",
          label: "企业 ID (CorpID)",
          type: "text",
          initialValue: wecom.corpId,
          placeholder: "ww...",
        },
        {
          key: "agentId",
          label: "应用 AgentID",
          type: "text",
          initialValue: wecom.agentId,
          placeholder: "1000002",
        },
        {
          key: "secret",
          label: "应用 Secret",
          type: "password",
          initialValue: wecom.secret,
        },
        {
          key: "token",
          label: "Webhook Token (可选)",
          type: "text",
          initialValue: wecom.token,
          placeholder: "用于接收消息校验",
        },
        {
          key: "encodingAesKey",
          label: "EncodingAESKey (可选)",
          type: "text",
          initialValue: wecom.encodingAesKey,
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

    const next = { ...cfg };
    if (!next.channels) next.channels = {};
    next.channels.wecom = {
      ...next.channels.wecom,
      enabled: true,
      corpId,
      agentId,
      secret,
      token,
      encodingAesKey,
    };

    return { cfg: next, accountId: "default" };
  },
};
