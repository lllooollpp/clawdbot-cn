import * as lark from '@larksuiteoapi/node-sdk';
import {
  PluginRuntime,
  resolveFeishuAccount,
  DEFAULT_ACCOUNT_ID,
  registerPluginHttpRoute,
  normalizePluginHttpPath,
  emitDiagnosticEvent,
} from "clawdbot/plugin-sdk";

let runtime: PluginRuntime | null = null;
const clients = new Map<string, lark.Client>();

export function setFeishuRuntime(next: PluginRuntime) {
  runtime = next;
  // Initialize clients for enabled accounts
  setupWebhooks();
}

export function getFeishuRuntime(): PluginRuntime {
  if (!runtime) {
    throw new Error("Feishu runtime not initialized");
  }
  return runtime;
}

export function getFeishuClient(accountId: string = DEFAULT_ACCOUNT_ID): lark.Client {
  let client = clients.get(accountId);
  if (!client) {
    const resolved = resolveFeishuAccount({
      cfg: getFeishuRuntime().config,
      accountId,
    });
    if (!resolved.appId || !resolved.appSecret) {
      throw new Error(`Feishu credentials missing for account ${accountId}`);
    }
    client = new lark.Client({
      appId: resolved.appId,
      appSecret: resolved.appSecret,
      disableTokenCache: false,
    });
    clients.set(accountId, client);
  }
  return client;
}

async function readRequestBody(req: any): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: any) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}

function setupWebhooks() {
  const rt = getFeishuRuntime();
  const accounts = rt.config.channels?.feishu?.accounts || { [DEFAULT_ACCOUNT_ID]: rt.config.channels?.feishu };

  for (const accountId of Object.keys(accounts)) {
    const account = resolveFeishuAccount({
      cfg: rt.config,
      accountId,
    });
    if (!account.enabled) continue;

    const webhookPath = normalizePluginHttpPath(`/feishu/webhook/${accountId}`);

    registerPluginHttpRoute({
      path: webhookPath,
      pluginId: "feishu",
      accountId,
      handler: async (req, res) => {
        try {
          // Handle GET requests (verification usually via POST, but some platforms use GET)
          if (req.method === "GET") {
            res.statusCode = 200;
            res.end("OK");
            return;
          }

          if (req.method !== "POST") {
            res.statusCode = 405;
            res.end("Method Not Allowed");
            return;
          }

          const rawBody = await readRequestBody(req);
          const body = JSON.parse(rawBody);

          // Handle URL Verification
          if (body.type === "url_verification") {
            if (account.verificationToken && body.token !== account.verificationToken) {
               res.statusCode = 403;
               res.end("Token mismatch");
               return;
            }
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ challenge: body.challenge }));
            return;
          }

          // Handle Events
          const header = body.header;
          const event = body.event;
          
          if (header && event) {
            const eventType = header.event_type;

            if (eventType === "im.message.receive_v1") {
              const { message, sender } = event;
              if (message && sender) {
                emitDiagnosticEvent({
                  type: "webhook.processed",
                  channel: "feishu",
                  accountId,
                  integration: "webhook",
                });

                let text = "";
                const content = JSON.parse(message.content);
                
                if (message.message_type === "text") {
                  text = content.text;
                } else if (message.message_type === "post") {
                  // Support simple post content as text
                  text = content.title ? `[${content.title}]\n` : "";
                  if (Array.isArray(content.content)) {
                    for (const row of content.content) {
                      for (const item of row) {
                        if (item.tag === "text") text += item.text;
                        if (item.tag === "a") text += `${item.text} (${item.href})`;
                        if (item.tag === "at") text += `@${item.user_name || "user"}`;
                      }
                      text += "\n";
                    }
                  }
                } else {
                  text = `[${message.message_type}]`;
                }

                // Dispatch to Clawdbot
                await rt.inbound.enqueue({
                  channelId: "feishu",
                  accountId,
                  messageId: message.message_id,
                  threadId: message.root_id || message.message_id,
                  chatId: message.chat_id,
                  senderId: sender.sender_id?.open_id || "unknown",
                  senderName: event.sender?.sender_id?.open_id, // Default to ID if name not found
                  text: text.trim(),
                  raw: body,
                });
              }
            }
          }

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ code: 0, msg: "success" }));
        } catch (err) {
          console.error(`Feishu webhook error for account ${accountId}:`, err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.end("Internal Error");
          }
        }
      },
    });
  }
}
