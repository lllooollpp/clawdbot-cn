import axios from "axios";
import * as crypto from "node:crypto";
import { XMLParser } from "fast-xml-parser";
import type { PluginRuntime, WeComConfig } from "clawdbot/plugin-sdk";
import { 
  resolveWeComAccount, 
  DEFAULT_ACCOUNT_ID,
  registerPluginHttpRoute,
  normalizePluginHttpPath,
  emitDiagnosticEvent,
} from "clawdbot/plugin-sdk";

let runtime: PluginRuntime;

export function setWeComRuntime(r: PluginRuntime) {
  runtime = r;
  setupWebhooks();
}

export function getWeComRuntime() {
  return runtime;
}

const parser = new XMLParser();

// --- Crypto Helpers ---

function getSignature(token: string, timestamp: string, nonce: string, msgEncrypt: string): string {
  const arr = [token, timestamp, nonce, msgEncrypt].sort();
  const sha1 = crypto.createHash("sha1");
  sha1.update(arr.join(""));
  return sha1.digest("hex");
}

function decrypt(encodingAesKey: string, encrypted: string): { msg: string; corpId: string } {
  const aesKey = Buffer.from(encodingAesKey + "=", "base64");
  const iv = aesKey.slice(0, 16);
  const decipher = crypto.createDecipheriv("aes-256-cbc", aesKey, iv);
  decipher.setAutoPadding(false);
  
  const buf = Buffer.concat([decipher.update(encrypted, "base64"), decipher.final()]);
  
  // PKCS7 unpadding
  const pad = buf[buf.length - 1];
  const content = buf.slice(0, buf.length - pad);
  
  const msgLen = content.readInt32BE(16);
  const msg = content.slice(20, 20 + msgLen).toString("utf-8");
  const corpId = content.slice(20 + msgLen).toString("utf-8");
  
  return { msg, corpId };
}

// --- Client ---

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

const tokenCaches = new Map<string, TokenCache>();

export class WeComClient {
  constructor(private accountId: string) {}

  private get config() {
    return resolveWeComAccount({
      cfg: runtime.config as any,
      accountId: this.accountId,
    });
  }

  async getAccessToken(): Promise<string> {
    const { corpId, secret } = this.config;
    if (!corpId || !secret) {
      throw new Error("WeCom account not configured with corpId and secret");
    }

    const cacheKey = `${corpId}:${secret}`;
    const cached = tokenCaches.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.accessToken;
    }

    const resp = await axios.get("https://qyapi.weixin.qq.com/cgi-bin/gettoken", {
      params: { corpid: corpId, corpsecret: secret },
    });

    if (resp.data.errcode !== 0) {
      throw new Error(`WeCom gettoken error: ${resp.data.errmsg} (code ${resp.data.errcode})`);
    }

    const accessToken = resp.data.access_token;
    const expiresAt = Date.now() + (resp.data.expires_in - 300) * 1000; // 5 min buffer
    tokenCaches.set(cacheKey, { accessToken, expiresAt });

    return accessToken;
  }

  async sendMessage(data: any) {
    const token = await this.getAccessToken();
    const resp = await axios.post(
      `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${token}`,
      data
    );
    if (resp.data.errcode !== 0) {
      throw new Error(`WeCom sendMessage error: ${resp.data.errmsg} (code ${resp.data.errcode})`);
    }
    return resp.data;
  }
}

const clients = new Map<string, WeComClient>();

export function getWeComClient(accountId: string = DEFAULT_ACCOUNT_ID) {
  let client = clients.get(accountId);
  if (!client) {
    client = new WeComClient(accountId);
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
  const rt = getWeComRuntime();
  const accountsMap = (rt.config.channels as any)?.wecom?.accounts || { [DEFAULT_ACCOUNT_ID]: (rt.config.channels as any)?.wecom };

  for (const accountId of Object.keys(accountsMap)) {
    const account = resolveWeComAccount({
      cfg: rt.config as any,
      accountId,
    });
    if (!account.enabled) continue;

    const webhookPath = normalizePluginHttpPath(`/wecom/webhook/${accountId}`);

    registerPluginHttpRoute({
      path: webhookPath,
      pluginId: "wecom",
      accountId,
      handler: async (req, res) => {
        try {
          const url = new URL(req.url!, `http://${req.headers.host}`);
          const msgSignature = url.searchParams.get("msg_signature");
          const timestamp = url.searchParams.get("timestamp");
          const nonce = url.searchParams.get("nonce");
          const echostr = url.searchParams.get("echostr");

          if (!msgSignature || !timestamp || !nonce) {
            res.statusCode = 400;
            res.end("Missing parameters");
            return;
          }

          if (req.method === "GET" && echostr) {
            // URL Verification
            const sig = getSignature(account.token || "", timestamp, nonce, echostr);
            if (sig !== msgSignature) {
              res.statusCode = 403;
              res.end("Signature mismatch");
              return;
            }
            const { msg } = decrypt(account.encodingAesKey || "", echostr);
            res.statusCode = 200;
            res.end(msg);
            return;
          }

          if (req.method === "POST") {
            const rawBody = await readRequestBody(req);
            const xml = parser.parse(rawBody);
            const encrypt = xml.xml?.Encrypt || xml.Encrypt;

            if (!encrypt) {
              res.statusCode = 400;
              res.end("Missing Encrypt in XML");
              return;
            }

            const sig = getSignature(account.token || "", timestamp, nonce, encrypt);
            if (sig !== msgSignature) {
               res.statusCode = 403;
               res.end("Signature mismatch");
               return;
            }

            const { msg } = decrypt(account.encodingAesKey || "", encrypt);
            const msgXml = parser.parse(msg);
            const data = msgXml.xml || msgXml;

            if (data.MsgType === "text") {
              emitDiagnosticEvent({
                type: "webhook.processed",
                channel: "wecom",
                accountId,
                integration: "webhook",
              });

              await rt.inbound.enqueue({
                channelId: "wecom",
                accountId,
                messageId: data.MsgId,
                threadId: undefined, // WeCom doesn't have native thread support in push
                chatId: data.FromUserName, // This is the UserID
                senderId: data.FromUserName,
                senderName: data.FromUserName,
                text: data.Content,
                raw: data,
              });
            }

            res.statusCode = 200;
            res.end("success");
            return;
          }

          res.statusCode = 405;
          res.end("Method Not Allowed");
        } catch (err) {
          console.error(`WeCom webhook error for account ${accountId}:`, err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.end("Internal Error");
          }
        }
      },
    });
  }
}
