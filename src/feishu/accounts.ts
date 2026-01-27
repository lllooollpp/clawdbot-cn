import type { ClawdbotConfig } from "../config/config.js";
import { DEFAULT_ACCOUNT_ID } from "../routing/session-key.js";
import type { FeishuAccountConfig, ResolvedFeishuAccount } from "./types.js";

export function listFeishuAccountIds(cfg: ClawdbotConfig): string[] {
  const ids = new Set<string>();
  const feishu = cfg.channels?.feishu;
  if (feishu) {
    ids.add(DEFAULT_ACCOUNT_ID);
    if (feishu.accounts) {
      for (const id of Object.keys(feishu.accounts)) {
        ids.add(id);
      }
    }
  }
  return Array.from(ids);
}

export function resolveDefaultFeishuAccountId(cfg: ClawdbotConfig): string {
  const feishu = cfg.channels?.feishu;
  return feishu?.accounts
    ? (Object.keys(feishu.accounts)[0] ?? DEFAULT_ACCOUNT_ID)
    : DEFAULT_ACCOUNT_ID;
}

export function resolveFeishuAccount(params: {
  cfg: ClawdbotConfig;
  accountId?: string | null;
}): ResolvedFeishuAccount {
  const { cfg, accountId = DEFAULT_ACCOUNT_ID } = params;
  const feishu = cfg.channels?.feishu;
  const targetId = accountId ?? DEFAULT_ACCOUNT_ID;
  if (!feishu) {
    return {
      accountId: targetId,
      enabled: false,
      config: {} as any,
    };
  }

  const account = targetId === DEFAULT_ACCOUNT_ID ? feishu : (feishu as any).accounts?.[targetId];
  if (!account) {
    return {
      accountId: targetId,
      enabled: false,
      config: {} as any,
    };
  }

  const appId = (account as any).appId || process.env.FEISHU_APP_ID;
  const appIdSource = (account as any).appId
    ? "config"
    : process.env.FEISHU_APP_ID
      ? "env"
      : "none";

  return {
    accountId: targetId,
    name: (account as any).name,
    enabled: (account as any).enabled ?? feishu.enabled ?? false,
    appId,
    appSecret: (account as any).appSecret || process.env.FEISHU_APP_SECRET,
    encryptKey: (account as any).encryptKey || process.env.FEISHU_ENCRYPT_KEY,
    verificationToken: (account as any).verificationToken || process.env.FEISHU_VERIFICATION_TOKEN,
    config: account as FeishuAccountConfig,
    appIdSource,
  };
}
