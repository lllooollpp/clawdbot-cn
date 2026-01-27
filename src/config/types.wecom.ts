import type { z } from "zod";
import type { GroupPolicy, DmPolicy, MarkdownConfig } from "./types.base.js";
import type { DmConfig } from "./types.messages.js";
import type { ToolPolicyConfig } from "./types.tools.js";
import type { ChannelHeartbeatVisibilitySchema } from "./zod-schema.channels.js";

type ChannelHeartbeatVisibility = z.infer<typeof ChannelHeartbeatVisibilitySchema>;

export interface WeComGroupConfig {
  requireMention?: boolean;
  tools: ToolPolicyConfig;
  skills?: string[];
  enabled?: boolean;
  systemPrompt?: string;
}

export interface WeComAccountConfig {
  name?: string;
  enabled?: boolean;
  corpId?: string;
  agentId?: string;
  secret?: string;
  /** 用于接收回调消息的 Token */
  token?: string;
  /** 用于消息加解密的 EncodingAESKey */
  encodingAesKey?: string;
  markdown: MarkdownConfig;
  dmPolicy: DmPolicy;
  allowFrom?: string[];
  groupPolicy: GroupPolicy;
  groups?: Record<string, WeComGroupConfig>;
  historyLimit?: number;
  dmHistoryLimit?: number;
  textChunkLimit?: number;
  mediaMaxMb?: number;
  heartbeat: ChannelHeartbeatVisibility;
  webhookPath?: string;
  dms?: Record<string, DmConfig>;
}

export interface WeComConfig extends WeComAccountConfig {
  accounts?: Record<string, WeComAccountConfig>;
}
