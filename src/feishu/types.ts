import type { FeishuAccountConfig as CoreFeishuAccountConfig } from "../config/types.js";

export type FeishuAccountConfig = CoreFeishuAccountConfig;

export interface ResolvedFeishuAccount {
  accountId: string;
  name?: string;
  enabled: boolean;
  appId?: string;
  appSecret?: string;
  encryptKey?: string;
  verificationToken?: string;
  config: FeishuAccountConfig;
  appIdSource?: string;
}

export interface FeishuMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: number;
}
