import type { WeComAccountConfig, WeComConfig, ClawdbotConfig } from "../config/types.js";
import { DEFAULT_ACCOUNT_ID, normalizeAccountId } from "../routing/session-key.js";
import type { ResolvedWeComAccount } from "./types.js";

function getWeComConfig(cfg: ClawdbotConfig): WeComConfig {
  return cfg.channels?.wecom ?? ({} as WeComConfig);
}

export function listWeComAccountIds(cfg: ClawdbotConfig): string[] {
  const wecom = getWeComConfig(cfg);
  const ids = new Set<string>();
  if (wecom.corpId) ids.add(DEFAULT_ACCOUNT_ID);
  if (wecom.accounts) {
    for (const id of Object.keys(wecom.accounts)) {
      ids.add(normalizeAccountId(id));
    }
  }
  return Array.from(ids);
}

export function resolveDefaultWeComAccountId(cfg: ClawdbotConfig): string {
  const wecom = getWeComConfig(cfg);
  if (wecom.defaultAccount) return normalizeAccountId(wecom.defaultAccount);
  if (wecom.corpId) return DEFAULT_ACCOUNT_ID;
  if (wecom.accounts) {
    const ids = Object.keys(wecom.accounts);
    if (ids.length > 0) return normalizeAccountId(ids[0]);
  }
  return DEFAULT_ACCOUNT_ID;
}

export function resolveWeComAccount(params: {
  cfg: ClawdbotConfig;
  accountId?: string | null;
}): ResolvedWeComAccount {
  const accountId = normalizeAccountId(
    params.accountId ?? resolveDefaultWeComAccountId(params.cfg),
  );
  const wecom = getWeComConfig(params.cfg);
  const base = wecom.accounts?.[accountId];

  const merged: WeComAccountConfig = {
    ...wecom,
    ...base,
  };

  return {
    id: accountId,
    name: merged.name ?? accountId,
    enabled: merged.enabled ?? true,
    corpId: merged.corpId ?? "",
    agentId: merged.agentId ?? "",
    secret: merged.secret ?? "",
    token: merged.token ?? "",
    encodingAesKey: merged.encodingAesKey ?? "",
    markdown: merged.markdown ?? { tables: "off" },
    dmPolicy: merged.dmPolicy ?? "pairing",
    allowFrom: merged.allowFrom ?? [],
    groupPolicy: merged.groupPolicy ?? "allowlist",
    groups: merged.groups ?? {},
    historyLimit: merged.historyLimit ?? 20,
    dmHistoryLimit: merged.dmHistoryLimit ?? 20,
    textChunkLimit: merged.textChunkLimit ?? 2000,
    mediaMaxMb: merged.mediaMaxMb ?? 10,
    heartbeat: merged.heartbeat ?? { showOk: false, showAlerts: true, useIndicator: true },
    webhookPath: merged.webhookPath ?? "/wecom/events",
    dms: merged.dms ?? {},
  };
}
