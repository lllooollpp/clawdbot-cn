# Clawdbot 国内可用技能与平替列表 (Skills & Alternatives for China)

此列表列出了 Clawdbot 现有技能中在国内可能受限的项目及其对应的开源或本土平替方案。**1.0.0-cn 版本已原生集成 DeepSeek, SiliconFlow, Bocha 等国内平替，支持初次运行的一键式自动化配置。**

## 1. 大语言模型 (LLM) 与 本地模型
原有技能如 `anthropic`, `openai` 等高度依赖国外 API。

| 现有技能 | 受限点 | 国内原生支持 (Built-in) | 说明 |
| :--- | :--- | :--- | :--- |
| `openai`, `gemini` | API 无法访问，账户易封 | **DeepSeek (深度求索)** | **原生支持**。V3/R1 性能强悍，成本极低，默认集成在向导中。 |
| `claude` | 需要国外信用卡 | **火山引擎 (Ark)** | **原生支持**。目前国内最稳的豆包 (Doubao) 模型供应商。 |
| `synthetic-api` | 需要国外模型 | **SiliconFlow (硅基流动)** | **原生支持**。国内模型聚合平台，一站式解决多模型需求。 |
| `anthropic` | API 访问受限 | **Ollama (本地模型)** | **原生支持**。支持本地运行 Qwen 2.5, Llama 3 等，无需联网，保护隐私。 |

## 2. 多模态：语音与图像 (Multimodal)
`openai-whisper` 和 `openai-tts` 现已支持本土厂商替代。

| 现有技能 | 受限点 | 国内原生支持 (Built-in) | 说明 |
| :--- | :--- | :--- | :--- |
| `openai-whisper` | API 延迟高，有隐私风险 | **SiliconFlow (STT)** | **原生支持**。作为 Whisper 的云端平替，毫秒级响应，无需翻墙。 |
| `openai-tts` | 需要国外 API 密钥 | **Edge-TTS (微软)** | **原生支持**。免费使用，默认启用 `晓晓` 语音，效果极其自然。 |
| `image-gen` | DALL-E 接口受限 | **智谱 CogView / SD** | 智谱提供优秀的中文绘图 API。 |

## 3. 信息检索与数据 (Retrieval & Data)
`brave-search`, `perplexity` 等。

| 现有技能 | 受限点 | 国内原生支持 (Built-in) | 说明 |
| :--- | :--- | :--- | :--- |
| `brave-search` | 响应被墙 / 结果偏西 | **Bocha (博查)** | **原生支持**。首款国内联网搜索平替，中文搜得深、搜得准。 |
| `weather` | wttr.in 稳定性 | **和风天气 (QWeather)** | 国内厂商提供更精确的公里级预报。 |
| `summarize.sh` | 提取 YouTube 等内容受限 | **Bilibili-Summary** 类工具 | 针对国内视频平台，B 站已自带部分总结功能。 |

## 4. 社交与办公协作 (Social & Workspace)
`slack`, `discord`, `msteams`, `notion`, `trello`.

| 现有技能 | 受限点 | 国内平替 / 建议 | 说明 |
| :--- | :--- | :--- | :--- |
| `slack`, `discord` | 无法直接连接 | **飞书 (Lark) 自建机器人**, **钉钉** | 飞书的 API 非常开放，支持复杂的交互卡片，是国内开发者的首选。 |
| `notion`, `trello` | 无魔改代理时访问极其缓慢 | **Obsidian (本地)**, **Wolai (我来)**, **FlowUs** | Obsidian 配合本项目 `obsidian` 技能，通过 Git 同步即可实现完美离线体验。 |
| `1password` | 订阅制且由于服务器在国外 | **Bitwarden (自建)** | 完美的开源平替，数据掌握在自己手中。 |

## 5. 开发者工具 (DevOps & Others)
- **版本控制 (`github`)**: 建议配合 `gh` 配置访问代理，或者通过 **Gitee (码云)** 的 API 插件进行本土镜像管理。
- **邮件服务 (`himalaya`)**: 对于国内邮箱（QQ/网易），需注意开启 IMAP/SMTP 授权码而非普通密码。
- **终端管理 (`tmux`)**: 完美支持，国内开发者装机必备。

---

**配置建议：**
在 `clawdbot config` 中，建议首选 `models.providers.*` 中的 `baseUrl` 切换为国内代理或本土厂商（如 `https://api.deepseek.com/v1`），这能直接提升 80% 技能的响应速度。
