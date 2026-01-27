import type { z } from "zod";
import type { GroupPolicy, DmPolicy, MarkdownConfig } from "./types.base.js";
import type { DmConfig } from "./types.messages.js";
import type { ToolPolicyConfig } from "./types.tools.js";
import type { ChannelHeartbeatVisibilitySchema } from "./zod-schema.channels.js";

type ChannelHeartbeatVisibility = z.infer<typeof ChannelHeartbeatVisibilitySchema>;

export interface FeishuGroupConfig {
  requireMention?: boolean;
  tools: ToolPolicyConfig;
  skills?: string[];
  enabled?: boolean;
  systemPrompt?: string;
}

export interface FeishuAccountConfig {
  name?: string;
  enabled?: boolean;
  appId?: string;
  appSecret?: string;
  encryptKey?: string;
  verificationToken?: string;
  markdown: MarkdownConfig;
  dmPolicy: DmPolicy;
  allowFrom?: string[];
  groupPolicy: GroupPolicy;
  groups?: Record<string, FeishuGroupConfig>;
  historyLimit?: number;
  dmHistoryLimit?: number;
  textChunkLimit?: number;
  mediaMaxMb?: number;
  heartbeat: ChannelHeartbeatVisibility;
  webhookPath?: string;
  dms?: Record<string, DmConfig>;
}

export interface FeishuConfig extends FeishuAccountConfig {
  accounts?: Record<string, FeishuAccountConfig>;
}
