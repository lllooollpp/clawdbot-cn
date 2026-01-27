---
summary: "Frequently asked questions about Clawdbot setup, configuration, and usage"
---

# 常见问题

快速解答以及针对实际部署（本地开发、VPS、多代理、OAuth/API 密钥、模型故障转移）的深入排查。关于运行时诊断，请参阅 [故障排除](/gateway/troubleshooting)。关于完整的配置参考，请参阅 [配置](/gateway/configuration)。

## 目录

- [快速入门和首次运行设置](#快速入门和首次运行设置)
  - [我卡住了，最快怎么解决？](#我卡住了最快怎么解决)
  - [推荐如何安装和设置Clawdbot？](#推荐如何安装和设置clawdbot)
  - [如何在完成初始设置后打开仪表板？](#如何在完成初始设置后打开仪表板)
  - [如何在本地和远程上对仪表板进行身份验证（令牌）？](#如何在本地和远程上对仪表板进行身份验证令牌)
  - [我需要什么运行时？](#我需要什么运行时)
  - [它能在Raspberry Pi上运行吗？](#它能在raspberry-pi上运行吗)
  - [Raspberry Pi安装有什么技巧吗？](#raspberry-pi安装有什么技巧吗)
  - [它卡在“唤醒我的朋友”/初始设置无法启动。现在怎么办？](#它卡在唤醒我的朋友初始设置无法启动现在怎么办)
  - [我可以将设置迁移到新机器（Mac mini）上而不重新进行初始设置吗？](#我可以将设置迁移到新机器mac-mini上而不重新进行初始设置吗)
  - [在哪里查看最新版本的新功能？](#在哪里查看最新版本的新功能)
  - [我无法访问docs.clawd.bot（SSL错误）。现在怎么办？](#我无法访问docsclawdbot-ssl错误现在怎么办)
  - [稳定版和测试版有什么区别？](#稳定版和测试版有什么区别)
- [如何安装测试版，测试版和开发版有什么区别？](#如何安装测试版和测试版和开发版有什么区别)
  - [如何尝试最新的版本？](#如何尝试最新的版本)
  - [安装和初始设置通常需要多长时间？](#安装和初始设置通常需要多长时间)
  - [安装程序卡住了？如何获取更多反馈？](#安装程序卡住了如何获取更多反馈)
  - [Windows安装提示找不到git或clawdbot未被识别](#windows安装提示找不到git或clawdbot未被识别)
  - [文档没有回答我的问题 - 如何获得更好的答案？](#文档没有回答我的问题如何获得更好的答案)
  - [如何在Linux上安装Clawdbot？](#如何在linux上安装clawdbot)
  - [如何在VPS上安装Clawdbot？](#如何在vps上安装clawdbot)
  - [在哪里可以找到云/VPS安装指南？](#在哪里可以找到云vps安装指南)
  - [我可以要求Clawd自动更新吗？](#我可以要求clawd自动更新吗)
  - [初始设置向导到底做了什么？](#初始设置向导到底做了什么)
  - [运行它是否需要Claude或OpenAI的订阅？](#运行它是否需要claude或openai的订阅)
  - [我可以不使用API密钥就使用Claude Max订阅吗？](#我可以不使用api密钥就使用claude-max订阅吗)
  - [Anthropic的“setup-token”认证是如何工作的？](#anthropic的setup-token认证是如何工作的)
  - [我在哪里可以找到Anthropic的setup-token？](#我在哪里可以找到anthropic的setup-token)
  - [你们支持Claude订阅认证（Claude Code OAuth）吗？](#你们支持claude订阅认证claude-code-oauth吗)
  - [为什么我会看到来自Anthropic的`HTTP 429: rate_limit_error`？](#为什么我会看到来自anthropic的http-429-rate_limit_error)
  - [支持AWS Bedrock吗？](#支持aws-bedrock吗)
  - [Codex认证是如何工作的？](#codex认证是如何工作的)
  - [你们支持OpenAI订阅认证（Codex OAuth）吗？](#你们支持openai订阅认证codex-oauth吗)
  - [如何设置Gemini CLI OAuth？](#如何设置gemini-cli-oauth)
  - [本地模型是否适合日常聊天？](#本地模型是否适合日常聊天)
  - [如何确保托管模型的流量在特定地区？](#如何确保托管模型的流量在特定地区)
  - [我必须购买Mac Mini才能安装这个吗？](#我必须购买mac-mini才能安装这个吗)
  - [我需要Mac mini来支持iMessage吗？](#我需要mac-mini来支持imessage吗)
  - [如果我购买了Mac mini来运行Clawdbot，我可以连接到我的MacBook Pro吗？](#如果我购买了mac-mini来运行clawdbot我可以连接到我的macbook-pro吗)
  - [我可以使用Bun吗？](#我可以使用bun吗)
  - [Telegram：`allowFrom`应该填什么？](#telegram-allowfrom应该填什么)
  - [多个用户可以使用同一个WhatsApp号码和不同的Clawdbots吗？](#多个用户可以使用同一个whatsapp号码和不同的clawdbots吗)
  - [我可以运行“快速聊天”代理和“Opus for coding”代理吗？](#我可以运行快速聊天代理和opus-for-coding代理吗)
  - [Homebrew在Linux上能用吗？](#homebrew在linux上能用吗)
  - [可编辑（git）安装和npm安装有什么区别？](#可编辑git安装和npm安装有什么区别)
  - [以后可以切换npm和git安装吗？](#以后可以切换npm和git安装吗)
  - [我应该在笔记本电脑还是VPS上运行网关？](#我应该在笔记本电脑还是vps上运行网关)
  - [在专用机器上运行Clawdbot有多重要？](#在专用机器上运行clawdbot有多重要)
  - [VPS的最低要求和推荐的系统是什么？](#vps的最低要求和推荐的系统是什么)
  - [我可以在一个虚拟机中运行Clawdbot，有什么要求吗？](#我可以在一个虚拟机中运行clawdbot有什么要求吗)
- [什么是Clawdbot？](#什么是clawdbot)
  - [用一段话解释什么是Clawdbot？](#用一段话解释什么是clawdbot)
  - [它的价值主张是什么？](#它的价值主张是什么)
  - [我刚刚设置好了，接下来该做什么？](#我刚刚设置好了接下来该做什么)
  - [Clawdbot的五个日常使用场景是什么？](#clawdbot的五个日常使用场景是什么)
  - [Clawdbot能帮助我为SaaS做潜在客户推广广告和博客吗？](#clawdbot能帮助我为saas做潜在客户推广广告和博客吗)
  - [与Claude Code相比，Clawdbot在Web开发中的优势是什么？](#与claude-code相比clawdbot在web开发中的优势是什么)
- [技能和自动化](#技能和自动化)
  - [如何自定义技能而不污染仓库？](#如何自定义技能而不污染仓库)
  - [我可以从自定义文件夹加载技能吗？](#我可以从自定义文件夹加载技能吗)
  - [如何为不同任务使用不同模型？](#如何为不同任务使用不同模型)
  - [机器人在执行重任务时会冻结。如何卸载任务？](#机器人在执行重任务时会冻结如何卸载任务)
  - [定时任务或提醒未触发。应该检查什么？](#定时任务或提醒未触发应该检查什么)
  - [如何在Linux上安装技能？](#如何在linux上安装技能)
  - [Clawdbot可以按计划运行任务或在后台持续运行吗？](#clawdbot可以按计划运行任务或在后台持续运行吗)
  - [我可以在Linux上运行Apple/macOS专用的技能吗？](#我可以在linux上运行applemacos专用的技能吗)
  - [你们有Notion或HeyGen的集成吗？](#你们有notion或heygen的集成吗)
  - [如何安装Chrome扩展程序以实现浏览器接管？](#如何安装chrome扩展程序以实现浏览器接管)
- [沙箱和内存](#沙箱和内存)
  - [有专门的沙箱文档吗？](#有专门的沙箱文档吗)
  - [如何将主机文件夹绑定到沙箱？](#如何将主机文件夹绑定到沙箱)
  - [内存是如何工作的？](#内存是如何工作的)
  - [内存总是忘记东西。如何让它记住？](#内存总是忘记东西如何让它记住)
  - [内存能永久保存吗？有什么限制？](#内存能永久保存吗有什么限制)
  - [语义内存搜索需要OpenAI API密钥吗？](#语义内存搜索需要openai-api密钥吗)
- [数据在磁盘上的存储位置](#数据在磁盘上的存储位置)
  - [Clawdbot使用的所有数据都保存在本地吗？](#clawdbot使用的所有数据都保存在本地吗)
  - [Clawdbot存储数据的位置在哪里？](#clawdbot存储数据的位置在哪里)
  - [`AGENTS.md` / `SOUL.md` / `USER.md` / `MEMORY.md`应该放在哪里？](#agentsmd-soulmd-usermd-memorymd应该放在哪里)
  - [推荐的备份策略是什么？](#推荐的备份策略是什么)
  - [如何彻底卸载Clawdbot？](#如何彻底卸载clawdbot)
  - [代理可以在工作区之外运行吗？](#代理可以在工作区之外运行吗)
  - [我处于远程模式 - 会话存储在哪里？](#我处于远程模式-会话存储在哪里)
- [配置基础](#配置基础)
  - [配置文件的格式是什么？在哪里？](#配置文件的格式是什么在哪里)
  - [我设置了`gateway.bind: "lan"`（或`"tailnet"`）但现在没有任何监听/UI提示未授权](#我设置了gatewaybind-lan或tailnet但现在没有任何监听ui提示未授权)
  - [为什么现在需要本地主机的令牌？](#为什么现在需要本地主机的令牌)
  - [更改配置后是否需要重启？](#更改配置后是否需要重启)
  - [如何启用网络搜索（和网络获取）？](#如何启用网络搜索和网络获取)
  - [`config.apply`清除了我的配置。如何恢复并避免这种情况？](#configapply清除了我的配置如何恢复并避免这种情况)
  - [如何在多个设备上运行一个中心网关和专门的工作者？](#如何在多个设备上运行一个中心网关和专门的工作者)
  - [Clawdbot浏览器可以无头运行吗？](#clawdbot浏览器可以无头运行吗)
  - [如何使用Brave进行浏览器控制？](#如何使用brave进行浏览器控制)
- [远程网关 + 节点](#远程网关节点)
  - [命令如何在Telegram、网关和节点之间传播？](#命令如何在telegram网关和节点之间传播)
  - [如果网关托管在远程，我的代理如何访问我的电脑？](#如果网关托管在远程我的代理如何访问我的电脑)
  - [Tailscale已连接，但没有回复。现在怎么办？](#tailscale已连接但没有回复现在怎么办)
  - [两个Clawdbots可以互相通信（本地 + VPS）吗？](#两个clawdbots可以互相通信本地-vps吗)
  - [是否需要为多个代理单独购买VPS？](#是否需要为多个代理单独购买vps)
  - [在个人笔记本上使用节点，而不是从VPS通过SSH连接，有什么好处吗？](#在个人笔记本上使用节点而不是从vps通过ssh连接有什么好处吗)
  - [节点会运行网关服务吗？](#节点会运行网关服务吗)
  - [有没有通过API / RPC应用配置的方法？](#有没有通过api-rpc应用配置的方法)
  - [首次安装的最小“合理”配置是什么？](#首次安装的最小合理配置是什么)
  - [如何在VPS上设置Tailscale并从我的Mac连接？](#如何在vps上设置tailscale并从我的mac连接)
  - [如何将Mac节点连接到远程网关（Tailscale Serve）？](#如何将mac节点连接到远程网关tailscale-serve)
  - [我应该在第二台笔记本上安装还是只添加一个节点？](#我应该在第二台笔记本上安装还是只添加一个节点)
- [环境变量和.env加载](#环境变量和env加载)
  - [Clawdbot如何加载环境变量？](#clawdbot如何加载环境变量)
  - ["我通过服务启动了网关，但环境变量消失了。现在怎么办？"](#我通过服务启动了网关但环境变量消失了现在怎么办)
  - [我设置了`COPILOT_GITHUB_TOKEN`，但模型状态显示“Shell env: off.”。为什么？](#我设置了copilotgithubtoken但模型状态显示shell-env-off-为什么)
- [会话和多聊天](#会话和多聊天)
  - [如何开始一次新的对话？](#如何开始一次新的对话)
  - [如果我从未发送`/new`，会话会自动重置吗？](#如果我从未发送new会话会自动重置吗)
  - [有没有办法让一组Clawdbots有一个CEO和多个代理？](#有没有办法让一组clawdbots有一个ceo和多个代理)
  - [为什么上下文在任务中间被截断？如何防止？](#为什么上下文在任务中间被截断如何防止)
  - [如何彻底重置Clawdbot但保留安装？](#如何彻底重置clawdbot但保留安装)
  - [我收到“上下文太大”的错误 - 如何重置或压缩？](#我收到上下文太大的错误如何重置或压缩)
  - [为什么我看到“LLM请求被拒绝：messages.N.content.X.tool_use.input: 字段必填”？](#为什么我看到llm请求被拒绝messagesncontentxtooluseinput-字段必填)
  - [为什么我每30分钟收到心跳消息？](#为什么我每30分钟收到心跳消息)
  - [我需要在WhatsApp群组中添加一个机器人账户吗？](#我需要在whatsapp群组中添加一个机器人账户吗)
  - [如何获取WhatsApp群组的JID？](#如何获取whatsapp群组的jid)
  - [为什么Clawdbot在群组中不回复？](#为什么clawdbot在群组中不回复)
  - [群组/线程与私信共享上下文吗？](#群组线程与私信共享上下文吗)
  - [我可以创建多少个工作区和代理？](#我可以创建多少个工作区和代理)
  - [我可以同时运行多个机器人或聊天（Slack），该如何设置？](#我可以同时运行多个机器人或聊天slack该如何设置)
- [模型：默认、选择、别名、切换](#模型默认选择别名切换)
  - [什么是“默认模型”？](#什么是默认模型)
  - [你推荐使用什么模型？](#你推荐使用什么模型)
  - [如何切换模型而不清除配置？](#如何切换模型而不清除配置)
  - [我可以使用自托管模型（llama.cpp, vLLM, Ollama）吗？](#我可以使用自托管模型llamacpp-vllm-ollama吗)
  - [Clawd、Flawd和Krill使用什么模型？](#clawd-flawd和krill使用什么模型)
  - [如何在不重启的情况下切换模型？](#如何在不重启的情况下切换模型)
  - [我可以使用GPT 5.2进行日常任务和Codex 5.2进行编码吗？](#我可以使用gpt-52进行日常任务和codex-52进行编码吗)
  - [为什么我看到“模型…不允许”然后没有回复？](#为什么我看到模型不允许然后没有回复)
  - [为什么我看到“未知模型：minimax/MiniMax-M2.1”？](#为什么我看到未知模型minimaxminimaxm21)
  - [我可以将MiniMax设为默认模型，同时用OpenAI处理复杂任务吗？](#我可以将minimax设为默认模型同时用openai处理复杂任务吗)
  - [opus / sonnet / gpt是内置的快捷方式吗？](#opus-sonnet-gpt是内置的快捷方式吗)
  - [如何定义/覆盖模型快捷方式（别名）？](#如何定义覆盖模型快捷方式别名)
  - [如何添加其他提供商的模型，比如OpenRouter或Z.AI？](#如何添加其他提供商的模型比如openrouter或zai)
- [模型故障转移和“所有模型失败”](#模型故障转移和所有模型失败)
  - [故障转移是如何工作的？](#故障转移是如何工作的)
  - [这个错误是什么意思？](#这个错误是什么意思)
  - [`No credentials found for profile "anthropic:default"`的修复清单](#no-credentials-found-for-profile-anthropicdefault的修复清单)
  - [为什么它也尝试了Google Gemini并失败？](#为什么它也尝试了google-gemini并失败)
- [认证配置文件：它们是什么以及如何管理？](#认证配置文件它们是什么以及如何管理)
  - [什么是认证配置文件？](#什么是认证配置文件)
  - [典型的配置文件ID是什么？](#典型的配置文件id是什么)
  - [我可以控制尝试哪个认证配置文件优先吗？](#我可以控制尝试哪个认证配置文件优先吗)
  - [OAuth和API密钥有什么区别？](#oauth和api密钥有什么区别)
- [网关：端口、“正在运行”和远程模式](#网关端口正在运行和远程模式)
  - [网关使用什么端口？](#网关使用什么端口)
  - [为什么`clawdbot gateway status`显示`Runtime: running`但`RPC probe: failed`？](#为什么clawdbot-gateway-status显示runtime-running但rpc-probe-failed)
  - [为什么`clawdbot gateway status`显示`Config (cli)`和`Config (service)`不同？](#为什么clawdbot-gateway-status显示config-cli和config-service不同)
  - ["另一个网关实例已经在监听"是什么意思？](#另一个网关实例已经在监听是什么意思)
  - [如何在远程模式下运行Clawdbot（客户端连接到其他网关）？](#如何在远程模式下运行clawdbot客户端连接到其他网关)
  - [控制UI显示“未授权”（或不断重新连接）。现在怎么办？](#控制ui显示未授权或不断重新连接现在怎么办)
  - [我设置了`gateway.bind: "tailnet"`但无法绑定/没有监听](#我设置了gatewaybind-tailnet但无法绑定没有监听)
  - [能否在同一台主机上运行多个网关？](#能否在同一台主机上运行多个网关)
  - ["无效的握手"/代码1008是什么意思？](#无效的握手代码1008是什么意思)
- [日志和调试](#日志和调试)
  - [日志在哪里？](#日志在哪里)
  - [如何启动/停止/重启网关服务？](#如何启动停止重启网关服务)
  - [我在Windows上关闭了终端 - 如何重新启动Clawdbot？](#我在windows上关闭了终端如何重新启动clawdbot)
  - [网关已启动但回复从未到达。应该检查什么？](#网关已启动但回复从未到达应该检查什么)
  - ["断开与网关的连接：无原因" - 现在怎么办？](#断开与网关的连接无原因现在怎么办)
  - [Telegram的setMyCommands出现网络错误。应该检查什么？](#telegram的setmycommands出现网络错误应该检查什么)
  - [TUI没有输出。应该检查什么？](#tui没有输出应该检查什么)
  - [如何彻底停止然后启动网关？](#如何彻底停止然后启动网关)
  - [通俗解释：`clawdbot gateway restart`和`clawdbot gateway`有什么区别？](#通俗解释clawdbot-gateway-restart和clawdbot-gateway有什么区别)
  - [当某事失败时，最快获取更多细节的方法是什么？](#当某事失败时最快获取更多细节的方法是什么)
- [媒体和附件](#媒体和附件)
  - [我的技能生成了图片/PDF，但没有发送](#我的技能生成了图片pdf但没有发送)
- [安全和访问控制](#安全和访问控制)
  - [将Clawdbot暴露给入站私信安全吗？](#将clawdbot暴露给入站私信安全吗)
  - [提示注入只对公开的机器人有影响吗？](#提示注入只对公开的机器人有影响吗)
  - [我的机器人是否需要有自己的电子邮件/GitHub账户或手机号？](#我的机器人是否需要有自己的电子邮件github账户或手机号)
  - [我可以赋予它对我的短信的自主权，这样安全吗？](#我可以赋予它对我的短信的自主权这样安全吗)
  - [我可以使用更便宜的模型作为个人助理任务吗？](#我可以使用更便宜的模型作为个人助理任务吗)
  - [我在Telegram上运行了`/start`但没有收到配对码](#我在telegram上运行了start但没有收到配对码)
  - [WhatsApp：它会向我的联系人发送消息吗？配对是如何工作的？](#whatsapp它会向我的联系人发送消息吗配对是如何工作的)
- [聊天命令、取消任务和“它不停止”](#聊天命令取消任务和它不停止)
  - [如何停止聊天中的内部系统消息？](#如何停止聊天中的内部系统消息)
  - [如何停止/取消正在运行的任务？](#如何停止取消正在运行的任务)
  - [如何从Telegram发送Discord消息？（“跨上下文消息被拒绝”）](#如何从telegram发送discord消息跨上下文消息被拒绝)
  - [为什么感觉机器人“忽略”了快速消息？](#为什么感觉机器人忽略了快速消息)

## 前60秒，如果出现问题

1) **快速状态检查（第一次检查）**
bash
clawdbot status
```   ```
快速本地摘要：操作系统 + 更新，网关/服务可达性，代理/会话，提供者配置 + 运行时问题（当网关可达时）。

2) **可复制报告（可安全共享）**   ```bash
   clawdbot status --all
   ```
"只读诊断（日志尾部，标记了部分令牌）。

3) **守护进程 + 端口状态**
bash
   clawdbot gateway status
```   ```
显示了 supervisor 运行时与 RPC 可达性的关系、探测目标 URL 以及服务可能使用的配置。
4) **深度探测**   ```bash
   clawdbot status --deep
   ```
执行网关健康检查 + 供应商探测（需要可访问的网关）。参见 [健康状态](/gateway/health)。

5) **查看最新日志**
bash
   clawdbot logs --follow
```   ```
如果 RPC 不可用，则回退到：   ```bash
   tail -f "$(ls -t /tmp/clawdbot/clawdbot-*.log | head -1)"
   ```
"文件日志与服务日志是分开的；请参阅 [日志](/logging) 和 [故障排除](/gateway/troubleshooting)。

6) **运行医生检查（修复）**   
clawdbot doctor   ```
修复/迁移配置/状态并运行健康检查。参见 [Doctor](/gateway/doctor)。

7) **网关快照**   ```bash
   clawdbot health --json
   clawdbot health --verbose   # shows the target URL + config path on errors
   ```
向运行中的网关请求完整快照（仅限WS）。参见 [健康状态](/gateway/health)。

## 快速入门和首次运行设置

### 我卡住了，最快的方法是什么？

使用一个可以**查看你的机器**的本地AI代理。这比在Discord上提问要有效得多，因为大多数“我卡住了”的情况都是**本地配置或环境问题**，远程帮助者无法检查。

- **Claude Code**: https://www.anthropic.com/claude-code/
- **OpenAI Codex**: https://openai.com/codex/

这些工具可以读取仓库、运行命令、检查日志，并帮助修复你的机器级设置（PATH、服务、权限、认证文件）。通过可被修改的（git）安装方式，向它们提供**完整的源代码检查**。
bash
curl -fsSL https://clawd.bot/install.sh | bash -s -- --install-method git
``````
这将从 **git 检出** 安装 Clawdbot，因此代理可以读取代码 + 文档，并了解你正在运行的确切版本。你可以随时通过不带 `--install-method git` 参数重新运行安装程序来切换回稳定版本。

提示：让代理 **计划并监督** 修复过程（分步骤），然后仅执行必要的命令。这样可以保持更改较小，更易于审计。

如果你发现了一个真正的 bug 或修复，请提交 GitHub 问题或发送 PR：
https://github.com/clawdbot/clawdbot/issues
https://github.com/clawdbot/clawdbot/pulls

从以下命令开始（寻求帮助时请分享输出）：```bash
clawdbot status
clawdbot models status
clawdbot doctor
```
他们能做什么：
- `clawdbot status`：快速查看网关/代理的健康状态 + 基本配置。
- `clawdbot models status`：检查提供者认证 + 模型可用性。
- `clawdbot doctor`：验证并修复常见的配置/状态问题。

其他有用的 CLI 检查命令：`clawdbot status --all`，`clawdbot logs --follow`，  
`clawdbot gateway status`，`clawdbot health --verbose`。

快速调试循环：[如果出现问题的前60秒](#first-60-seconds-if-somethings-broken)。  
安装文档：[安装](/install)，[安装程序标志](/install/installer)，[更新](/install/updating)。

### 推荐的安装和设置 Clawdbot 的方式

该仓库推荐从源码运行并使用引导向导进行设置：
bash
curl -fsSL https://clawd.bot/install.sh | bash
clawdbot onboard --install-daemon
``````
魔法师还可以自动生成UI资源。完成入门设置后，通常会在端口 **18789** 上运行网关。```bash
git clone https://github.com/clawdbot/clawdbot.git
cd clawdbot
pnpm install
pnpm build
pnpm ui:build # auto-installs UI deps on first run
clawdbot onboard
```
如果尚未全局安装，可以通过 `pnpm clawdbot onboard` 运行。

### 上线后如何打开仪表板

向导在完成上线后会直接在你的浏览器中打开一个带令牌的仪表板 URL，并在摘要中打印完整的链接（含令牌）。请保持该标签页打开；如果它没有自动打开，请将打印出的 URL 粘贴到同一台机器上。令牌仅在你的主机本地有效，不会从浏览器获取。

### 如何在本地主机和远程主机上认证仪表板令牌

**本地主机（同一台机器）：**
- 打开 `http://127.0.0.1:18789/`。
- 如果提示需要认证，运行 `clawdbot dashboard` 并使用带令牌的链接（`?token=...`）。
- 令牌与 `gateway.auth.token`（或 `CLAWDBOT_GATEWAY_TOKEN`）相同，并在首次加载后由 UI 存储。

**不在本地主机上：**
- **Tailscale Serve**（推荐）：保留绑定 loopback，运行 `clawdbot gateway --tailscale serve`，打开 `https://<magicdns>/`。如果 `gateway.auth.allowTailscale` 设置为 `true`，身份头即可满足认证（无需令牌）。
- **Tailnet 绑定**：运行 `clawdbot gateway --bind tailnet --token "<token>"`，打开 `http://<tailscale-ip>:18789/`，然后在仪表板设置中粘贴令牌。
- **SSH 隧道**：运行 `ssh -N -L 18789:127.0.0.1:18789 user@host`，然后从 `clawdbot dashboard` 打开 `http://127.0.0.1:18789/?token=...`。

有关绑定模式和认证的详细信息，请参阅 [仪表板](/web/dashboard) 和 [Web 表面](/web)。

### 我需要什么运行时环境

需要 **Node >= 22**。推荐使用 `pnpm`。不推荐使用 **Bun** 作为网关的运行时。

### 它能在树莓派上运行吗

是的。网关轻量级——文档中列出的 **512MB-1GB 内存**、**1 核 CPU** 和约 **500MB 磁盘空间** 对于个人使用来说已经足够，并且指出 **树莓派 4 可以运行它**。

如果你想为日志、媒体或其他服务留出更多空间，推荐使用 **2GB 内存**，但这不是硬性最低要求。

提示：一个小的树莓派/VPS 可以托管网关，你可以在笔记本电脑/手机上运行 **节点**，用于本地屏幕/摄像头/画布或命令执行。参见 [节点](/nodes)。

### 树莓派安装有什么提示吗

简而言之：可以工作，但可能会遇到一些不完美的地方。

- 使用 **64 位** 操作系统，并确保 Node >= 22。
- 推荐使用 **可修改的（git）安装方式**，以便查看日志和快速更新。
- 初次启动时不要加载通道/技能，然后逐个添加。
- 如果遇到奇怪的二进制问题，通常是 **ARM 兼容性** 问题。

文档：[Linux](/platforms/linux)、[安装](/install)。

### 我卡在“唤醒我的朋友”上线界面，无法继续怎么办

该屏幕取决于网关是否可访问并已认证。TUI 会在首次启动时自动发送 “Wake up, my friend!”。如果你看到该提示但 **没有回应**，且令牌值保持为 0，说明代理程序从未运行。

1) 重新启动网关：
bash
clawdbot gateway restart
``````
"2) 检查状态 + 认证：```bash
clawdbot status
clawdbot models status
clawdbot logs --follow
```
3) 如果仍然卡住，请运行：
bash
clawdbot doctor
``````
如果网关是远程的，请确保隧道/Tailscale连接已启动，并且UI指向正确的网关。参见[远程访问](/gateway/remote)。

### 我可以将我的设置迁移到新的Mac mini机器上而无需重新进行引导设置吗？

可以。请复制**状态目录**和**工作区**，然后运行一次Doctor。只要同时复制以下两个位置，就可以让您的机器人“完全相同”（包括内存、会话历史、认证和频道状态）：

1) 在新机器上安装Clawdbot。
2) 从旧机器复制 `$CLAWDBOT_STATE_DIR`（默认：`~/.clawdbot`）。
3) 复制您的工作区（默认：`~/clawd`）。
4) 运行 `clawdbot doctor` 并重启网关服务。

这将保留配置、认证配置文件、WhatsApp凭证、会话和内存。如果您处于远程模式，请记住网关主机负责会话存储和工作区。

**重要：** 如果您只将工作区提交/推送到GitHub，您备份的是 **内存 + 引导文件**，但 **不包括会话历史或认证信息**。这些信息存储在 `~/.clawdbot/` 下（例如 `~/.clawdbot/agents/<agentId>/sessions/`）。

相关：[文件在磁盘上的存储位置](/help/faq#where-does-clawdbot-store-its-data)，[代理工作区](/concepts/agent-workspace)，[Doctor](/gateway/doctor)，[远程模式](/gateway/remote)。

### 我在哪里可以看到最新版本的更新内容？

查看GitHub的变更日志：  
https://github.com/clawdbot/clawdbot/blob/main/CHANGELOG.md

最新的条目在顶部。如果顶部部分标记为 **Unreleased**，则下一个带日期的部分是最新发布的版本。条目按 **亮点**、**变更** 和 **修复** 进行分组（必要时包括文档/其他部分）。

### 我无法访问 docs.clawdbot 出现 SSL 错误，该怎么办？

一些Comcast/Xfinity的连接会错误地通过Xfinity高级安全功能阻止 `docs.clawd.bot`。请禁用它或在白名单中添加 `docs.clawd.bot`，然后重试。更多信息：[故障排除](/help/troubleshooting#docsclawdbot-shows-an-ssl-error-comcastxfinity)。  
请通过此链接帮助我们解除阻止：https://spa.xfinity.com/check_url_status。

如果您仍然无法访问该网站，文档已镜像在GitHub上：  
https://github.com/clawdbot/clawdbot/tree/main/docs

### stable 和 beta 有什么区别？

**Stable** 和 **beta** 是 **npm 的 dist-tags**，而不是独立的代码分支：
- `latest` = stable
- `beta` = 用于测试的早期版本

我们把构建发布到 **beta**，进行测试，一旦构建稳定，就会将 **同一版本提升到 `latest`**。这就是为什么 **beta 和 stable 可能指向同一个版本**。

查看发生了哪些变化：  
https://github.com/clawdbot/clawdbot/blob/main/CHANGELOG.md

### 如何安装 beta 版本？beta 和 dev 有什么区别？

**Beta** 是 npm 的 dist-tag `beta`（可能与 `latest` 相同）。  
**Dev** 是 `main` 分支的最新提交（git）；当发布时，使用 npm 的 dist-tag `dev`。

单行命令（macOS/Linux）：
bash
npm install clawdbot@beta
``` 或  
```bash
npm install clawdbot@dev```bash
curl -fsSL --proto '=https' --tlsv1.2 https://clawd.bot/install.sh | bash -s -- --beta
```
curl -fsSL --proto '=https' --tlsv1.2 https://clawd.bot/install.sh | bash -s -- --install-method git```
Windows 安装程序（PowerShell）:
https://clawd.bot/install.ps1

更多详情: [开发频道](/install/development-channels) 和 [安装程序标志](/install/installer)。

### 安装和注册通常需要多长时间

大致指南：
- **安装:** 2-5 分钟
- **注册:** 5-15 分钟，具体取决于您配置的频道/模型数量

如果安装卡住，请使用 [安装程序卡住](/help/faq#installer-stuck-how-do-i-get-more-feedback)
以及 [我卡住了](/help/faq#im-stuck--whats-the-fastest-way-to-get-unstuck) 中的快速调试循环。```bash
clawdbot update --channel dev
```
这将切换到 `main` 分支并从源代码更新。

2) **可修改安装（从安装程序网站）：**
bash
curl -fsSL https://clawd.bot/install.sh | bash -s -- --install-method git
``````
这将为你提供一个本地仓库，你可以进行编辑，然后通过 git 更新。

如果你更倾向于手动克隆一个干净的版本，请使用：```bash
git clone https://github.com/clawdbot/clawdbot.git
cd clawdbot
pnpm install
pnpm build
```
文档：[更新](/cli/update)，[开发渠道](/install/development-channels)，[安装](/install)。

### 安装程序卡住，该如何获取更多反馈

以**详细输出**模式重新运行安装程序：
bash
curl -fsSL https://clawd.bot/install.sh | bash -s -- --verbose
``````
带有详细信息的 Beta 安装：```bash
curl -fsSL https://clawd.bot/install.sh | bash -s -- --beta --verbose
```
对于可通过 Git 破解的安装：
bash
curl -fsSL https://clawd.bot/install.sh | bash -s -- --install-method git --verbose```
更多选项：[安装程序标志](/install/installer)。

### Windows 安装时提示 git 未找到或 clawdbot 未被识别

两个常见的 Windows 问题：

**1) npm 错误：spawn git / git 未找到**
- 安装 **Git for Windows**，并确保 `git` 在你的 PATH 环境变量中。
- 关闭并重新打开 PowerShell，然后重新运行安装程序。

**2) 安装后提示 clawdbot 未被识别**
- 你的 npm 全局 bin 文件夹未添加到 PATH 中。
- 检查路径：  ```powershell
  npm config get prefix
  ```
- 确保 `<prefix>\bin` 在 PATH 中（在大多数系统上，它位于 `%AppData%\npm`）。
- 在更新 PATH 后关闭并重新打开 PowerShell。

如果你想获得更顺畅的 Windows 设置体验，建议使用 **WSL2** 而不是原生 Windows。
文档：[Windows](/platforms/windows)。

### 文档没有回答我的问题，如何获得更好的答案

使用 **可修改（git）安装**，这样你就可以在本地拥有完整的源代码和文档，然后从该文件夹中向你的 bot（或 Claude/Codex）提问，这样它就可以读取仓库并给出更准确的答案。
bash
curl -fsSL https://clawd.bot/install.sh | bash -s -- --install-method git
``````
更多详情：[安装](/install) 和 [安装程序标志](/install/installer)。

### 如何在 Linux 上安装 Clawdbot

简短回答：按照 Linux 指南操作，然后运行引导向导。

- Linux 快速路径 + 服务安装：[Linux](/platforms/linux)。
- 完整教程：[开始使用](/start/getting-started)。
- 安装程序 + 更新：[安装与更新](/install/updating)。

### 如何在 VPS 上安装 Clawdbot

任何 Linux VPS 都可以使用。在服务器上安装，然后通过 SSH/Tailscale 访问网关（Gateway）。

指南：[exe.dev](/platforms/exe-dev)、[Hetzner](/platforms/hetzner)、[Fly.io](/platforms/fly)。  
远程访问：[网关远程访问](/gateway/remote)。

### 云 VPS 的安装指南在哪里

我们维护了一个 **托管中心**，包含常见的提供商。选择一个并按照指南操作：

- [VPS 托管](/vps)（在一个地方汇总所有提供商）
- [Railway](/railway)（一键式、基于浏览器的设置）
- [Fly.io](/platforms/fly)
- [Hetzner](/platforms/hetzner)
- [exe.dev](/platforms/exe-dev)

在云端的工作方式：**网关运行在服务器上**，你可以通过控制界面（或 Tailscale/SSH）从笔记本电脑/手机访问它。你的状态和工作区都保存在服务器上，因此请将主机视为真实数据源并进行备份。

你可以将 **节点**（Mac/iOS/Android/无头设备）与该云网关配对，以访问本地屏幕/摄像头/画布或在你的笔记本电脑上运行命令，同时保持网关在云端。

中心：[平台](/platforms)。远程访问：[网关远程访问](/gateway/remote)。  
节点：[节点](/nodes)、[节点 CLI](/cli/nodes)。```bash
clawdbot update
clawdbot update status
clawdbot update --channel stable|beta|dev
clawdbot update --tag <dist-tag|version>
clawdbot update --no-restart
```
如果您必须从代理进行自动化操作：
bash  
clawdbot update --yes --no-restart  
clawdbot gateway restart```
文档：[更新](/cli/update), [更新说明](/install/updating)。

### onboard 向导到底做了什么

`clawdbot onboard` 是推荐的设置路径。在 **本地模式** 下，它会引导你完成以下步骤：

- **模型/认证设置**（推荐使用 Anthropic 的 **setup-token** 用于 Claude 订阅，支持 OpenAI Codex OAuth，API 密钥为可选，支持 LM Studio 本地模型）
- **工作空间** 的位置和启动文件
- **网关设置**（绑定/端口/认证/Tailscale）
- **提供者**（WhatsApp、Telegram、Discord、Mattermost（插件）、Signal、iMessage）
- **守护进程安装**（macOS 上的 LaunchAgent；Linux/WSL2 上的 systemd 用户单元）
- **健康检查** 和 **技能** 选择

如果配置的模型未知或缺少认证信息，它也会发出警告。

### 我需要 Claude 或 OpenAI 订阅才能运行这个吗

不需要。你可以使用 **API 密钥**（Anthropic/OpenAI/其他）或者 **仅本地模型** 来运行 Clawdbot，这样你的数据会保留在你的设备上。订阅（Claude Pro/Max 或 OpenAI Codex）只是可选的认证方式。

文档：[Anthropic](/providers/anthropic), [OpenAI](/providers/openai), [本地模型](/gateway/local-models), [模型](/concepts/models)。

### 我可以不用 API 密钥使用 Claude Max 订阅吗

可以。你可以使用 **Claude Code CLI OAuth** 或 **setup-token** 来认证，而不是使用 API 密钥。这是订阅的认证路径。

Claude Pro/Max 订阅 **不包含 API 密钥**，因此这是适用于订阅账户的正确方法。重要提示：你必须确认这种使用方式是否符合 Anthropic 的订阅政策和条款。如果你想使用最明确、受支持的路径，建议使用 Anthropic API 密钥。

### Anthropic setup-token 认证是如何工作的

`claude setup-token` 通过 **Claude Code CLI** 生成一个 **令牌字符串**（在网页控制台中不可用）。你可以在 **任何机器** 上运行它。如果网关主机上已存在 Claude Code CLI 的凭证，Clawdbot 可以复用它们；否则，选择 **Anthropic 令牌（粘贴 setup-token）** 并粘贴该字符串。该令牌将作为 **anthropic** 提供者的认证配置文件存储，并像 API 密钥或 OAuth 配置文件一样使用。更多细节：[OAuth](/concepts/oauth)。

Clawdbot 会将 `auth.profiles["anthropic:claude-cli"].mode` 保持为 `"oauth"`，因此该配置文件可以接受 OAuth 或 setup-token 凭证；旧的 `"token"` 模式配置会自动迁移。```bash
claude setup-token
```
复制它输出的 token，然后在向导中选择 **Anthropic token (粘贴 setup-token)**。如果你想在网关主机上运行，使用 `clawdbot models auth setup-token --provider anthropic`。如果你在其他地方运行了 `claude setup-token`，请通过 `clawdbot models auth paste-token --provider anthropic` 在网关主机上粘贴它。详见 [Anthropic](/providers/anthropic)。

### 你们支持 Claude 订阅认证（Claude Code OAuth）吗？

是的。Clawdbot 可以 **复用 Claude Code CLI 凭证**（OAuth），同时也支持 **setup-token**。如果你有 Claude 订阅，我们建议使用 **setup-token** 用于长期运行的设置（需要 Claude Pro/Max + `claude` CLI）。你可以在任何地方生成它，然后粘贴到网关主机上。OAuth 复用是受支持的，但请避免通过 Clawdbot 和 Claude Code 分别登录，以防止 token 冲突。详见 [Anthropic](/providers/anthropic) 和 [OAuth](/concepts/oauth)。

注意：Claude 订阅访问由 Anthropic 的条款管理。对于生产环境或多人使用的工作负载，API 密钥通常是更安全的选择。

### 为什么我会看到来自 Anthropic 的 HTTP 429 速率限制错误？

这意味着你的 **Anthropic 配额/速率限制** 在当前窗口内已耗尽。如果你使用的是 **Claude 订阅**（setup-token 或 Claude Code OAuth），请等待窗口重置或升级你的计划。如果你使用的是 **Anthropic API 密钥**，请检查 Anthropic 控制台中的使用情况/账单，并根据需要提高限制。

提示：设置一个 **备用模型**，这样当某个提供方被速率限制时，Clawdbot 仍可以继续回复。
详见 [Models](/cli/models) 和 [OAuth](/concepts/oauth)。

### 是否支持 AWS Bedrock？

是的——通过 pi-ai 的 **Amazon Bedrock (Converse)** 提供商进行 **手动配置**。你必须在网关主机上提供 AWS 凭证/区域，并在你的模型配置中添加一个 Bedrock 提供商条目。详见 [Amazon Bedrock](/bedrock) 和 [Model providers](/providers/models)。如果你希望使用托管密钥流程，可以在 Bedrock 前面使用一个 OpenAI 兼容的代理仍然是一个有效选项。

### Codex 认证是如何工作的？

Clawdbot 通过 OAuth 或复用你的 Codex CLI 登录（`~/.codex/auth.json`）支持 **OpenAI Code (Codex)**。向导可以导入 CLI 登录或运行 OAuth 流程，并在适当的时候将默认模型设置为 `openai-codex/gpt-5.2`。详见 [Model providers](/concepts/model-providers) 和 [Wizard](/start/wizard)。

### 你们支持 OpenAI 订阅认证（Codex OAuth）吗？

是的。Clawdbot 完全支持 **OpenAI Code (Codex) 订阅 OAuth**，并且还可以在网关主机上复用现有的 Codex CLI 登录（`~/.codex/auth.json`）。入门向导可以为你导入 CLI 登录或运行 OAuth 流程。

详见 [OAuth](/concepts/oauth)、[Model providers](/concepts/model-providers) 和 [Wizard](/start/wizard)。

### 我如何设置 Gemini CLI OAuth？

Gemini CLI 使用 **插件认证流程**，而不是 `clawdbot.json` 中的客户端 ID 或密钥。

步骤：
1) 启用插件：`clawdbot plugins enable google-gemini-cli-auth`
2) 登录：`clawdbot models auth login --provider google-gemini-cli --set-default`

这会在网关主机上存储 OAuth 令牌到认证配置文件中。详情：[模型提供者](/concepts/model-providers)。

### 本地模型是否适合日常聊天

通常不行。Clawdbot 需要大上下文 + 强大的安全性；小型模型会截断并泄露信息。如果必须使用，请在本地运行你所能运行的 **最大** 的 MiniMax M2.1 版本（通过 LM Studio），并查看 [/gateway/local-models](/gateway/local-models)。更小或量化后的模型会增加提示注入的风险 - 详见 [安全](/gateway/security)。

### 如何确保托管模型的流量在特定区域

选择区域绑定的端点。OpenRouter 为 MiniMax、Kimi 和 GLM 提供了美国主机选项；选择美国主机的版本可以确保数据留在该区域内。你仍然可以使用 `models.mode: "merge"` 将 Anthropic/OpenAI 与这些模型一起列出，这样在尊重你所选区域提供者的同时，回退选项仍然可用。

### 我必须购买 Mac mini 来安装这个吗

不需要。Clawdbot 可以在 macOS 或 Linux 上运行（Windows 通过 WSL2）。Mac mini 是可选的 - 有些人购买它作为始终在线的主机，但小型 VPS、家庭服务器或 Raspberry Pi 类设备也可以。

你只需要 Mac **用于仅 macOS 工具**。对于 iMessage，你可以将网关运行在 Linux 上，并通过 SSH 在任意 Mac 上运行 `imsg`，只需将 `channels.imessage.cliPath` 指向一个运行 `imsg` 的 SSH 包装器。如果你想使用其他仅 macOS 的工具，请在 Mac 上运行网关或连接一个 macOS 节点。

文档：[iMessage](/channels/imessage)，[节点](/nodes)，[Mac 远程模式](/platforms/mac/remote)。

### 我需要 Mac mini 来支持 iMessage 吗

你需要 **一台 macOS 设备** 并登录到 Messages 应用。它 **不一定是 Mac mini** - 任何 Mac 都可以。Clawdbot 的 iMessage 集成运行在 macOS 上（BlueBubbles 或 `imsg`），而网关可以在其他设备上运行。

常见配置：
- 将网关运行在 Linux/VPS 上，并将 `channels.imessage.cliPath` 指向一个通过 SSH 运行 `imsg` 的包装器。
- 如果你想要最简单的单机设置，可以在 Mac 上运行所有内容。

文档：[iMessage](/channels/imessage)，[BlueBubbles](/channels/bluebubbles)，[Mac 远程模式](/platforms/mac/remote)。

### 如果我购买了一台 Mac mini 来运行 Clawdbot，我能否连接到我的 MacBook Pro

可以。**Mac mini 可以运行网关**，而你的 MacBook Pro 可以作为 **节点**（配套设备）连接。节点不会运行网关 - 它们提供额外的功能，如屏幕/摄像头/画布以及在该设备上的 `system.run`。

常见模式：
- 网关运行在 Mac mini 上（始终在线）。
- MacBook Pro 运行 macOS 应用或节点主机，并与网关配对。
- 使用 `clawdbot nodes status` / `clawdbot nodes list` 查看节点状态。

文档：[节点](/nodes)，[节点 CLI](/cli/nodes)。

### 我可以使用 Bun 吗

不推荐使用 Bun。我们发现它在 WhatsApp 和 Telegram 上存在运行时问题。建议使用 **Node** 来确保网关的稳定性。

如果你仍想尝试使用 Bun，请在非生产环境的网关上进行，不要包含 WhatsApp/Telegram。

### Telegram 中 allowFrom 的内容是什么

`channels.telegram.allowFrom` 是 **人类发送者的 Telegram 用户 ID**（数字形式，推荐使用）或 `@username`。它不是机器人的用户名。

更安全的方式（不使用第三方机器人）：
- 向你的机器人发送私信，然后运行 `clawdbot logs --follow` 并查看 `from.id`。

官方 Bot API 方式：
- 向你的机器人发送私信，然后调用 `https://api.telegram.org/bot<bot_token>/getUpdates` 并查看 `message.from.id`。

第三方方式（隐私性较差）：
- 向 `@userinfobot` 或 `@getidsbot` 发送私信。

详见 [/channels/telegram](/channels/telegram#access-control-dms--groups)。

### 多个人能否使用同一个 WhatsApp 号码并搭配不同的 Clawdbots

可以，通过 **多代理路由** 实现。将每个发送者的 WhatsApp **私信**（peer `kind: "dm"`，发送者 E.164 格式如 `+15551234567`）绑定到不同的 `agentId`，这样每个人都可以拥有自己的工作区和会话存储。回复仍然来自 **同一个 WhatsApp 账号**，并且 DM 访问控制（`channels.whatsapp.dmPolicy` / `channels.whatsapp.allowFrom`）是针对 WhatsApp 账号全局的。详见 [多代理路由](/concepts/multi-agent) 和 [WhatsApp](/channels/whatsapp)。

### 我能否同时运行一个快速聊天代理和一个用于编程的 Opus 代理

可以。使用 **多代理路由**：为每个代理分配其自己的默认模型，然后将入站路由（提供者账号或特定发送者）绑定到每个代理。示例配置位于 [多代理路由](/concepts/multi-agent) 中。也可参考 [模型](/concepts/models) 和 [配置](/gateway/configuration)。

### Homebrew 是否支持 Linux

是的。Homebrew 支持 Linux（称为 Linuxbrew）。快速设置方法如下：
bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> ~/.profile
eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
brew install <formula>
``````
如果通过 systemd 运行 Clawdbot，请确保服务的 PATH 包含 `/home/linuxbrew/.linuxbrew/bin`（或你的 brew 安装路径），以便在非登录 shell 中解析 `brew` 安装的工具。
最近的构建版本还会在 Linux systemd 服务中添加常见的用户 bin 目录（例如 `~/.local/bin`、`~/.npm-global/bin`、`~/.local/share/pnpm`、`~/.bun/bin`），并且在设置时会尊重 `PNPM_HOME`、`NPM_CONFIG_PREFIX`、`BUN_INSTALL`、`VOLTA_HOME`、`ASDF_DATA_DIR`、`NVM_DIR` 和 `FNM_DIR`。

### hackable git 安装和 npm 安装有什么区别？

- **Hackable（git）安装：** 完整的源代码检出，可编辑，最适合贡献者。
  你可以在本地运行构建，并对代码/文档进行修补。
- **npm 安装：** 全局 CLI 安装，无需仓库，最适合“直接运行”。
  更新来自 npm 的 dist-tags。

文档：[开始入门](/start/getting-started)，[更新指南](/install/updating)。

### 我可以在之后切换 npm 和 git 安装吗？

可以。安装另一种方式，然后运行 Doctor，使网关服务指向新的入口点。
这**不会删除你的数据** - 它只会更改 Clawdbot 的代码安装。你的状态文件（`~/.clawdbot`）和工作区（`~/clawd`）将保持不变。

从 npm 切换到 git：```bash
git clone https://github.com/clawdbot/clawdbot.git
cd clawdbot
pnpm install
pnpm build
clawdbot doctor
clawdbot gateway restart
```
从 Git → npm：
bash
npm install -g clawdbot@latest
clawdbot doctor
clawdbot gateway restart
``````
医生检测到网关服务入口点不匹配，并提供重写服务配置以匹配当前安装（在自动化中使用 `--repair`）。

备份提示：参见 [备份策略](/help/faq#whats-the-recommended-backup-strategy)。

### 我应该在笔记本电脑还是 VPS 上运行网关

简短回答：**如果你想要 24/7 的可靠性，请使用 VPS**。如果你想要最低的使用难度，并且可以接受睡眠/重启的情况，可以在本地运行。

**笔记本电脑（本地网关）**
- **优点：** 无需服务器费用，可直接访问本地文件，有实时浏览器窗口。
- **缺点：** 睡眠/网络中断会导致断开连接，操作系统更新/重启会中断运行，必须保持开机。

**VPS / 云服务器**
- **优点：** 始终在线，网络稳定，没有笔记本睡眠问题，更容易保持运行。
- **缺点：** 通常无头运行（使用截图），只能远程访问文件，更新需要通过 SSH。

**Clawdbot 特定说明：** WhatsApp/Telegram/Slack/Mattermost（插件）/Discord 从 VPS 上都可以正常运行。唯一的真正权衡是 **无头浏览器** 与可见窗口之间的选择。参见 [浏览器](/tools/browser)。

**推荐默认设置：** 如果你之前遇到过网关断开的情况，建议使用 VPS。当你正在积极使用 Mac 并需要本地文件访问或可见浏览器的 UI 自动化时，本地运行是非常好的选择。

### 在专用机器上运行 Clawdbot 有多重要

不需要，但**建议为了可靠性和隔离性**。

- **专用主机（VPS/Mac mini/Pi）：** 始终在线，较少的睡眠/重启中断，权限更清晰，更容易保持运行。
- **共享笔记本/桌面：** 对于测试和日常使用完全没问题，但当机器睡眠或更新时可能会有暂停。

如果你想兼顾两者，可以在专用主机上运行网关，并将你的笔记本作为 **节点** 用于本地屏幕/摄像头/执行工具。参见 [节点](/nodes)。
关于安全指导，请阅读 [安全](/gateway/security)。

### Clawdbot 的最低 VPS 要求和推荐的 OS

Clawdbot 是轻量级的。对于基本的网关 + 一个聊天频道：

- **最低要求：** 1 个 vCPU，1GB 内存，约 500MB 磁盘空间。
- **推荐配置：** 1-2 个 vCPU，2GB 内存或更多以提供缓冲（日志、媒体、多个频道）。节点工具和浏览器自动化可能会占用较多资源。

操作系统：使用 **Ubuntu LTS**（或任何现代的 Debian/Ubuntu）。Linux 安装路径在该系统上经过最充分的测试。

文档：[Linux](/platforms/linux)，[VPS 托管](/vps)。

### 我可以在虚拟机中运行 Clawdbot 吗？有什么要求

可以。将虚拟机视为与 VPS 相同：它需要始终在线、可访问，并且有足够的内存来运行网关和你启用的任何频道。

基础建议：
- **最低要求：** 1 个 vCPU，1GB 内存。
- **推荐配置：** 如果你运行多个频道、浏览器自动化或媒体工具，建议至少 2GB 内存。
- **操作系统：** Ubuntu LTS 或其他现代的 Debian/Ubuntu。

如果你使用 Windows，**WSL2 是最容易设置的虚拟机方式**，并且具有最好的工具兼容性。参见 [Windows](/platforms/windows)，[VPS 托管](/vps)。
如果你在虚拟机中运行 macOS，请参见 [macOS 虚拟机](/platforms/macos-vm)。

## 什么是 Clawdbot？

### 一句话介绍 Clawdbot

Clawdbot 是一个你可以在自己的设备上运行的个人 AI 助手。它在你已经使用的消息平台（WhatsApp、Telegram、Slack、Mattermost（插件）、Discord、Google Chat、Signal、iMessage、WebChat）上进行回复，还可以在支持的平台上进行语音交互和实时 Canvas 操作。**Gateway** 是始终在线的控制平面；助手则是产品本身。

### 价值主张是什么

Clawdbot 不仅仅是“一个 Claude 的封装器”。它是一个 **以本地优先的控制平面**，让你能够在 **自己的硬件上运行一个强大的助手**，通过你已经使用的聊天应用进行访问，具有 **有状态的会话、记忆和工具**，而无需将你的工作流程控制权交给一个托管的 SaaS 服务。

亮点：
- **你的设备，你的数据**：在你想要的任何地方运行 Gateway（Mac、Linux、VPS），并保持工作区和会话历史本地化。
- **真实的渠道，而非网络沙箱**：支持 WhatsApp/Telegram/Slack/Discord/Signal/iMessage 等聊天应用，以及在支持的平台上使用移动语音和 Canvas。
- **与模型无关**：可以使用 Anthropic、OpenAI、MiniMax、OpenRouter 等，支持按代理路由和故障转移。
- **仅本地选项**：可以运行本地模型，这样 **所有数据都可以留在你的设备上**。
- **多代理路由**：每个渠道、账户或任务都有独立的代理，每个代理都有自己的工作区和默认设置。
- **开源且可自定义**：可以查看、扩展和自托管，避免供应商锁定。

文档：[Gateway](/gateway)，[Channels](/channels)，[多代理](/concepts/multi-agent)，[记忆](/concepts/memory)。

### 我刚刚设置好了，接下来应该做什么

好的第一个项目包括：
- 构建一个网站（WordPress、Shopify 或一个简单的静态网站）。
- 原型设计一个移动应用（大纲、界面、API 规划）。
- 整理文件和文件夹（清理、命名、标签）。
- 连接 Gmail 并自动化摘要或后续跟进。

它可以处理大型任务，但当您将其拆分为阶段并使用子代理进行并行工作时，效果最佳。

### Clawdbot 的五个日常使用场景是什么

日常使用通常包括：
- **个人简报**：对您关心的收件箱、日历和新闻进行摘要。
- **研究与起草**：为邮件或文档进行快速研究、摘要和初稿。
- **提醒与跟进**：基于定时任务或心跳触发的提醒和待办清单。
- **浏览器自动化**：填写表单、收集数据和重复网络任务。
- **跨设备协作**：从手机发送任务，让 Gateway 在服务器上执行，并通过聊天返回结果。

### Clawdbot 能否帮助生成 SaaS 的潜在客户推广广告和博客文章

对于 **研究、筛选和起草**，Clawdbot 可以提供帮助。它可以扫描网站，建立短名单，总结潜在客户，并撰写推广或广告文案的初稿。

但 **对于推广或广告执行**，请保持有人在流程中。避免垃圾邮件，遵守当地法律和平台政策，并在发送前审查所有内容。最安全的做法是让 Clawdbot 撰写内容，然后由你进行审核。

文档：[安全](/gateway/security)。

### 与 Claude Code 相比，Clawdbot 在 Web 开发方面有哪些优势

Clawdbot 是一个 **个人助手** 和协调层，而不是 IDE 的替代品。在仓库内进行最快的直接编码循环时，请使用 Claude Code 或 Codex。当您需要持久化记忆、跨设备访问和工具编排时，请使用 Clawdbot。

优势：
- **跨会话的持久化记忆 + 工作区**
- **多平台访问**（WhatsApp、Telegram、TUI、WebChat）
- **工具编排**（浏览器、文件、日程安排、钩子）
- **始终在线的网关**（在 VPS 上运行，可从任何地方交互）
- **节点** 用于本地浏览器/屏幕/摄像头/执行

展示：https://clawd.bot/showcase

## 技能与自动化

### 如何自定义技能而不污染仓库

使用 **托管覆盖** 而不是直接编辑仓库副本。将您的更改放在 `~/.clawdbot/skills/<name>/SKILL.md` 中（或通过 `~/.clawdbot/clawdbot.json` 中的 `skills.load.extraDirs` 添加一个文件夹）。优先级为：`<workspace>/skills` > `~/.clawdbot/skills` > 内置的，因此托管覆盖不会影响 git。只有上游有价值的修改应该存在于仓库中，并作为 PR 提交。

### 我可以从自定义文件夹加载技能吗

可以。通过在 `~/.clawdbot/clawdbot.json` 中的 `skills.load.extraDirs` 添加额外目录（优先级最低）。默认优先级仍然保持：`<workspace>/skills` → `~/.clawdbot/skills` → 内置 → `skills.load.extraDirs`。`clawdhub` 默认安装到 `./skills`，Clawdbot 将其视为 `<workspace>/skills`。

### 如何为不同任务使用不同的模型

目前支持的模式有：
- **定时任务**：每个任务可以设置 `model` 覆盖。
- **子代理**：将任务路由到具有不同默认模型的独立代理。
- **按需切换**：在聊天中使用 `/model` 命令随时切换当前会话的模型。

参见 [定时任务](/automation/cron-jobs)、[多代理路由](/concepts/multi-agent) 和 [斜杠命令](/tools/slash-commands)。

### 机器人在执行重任务时会卡住，如何卸载

对于长时间或并行任务，请使用 **子代理**。子代理在自己的会话中运行，返回摘要，并保持您的主聊天响应流畅。

让您的机器人“为这个任务生成一个子代理”或使用 `/subagents`。
在聊天中使用 `/status` 查看网关当前正在做什么（以及是否忙碌）。

令牌提示：长时间任务和子代理都会消耗令牌。如果成本是关注点，可以通过 `agents.defaults.subagents.model` 为子代理设置更便宜的模型。

文档：[子代理](/tools/subagents)。

### 定时任务或提醒未触发，我应该检查什么

定时任务在网关进程中运行。如果网关没有持续运行，定时任务将不会执行。

检查清单：
- 确认定时任务已启用（`cron.enabled`），并且未设置 `CLAWDBOT_SKIP_CRON`。
- 检查网关是否全天候运行（不休眠/重启）。
- 验证任务的时间区设置（`--tz` 与主机时间区）。

调试：```bash
clawdbot cron run <jobId> --force
clawdbot cron runs --id <jobId> --limit 50
```
"文档：[定时任务](/automation/cron-jobs)，[Cron 与 Heartbeat](/automation/cron-vs-heartbeat)。

### 如何在 Linux 上安装技能

使用 **ClawdHub**（CLI）或直接将技能放入你的工作区。macOS 的技能界面在 Linux 上不可用。
在 https://clawdhub.com 浏览技能。

安装 ClawdHub CLI（选择一个包管理器）：
bash
npm i -g clawdhub
```"```
```md
pnpm add -g clawdhub```
### Clawdbot 是否可以在计划任务或后台持续运行任务

是的。使用网关调度器：

- **Cron 任务** 用于计划或重复性任务（在重启后仍然保留）。
- **心跳机制** 用于“主会话”的周期性检查。
- **隔离任务** 用于自主代理，用于发布摘要或向聊天发送内容。

文档：[Cron 任务](/automation/cron-jobs)，[Cron 与心跳机制的区别](/automation/cron-vs-heartbeat)，[心跳机制](/gateway/heartbeat)。

**能否仅在 macOS 上运行的技能在 Linux 上运行**

不能直接运行。macOS 技能受到 `metadata.clawdbot.os` 加上所需二进制文件的限制，只有当技能在 **网关主机** 上符合条件时，才会出现在系统提示中。在 Linux 上，`darwin` 专用技能（如 `imsg`、`apple-notes`、`apple-reminders`）将不会加载，除非你覆盖了这些限制。

你有三种支持的方案：

**选项 A - 在 Mac 上运行网关（最简单）。**  
在拥有 macOS 二进制文件的机器上运行网关，然后从 Linux 以 [远程模式](#how-do-i-run-clawdbot-in-remote-mode-client-connects-to-a-gateway-elsewhere) 连接，或通过 Tailscale 连接。由于网关主机是 macOS，这些技能可以正常加载。

**选项 B - 使用 macOS 节点（无需 SSH）。**  
在 Linux 上运行网关，然后配对一个 macOS 节点（菜单栏应用），并在 macOS 上设置 **节点运行命令** 为“始终询问”或“始终允许”。当节点上存在所需的二进制文件时，Clawdbot 可以将 macOS 专用技能视为可用。代理会通过 `nodes` 工具运行这些技能。如果你选择“始终询问”，在提示中批准“始终允许”会将该命令添加到允许列表中。

**选项 C - 通过 SSH 代理 macOS 二进制文件（高级）。**  
在 Linux 上保持网关运行，但让所需的 CLI 二进制文件通过 SSH 包装器在 Mac 上运行。然后覆盖技能设置，使 Linux 保持技能的可用性。
  
1) 为二进制文件创建一个 SSH 包装器（例如：`imsg`）：   ```bash
   #!/usr/bin/env bash
   set -euo pipefail
   exec ssh -T user@mac-host /opt/homebrew/bin/imsg "$@"
   ```
2) 将包装器添加到 Linux 主机的 `PATH` 中（例如 `~/bin/imsg`）。
3) 覆盖技能元数据（工作区或 `~/.clawdbot/skills`）以允许 Linux：---
name: imsg
description: 用于列出聊天、历史记录、监控和发送 iMessage/SMS 的命令行工具。
metadata: {"clawdbot":{"os":["darwin","linux"],"requires":{"bins":["imsg"]}}}
---4) 启动一个新的会话以使技能快照刷新。

对于 iMessage 特别来说，你也可以将 `channels.imessage.cliPath` 指向一个 SSH 包装器（Clawdbot 只需要 stdio 即可）。请参阅 [iMessage](/channels/imessage)。

### 你有 Notion 或 HeyGen 的集成吗？

目前没有内置集成。

选项有：
- **自定义技能 / 插件**：最适合需要可靠 API 访问的情况（Notion 和 HeyGen 都提供了 API）。
- **浏览器自动化**：无需代码即可工作，但速度较慢且更脆弱。

如果你想为每个客户端（如代理工作流程）保留上下文，一个简单的做法是：
- 为每个客户端创建一个 Notion 页面（包含上下文 + 偏好设置 + 当前工作）。
- 让代理在会话开始时获取该页面。

如果你想实现原生集成，可以提交一个功能请求，或者开发一个针对这些 API 的技能。
bash
clawdhub install <skill-slug>
clawdhub update --all
``````
ClawdHub 安装到当前目录下的 `./skills` 文件夹中（或回退到您配置的 Clawdbot 工作空间）；在下一次会话中，Clawdbot 会将该文件夹视为 `<workspace>/skills`。对于多个代理共享的技能，请将其放置在 `~/.clawdbot/skills/<name>/SKILL.md` 中。一些技能需要通过 Homebrew 安装二进制文件；在 Linux 上这意味着需要使用 Linuxbrew（请参见上面的 Homebrew Linux 常见问题解答）。请参阅 [Skills](/tools/skills) 和 [ClawdHub](/tools/clawdhub)。

### 如何安装浏览器接管的 Chrome 扩展

使用内置安装程序，然后在 Chrome 中加载未打包的扩展程序：```bash
clawdbot browser extension install
clawdbot browser extension path
```
然后在 Chrome 中 → `chrome://extensions` → 启用“开发者模式” → 点击“加载解压的扩展程序” → 选择该文件夹。

完整指南（包括通过 Tailscale 的远程网关 + 安全注意事项）：[Chrome 扩展程序](/tools/chrome-extension)

如果网关与 Chrome 在同一台机器上运行（默认设置），通常 **不需要** 使用 `clawdbot browser serve`。
你仍然需要点击你想要控制的标签页上的扩展程序按钮（它不会自动附加）。

## 沙箱与内存

### 是否有专门的沙箱文档

是的。请参阅 [沙箱](/gateway/sandboxing)。对于 Docker 特定的设置（完整网关在 Docker 中或沙箱镜像中），请参阅 [Docker](/install/docker)。

**我可以保留 DM 为私有，但让群组在同一个代理下公开沙箱化吗**

可以 - 如果你的私人流量是 **DM**，而公共流量是 **群组**。

使用 `agents.defaults.sandbox.mode: "non-main"`，这样群组/频道会话（非主密钥）会在 Docker 中运行，而主 DM 会话则保持在主机上。然后通过 `tools.sandbox.tools` 限制沙箱会话中可用的工具。

设置步骤 + 示例配置：[群组：私有 DM + 公共群组](/concepts/groups#pattern-personal-dms-public-groups-single-agent)

关键配置参考：[网关配置](/gateway/configuration#agentsdefaultssandbox)

### 如何将主机文件夹绑定到沙箱中

将 `agents.defaults.sandbox.docker.binds` 设置为 `["host:path:mode"]`（例如，`"/home/user/src:/src:ro"`）。全局绑定和按代理绑定会合并；当 `scope: "shared"` 时，按代理绑定会被忽略。对于任何敏感内容，请使用 `:ro`，并记住绑定会绕过沙箱的文件系统隔离。参见 [沙箱](/gateway/sandboxing#custom-bind-mounts) 和 [沙箱 vs 工具策略 vs 提权](/gateway/sandbox-vs-tool-policy-vs-elevated#bind-mounts-security-quick-check) 获取示例和安全注意事项。

### 内存是如何工作的

Clawdbot 的内存只是代理工作区中的 Markdown 文件：
- 每日笔记在 `memory/YYYY-MM-DD.md`
- 人工整理的长期笔记在 `MEMORY.md`（仅主/私人会话）

Clawdbot 还会运行一个 **无声的预压缩内存刷新**，以提醒模型在自动压缩前写入持久化笔记。这仅在工作区可写时运行（只读沙箱会跳过它）。参见 [内存](/concepts/memory)。

### 内存总是忘记东西，如何让它记住

让 bot **将事实写入内存**。长期笔记应放在 `MEMORY.md` 中，短期上下文则放在 `memory/YYYY-MM-DD.md` 中。

这仍然是我们正在改进的领域。提醒模型存储记忆会有帮助；它会知道该怎么做。如果它仍然忘记，请确认网关在每次运行时都使用相同的 workspace。

文档：[内存](/concepts/memory)，[代理工作区](/concepts/agent-workspace)。

### 语义内存搜索是否需要 OpenAI API 密钥

仅当你使用 **OpenAI 嵌入** 时才有效。Codex OAuth 仅覆盖 chat/completions 功能，**不** 提供嵌入访问权限，因此 **通过 Codex（OAuth 或 Codex CLI 登录）登录** 对语义记忆搜索 **没有帮助**。OpenAI 嵌入仍需要一个真实的 API 密钥（`OPENAI_API_KEY` 或 `models.providers.openai.apiKey`）。

如果你没有显式设置提供者，当 Clawdbot 能够解析 API 密钥（认证配置文件、`models.providers.*.apiKey` 或环境变量）时，它会自动选择一个提供者。它会优先选择 OpenAI，如果 OpenAI 密钥可用；否则会选择 Gemini。如果两者密钥都不可用，记忆搜索将保持禁用，直到你进行配置。如果你配置了本地模型路径并且该路径存在，Clawdbot 会优先选择 `local`。

如果你想保持本地模式，可以设置 `memorySearch.provider = "local"`（并可选设置 `memorySearch.fallback = "none"`）。如果你想使用 Gemini 嵌入，可以设置 `memorySearch.provider = "gemini"` 并提供 `GEMINI_API_KEY`（或 `memorySearch.remote.apiKey`）。我们支持 **OpenAI、Gemini 或本地** 嵌入模型 - 请参阅 [Memory](/concepts/memory) 了解具体的配置细节。

### 记忆是否永久保存？有哪些限制？

记忆文件存储在磁盘上，并会一直存在直到你手动删除它们。限制取决于你的存储空间，而不是模型本身。**会话上下文** 仍然受限于模型的上下文窗口，因此长时间的对话可能会被压缩或截断。这就是为什么需要记忆搜索的原因——它只将相关部分重新拉入上下文中。

文档：[Memory](/concepts/memory)，[Context](/concepts/context)。

## 数据在磁盘上的存储位置

### Clawdbot 使用的所有数据都会本地保存吗？

不会——**Clawdbot 的状态是本地的**，但**外部服务仍会看到你发送给它们的内容**。

- **默认本地存储**：会话、记忆文件、配置和工作区数据都存储在网关主机上（`~/.clawdbot` + 你的工作区目录）。
- **必要时远程存储**：你发送给模型提供者（如 Anthropic/OpenAI 等）的消息会发送到它们的 API，而聊天平台（如 WhatsApp/Telegram/Slack 等）则会将其消息数据存储在它们的服务器上。
- **你控制数据范围**：使用本地模型时，提示信息会保留在你的机器上，但频道流量仍会经过频道的服务器。

相关：[Agent 工作区](/concepts/agent-workspace)，[Memory](/concepts/memory)。

### Clawdbot 将数据存储在哪里？

所有数据都存储在 `$CLAWDBOT_STATE_DIR` 目录下（默认为 `~/.clawdbot`）。

| 路径 | 用途 |
|------|---------|
| `$CLAWDBOT_STATE_DIR/clawdbot.json` | 主配置文件（JSON5 格式） |
| `$CLAWDBOT_STATE_DIR/credentials/oauth.json` | 旧版 OAuth 导入文件（首次使用时会复制到认证配置文件中） |
| `$CLAWDBOT_STATE_DIR/agents/<agentId>/agent/auth-profiles.json` | 认证配置文件（OAuth + API 密钥） |
| `$CLAWDBOT_STATE_DIR/agents/<agentId>/agent/auth.json` | 运行时认证缓存（自动管理） |
| `$CLAWDBOT_STATE_DIR/credentials/` | 供应商状态（例如 `whatsapp/<accountId>/creds.json`） |
| `$CLAWDBOT_STATE_DIR/agents/` | 每个代理的状态（agentDir + 会话） |
| `$CLAWDBOT_STATE_DIR/agents/<agentId>/sessions/` | 对话历史和状态（每个代理） |
| `$CLAWDBOT_STATE_DIR/agents/<agentId>/sessions/sessions.json` | 会话元数据（每个代理） |

旧版单代理路径：`~/.clawdbot/agent/*`（通过 `clawdbot doctor` 迁移）。

你的 **工作区**（AGENTS.md、记忆文件、技能等）是独立的，并通过 `agents.defaults.workspace` 配置（默认：`~/clawd`）。

### AGENTS.md、SOUL.md、USER.md、MEMORY.md 应该放在哪里

这些文件位于 **代理工作区** 中，而不是 `~/.clawdbot`。

- **工作区（每个代理）**：`AGENTS.md`、`SOUL.md`、`IDENTITY.md`、`USER.md`、
  `MEMORY.md`（或 `memory.md`）、`memory/YYYY-MM-DD.md`，可选的 `HEARTBEAT.md`。
- **状态目录（`~/.clawdbot`）**：配置文件、凭证、认证配置文件、会话、日志，
  以及共享技能（`~/.clawdbot/skills`）。

默认工作区为 `~/clawd`，可通过以下方式配置：
json5
{
  agents: { defaults: { workspace: "~/clawd" } }
}
``````
如果机器人在重启后“遗忘”，请确认网关在每次启动时都使用相同的workspace（请注意：远程模式使用的是**网关主机的**workspace，而不是你本地的笔记本电脑）。

提示：如果你想让机器人保持持久的行为或偏好，请让机器人将内容**写入AGENTS.md或MEMORY.md**，而不是依赖聊天记录。

参见[代理工作区](/concepts/agent-workspace)和[记忆](/concepts/memory)。

### 推荐的备份策略是什么？

将你的**代理工作区**放在一个**私有**的git仓库中，并备份到一个私有位置（例如GitHub私有仓库）。这会捕获memory + AGENTS/SOUL/USER文件，并允许你以后恢复助手的“思维”。

不要提交任何位于`~/.clawdbot`下的内容（凭证、会话、令牌）。如果你需要完整恢复，请分别备份工作区和状态目录（参见上面的迁移问题）。

文档：[代理工作区](/concepts/agent-workspace)。

### 如何彻底卸载Clawdbot？

参见专用指南：[卸载](/install/uninstall)。

### 代理是否可以在工作区外运行？

可以。工作区是**默认的工作目录**和记忆锚点，而不是一个严格的沙盒。相对路径会在工作区内解析，但绝对路径可以访问主机上的其他位置，除非启用了沙盒功能。如果你需要隔离环境，请使用[`agents.defaults.sandbox`](/gateway/sandboxing)或每个代理的沙盒设置。如果你想让某个仓库成为默认工作目录，请将该代理的`workspace`指向仓库根目录。Clawdbot仓库只是源代码；除非你有意让代理在其中运行，否则请将工作区保持独立。

示例（仓库作为默认工作目录）：```json5
{
  agents: {
    defaults: {
      workspace: "~/Projects/my-repo"
    }
  }
}
```
### 我处于远程模式，会话存储在哪里

会话状态由 **网关主机** 拥有。如果你处于远程模式，你关心的会话存储在远程机器上，而不是你的本地笔记本电脑上。请参阅 [会话管理](/concepts/session)。

## 配置基础

### 配置的格式是什么？它在哪里

Clawdbot 会从 `$CLAWDBOT_CONFIG_PATH`（默认值：`~/.clawdbot/clawdbot.json`）读取一个可选的 **JSON5** 配置文件：

$CLAWDBOT_CONFIG_PATH
``````
如果文件缺失，将使用较为安全的默认值（包括默认工作目录为 `~/clawd`）。

### 我设置了 gatewaybind 为 lan 或 tailnet，但现在没有任何监听，UI 显示未经授权

非回环地址的绑定 **需要认证**。请配置 `gateway.auth.mode` 和 `gateway.auth.token`（或者使用环境变量 `CLAWDBOT_GATEWAY_TOKEN`）。```json5
{
  gateway: {
    bind: "lan",
    auth: {
      mode: "token",
      token: "replace-me"
    }
  }
}
```
注意事项：
- `gateway.remote.token` 仅用于 **远程 CLI 调用**；它不会启用本地网关认证。
- 控制 UI 通过 `connect.params.auth.token` 进行认证（存储在应用/UI 设置中）。请避免将令牌放在 URL 中。

### 为什么现在需要在 localhost 上使用令牌

向导默认会生成一个网关令牌（即使是在回环地址上），因此 **本地 WS 客户端必须进行认证**。这会阻止其他本地进程调用网关。请将令牌粘贴到 Control UI 设置中（或你的客户端配置）以连接。

如果你想 **真的** 允许回环地址的开放访问，请从配置中移除 `gateway.auth`。Doctor 可以随时为你生成一个令牌：`clawdbot doctor --generate-gateway-token`。

### 修改配置后是否需要重启

网关会监视配置并支持热重载：

- `gateway.reload.mode: "hybrid"`（默认）：对安全的更改进行热应用，对关键更改进行重启
- 也支持 `hot`、`restart`、`off`

### 如何启用网页搜索和网页获取

`web_fetch` 不需要 API 密钥即可使用。`web_search` 需要 Brave Search API 密钥。**推荐操作**：运行 `clawdbot configure --section web` 以将密钥存储在 `tools.web.search.apiKey` 中。环境变量替代方案：为网关进程设置 `BRAVE_API_KEY`。
json5
{
  tools: {
    web: {
      search: {
        enabled: true,
        apiKey: "BRAVE_API_KEY_HERE",
        maxResults: 5
      },
      fetch: {
        enabled: true
      }
    }
  }
}
``````
备注：
- 如果使用允许列表，请添加 `web_search`/`web_fetch` 或 `group:web`。
- `web_fetch` 默认是启用的（除非显式禁用）。
- 守护进程会从 `~/.clawdbot/.env`（或服务环境）读取环境变量。

文档：[网络工具](/tools/web)。

### 如何在不同设备上运行一个中心网关和专门的工作者

常见模式是 **一个网关**（例如树莓派）加上 **节点** 和 **代理**：

- **网关（中心）**：拥有通道（Signal/WhatsApp）、路由和会话。
- **节点（设备）**：Mac/iOS/Android 作为外围设备连接，并提供本地工具（`system.run`、`canvas`、`camera`）。
- **代理（工作者）**：为特定角色提供独立的“大脑”/工作空间（例如“Hetzner 运维”、“个人数据”）。
- **子代理**：当需要并行处理时，可以从主代理中派生出后台工作。
- **TUI**：连接到网关并切换代理/会话。

文档：[节点](/nodes)，[远程访问](/gateway/remote)，[多代理路由](/concepts/multi-agent)，[子代理](/tools/subagents)，[TUI](/tui)。

### Clawdbot 浏览器可以无头运行吗？

可以。这是一个配置选项：```json5
{
  browser: { headless: true },
  agents: {
    defaults: {
      sandbox: { browser: { headless: true } }
    }
  }
}
```
默认值为 `false`（有头模式）。无头模式在一些网站上更可能触发反机器人检查。请参阅 [Browser](/tools/browser)。

无头模式使用相同的 **Chromium 引擎**，并且适用于大多数自动化操作（表单填写、点击、爬取、登录）。主要区别如下：
- 没有可见的浏览器窗口（如需视觉效果，请使用截图）。
- 一些网站在无头模式下对自动化更严格（例如 CAPTCHA、反机器人机制）。
  例如，X/Twitter 常常会阻止无头会话。

### 如何使用 Brave 浏览器进行浏览器控制

将 `browser.executablePath` 设置为你的 Brave 可执行文件路径（或任何基于 Chromium 的浏览器），然后重启 Gateway。
有关完整的配置示例，请参阅 [Browser](/tools/browser#use-brave-or-another-chromium-based-browser)。

## 远程网关 + 节点

### 命令如何在 Telegram、网关和节点之间传播

Telegram 消息由 **网关** 处理。网关运行代理程序，并在需要节点工具时通过 **网关 WebSocket** 调用节点：

Telegram → 网关 → 代理 → `node.*` → 节点 → 网关 → Telegram

节点不会看到入站的提供者流量；它们只接收节点的 RPC 调用。

### 如果网关托管在远程，我的代理如何访问我的电脑

简短回答：**将你的电脑作为节点进行配对**。网关运行在其他地方，但它可以通过网关 WebSocket 在你的本地机器上调用 `node.*` 工具（屏幕、摄像头、系统）。

典型设置如下：
1) 在常驻主机（VPS/家庭服务器）上运行网关。
2) 将网关主机和你的电脑置于同一个 tailnet 网络中。
3) 确保网关 WebSocket 可以被访问（通过 tailnet 绑定或 SSH 隧道）。
4) 在本地打开 macOS 应用程序并以 **通过 SSH 远程连接** 模式（或直接 tailnet）连接，以便它可以注册为一个节点。
5) 在网关上批准该节点：
bash
   clawdbot nodes pending
   clawdbot nodes approve <requestId>
```   ```
无需单独的 TCP 桥接；节点通过网关 WebSocket 连接。

安全提醒：配对 macOS 节点将允许在该机器上运行 `system.run`。请仅配对你信任的设备，并查阅 [安全](/gateway/security)。

文档：[节点](/nodes)，[网关协议](/gateway/protocol)，[macOS 远程模式](/platforms/mac/remote)，[安全](/gateway/security)。

### Tailscale 已连接，但我收不到回复，现在该怎么办？

先检查基本设置：
- 网关是否正在运行：`clawdbot gateway status`
- 网关状态：`clawdbot status`
- 通道状态：`clawdbot channels status`

然后验证认证和路由：
- 如果你使用 Tailscale Serve，请确保 `gateway.auth.allowTailscale` 设置正确。
- 如果通过 SSH 隧道连接，请确认本地隧道已启动，并指向正确的端口。
- 确认你的允许列表（DM 或群组）中包含你的账户。

文档：[Tailscale](/gateway/tailscale)，[远程访问](/gateway/remote)，[通道](/channels)。

### 两个 Clawdbot 能否在本地 VPS 上互相通信？

可以。虽然没有内置的“bot-to-bot”桥接，但你可以通过几种可靠的方式实现：

**最简单的方法**：使用一个两个机器人都能访问的普通聊天通道（如 Telegram/Slack/WhatsApp）。让 Bot A 向 Bot B 发送消息，然后 Bot B 正常回复即可。

**CLI 桥接（通用方法）**：运行一个脚本，通过 `clawdbot agent --message ... --deliver` 调用另一个网关，并指向另一个机器人监听的聊天通道。如果其中一个机器人在 Railway/VPS 上，可以通过 SSH/Tailscale（见 [远程访问](/gateway/remote)）连接到该远程网关。

示例模式（从可以访问目标网关的机器上运行）：```bash
clawdbot agent --message "Hello from local bot" --deliver --channel telegram --reply-to <chat-id>
```
提示：添加一个护栏以防止两个机器人无限循环（仅提及、频道允许列表或“不要回复机器人消息”的规则）。

文档：[远程访问](/gateway/remote)，[Agent CLI](/cli/agent)，[Agent send](/tools/agent-send)。

### 我需要为多个代理程序单独安装 VPS 吗？

不需要。一个 Gateway 可以托管多个代理，每个代理都有自己的工作区、模型默认设置和路由方式。这是正常的设置，比为每个代理运行一个 VPS 更便宜也更简单。

只有在你需要硬隔离（安全边界）或非常不同的配置且不想共享时，才使用单独的 VPS。否则，保持一个 Gateway，并使用多个代理或子代理。

### 在我的个人笔记本电脑上使用节点，而不是通过 VPS 进行 SSH 有什么好处？

是的——节点是通过远程 Gateway 访问你的笔记本电脑的第一优先方式，它们解锁的不仅仅是 shell 访问权限。Gateway 在 macOS/Linux（Windows 通过 WSL2）上运行，并且是轻量级的（一个小型 VPS 或树莓派级别的设备就足够了；4 GB 内存已经很充足），因此常见的配置是保持一个常驻主机加上你的笔记本电脑作为节点。

- **无需入站 SSH。** 节点通过 WebSocket 连接到 Gateway 并使用设备配对。
- **更安全的执行控制。** `system.run` 会在该笔记本电脑上通过节点允许列表/批准进行限制。
- **更多的设备工具。** 节点除了 `system.run` 之外，还提供 `canvas`、`camera` 和 `screen`。
- **本地浏览器自动化。** 保持 Gateway 在 VPS 上，但本地运行 Chrome 并通过 Chrome 插件 + `clawdbot browser serve` 中继控制。

SSH 适用于临时 shell 访问，但对于持续的代理工作流和设备自动化，节点更简单。

文档：[节点](/nodes)，[节点 CLI](/cli/nodes)，[Chrome 插件](/tools/chrome-extension)。

### 我应该在第二台笔记本电脑上安装还是只是添加一个节点？

如果你只需要在第二台笔记本电脑上使用 **本地工具**（屏幕/摄像头/执行），请将其作为 **节点** 添加。这样可以保持一个 Gateway，并避免配置重复。目前本地节点工具仅支持 macOS，但我们计划将其扩展到其他操作系统。

只有在你需要 **硬隔离** 或两个完全独立的机器人时，才安装第二个 Gateway。

文档：[节点](/nodes)，[节点 CLI](/cli/nodes)，[多个 Gateway](/gateway/multiple-gateways)。

### 节点会运行一个 Gateway 服务吗？

不会。每个主机上应只运行一个 Gateway，除非你有意运行隔离的配置文件（参见 [多个 Gateway](/gateway/multiple-gateways)）。节点是连接到 Gateway 的外围设备（如 iOS/Android 节点，或在菜单栏应用中的 macOS“节点模式”）。对于无头节点主机和 CLI 控制，请参见 [节点主机 CLI](/cli/node)。

`gateway`、`discovery` 和 `canvasHost` 的更改都需要重启。

### 是否有通过 API RPC 应用配置的方式？

是的。`config.apply` 会验证并写入完整的配置，并在操作过程中重启 Gateway。

### `config.apply` 清除了我的配置，如何恢复并避免这种情况？

`config.apply` 会替换 **整个配置**。如果你发送的是一个部分对象，那么其他内容都会被删除。

恢复：
- 从备份恢复（使用 git 或复制的 `~/.clawdbot/clawdbot.json`）。
- 如果没有备份，请重新运行 `clawdbot doctor` 并重新配置频道/模型。
- 如果这是意外发生的情况，请提交一个 bug 报告，并附上你最后已知的配置或任何备份。
- 本地的代码代理通常可以从日志或历史记录中重建一个可用的配置。

避免它：
- 对于小的更改，请使用 `clawdbot config set`。
- 对于交互式编辑，请使用 `clawdbot configure`。

文档：[配置](/cli/config), [配置编辑](/cli/configure), [医生](/gateway/doctor)。

### 什么是首次安装的最小合理配置
json5
{
  agents: { defaults: { workspace: "~/clawd" } },
  channels: { whatsapp: { allowFrom: ["+15555550123"] } }
}
``````
这将设置您的工作区并限制谁可以触发机器人。

### 如何在 VPS 上安装 Tailscale 并从我的 Mac 连接

简化的步骤如下：

1) **在 VPS 上安装并登录**   ```bash
   curl -fsSL https://tailscale.com/install.sh | sh
   sudo tailscale up
   ```
2) **在你的 Mac 上安装并登录**
   - 使用 Tailscale 应用程序，并登录到同一个 tailnet。
3) **启用 MagicDNS（推荐）**
   - 在 Tailscale 管理控制台中启用 MagicDNS，以便 VPS 拥有一个稳定的名称。
4) **使用 tailnet 主机名**
   - SSH: `ssh user@your-vps.tailnet-xxxx.ts.net`
   - 网关 WS: `ws://your-vps.tailnet-xxxx.ts.net:18789`

如果你想在不使用 SSH 的情况下使用控制界面，请在 VPS 上使用 Tailscale Serve：
bash
clawdbot gateway --tailscale serve```
这会将网关绑定到环回地址，并通过 Tailscale 暴露 HTTPS。请参见 [Tailscale](/gateway/tailscale)。

### 如何将 Mac 节点连接到远程网关的 Tailscale 服务

Serve 暴露了 **网关控制 UI + WS**。节点通过相同的网关 WS 端点进行连接。

推荐设置：
1) **确保 VPS 和 Mac 处于同一个 tailnet 中**。
2) **使用 macOS 应用程序的远程模式**（SSH 目标可以是 tailnet 主机名）。
   该应用程序会将网关端口进行隧道传输，并作为节点进行连接。
3) **在网关上批准该节点**：   ```bash
   clawdbot nodes pending
   clawdbot nodes approve <requestId>
   ```
"文档：[网关协议](/gateway/protocol)，[发现](/gateway/discovery)，[macOS 远程模式](/platforms/mac/remote)。

## 环境变量与 .env 文件加载

### Clawdbot 如何加载环境变量

Clawdbot 从父进程（shell、launchd/systemd、CI 等）中读取环境变量，并额外加载：

- 当前工作目录下的 `.env` 文件
- 全局备用的 `.env` 文件，位于 `~/.clawdbot/.env`（即 `$CLAWDBOT_STATE_DIR/.env`）

这两个 `.env` 文件都不会覆盖已有的环境变量。

你也可以在配置中直接定义环境变量（仅在进程环境变量中不存在时生效）：
json5
{
  env: {
    OPENROUTER_API_KEY: "sk-or-...",
    vars: { GROQ_API_KEY: "gsk-..." }
  }
}
``````
请参阅 [/environment](/environment) 以获取完整的优先级和来源信息。

### 我通过服务启动了 Gateway，但环境变量丢失了，现在该怎么办

两种常见的解决方法：

1) 将丢失的键放入 `~/.clawdbot/.env` 中，这样即使服务没有继承你的 shell 环境变量，也能被正确读取。
2) 启用 shell 导入（需主动选择以获得便利）：```json5
{
  env: {
    shellEnv: {
      enabled: true,
      timeoutMs: 15000
    }
  }
}
```
这将运行你的登录 shell 并仅导入缺失的预期环境变量（从不覆盖）。环境变量对应项：
`CLAWDBOT_LOAD_SHELL_ENV=1`，`CLAWDBOT_SHELL_ENV_TIMEOUT_MS=15000`。

### 我设置了 COPILOTGITHUBTOKEN，但模型状态显示 Shell 环境已关闭，为什么？

`clawdbot models status` 会报告 **shell 环境导入** 是否已启用。显示“Shell env: off”并不意味着你的环境变量缺失，只是表示 Clawdbot 不会自动加载你的登录 shell。

如果 Gateway 作为服务运行（launchd/systemd），它将不会继承你的 shell 环境。可以通过以下方式修复：

1) 将 token 放入 `~/.clawdbot/.env` 中：

   COPILOT_GITHUB_TOKEN=...
```   ```
2) 或启用 shell 导入（`env.shellEnv.enabled: true`）。
3) 或将其添加到你的配置 `env` 块中（仅在缺失时生效）。

然后重启网关并重新检查：```bash
clawdbot models status
```
Copilot 会从 `COPILOT_GITHUB_TOKEN`（也包括 `GH_TOKEN` / `GITHUB_TOKEN`）中读取 token。  
参见 [/concepts/model-providers](/concepts/model-providers) 和 [/environment](/environment)。

## 会话与多轮对话

### 如何开始一轮新的对话

发送 `/new` 或 `/reset` 作为独立消息。参见 [会话管理](/concepts/session)。

### 如果我从未发送新消息，会话会自动重置吗？

是的。如果在 `session.idleMinutes`（默认为 **60**）分钟内没有新消息，会话将过期。下一条消息将为该聊天键启动一个新的会话 ID。这不会删除对话记录 - 只是开始一个新的会话。
json5
{
  session: {
    idleMinutes: 240
  }
}
``````
### 是否可以创建一个由Clawdbots组成的团队，其中有一个CEO和多个代理

是的，可以通过 **多代理路由** 和 **子代理** 实现。你可以创建一个协调代理和多个工作代理，每个代理都有自己的工作空间和模型。

不过，这种情况最好被视为一个 **有趣的实验**。这种方式会消耗较多的token，并且通常比使用一个代理进行多个会话的效率要低。我们通常设想的是一个代理，你可以与它交谈，并为并行任务使用不同的会话。该代理在需要时也可以生成子代理。

文档：[多代理路由](/concepts/multi-agent)，[子代理](/tools/subagents)，[代理CLI](/cli/agents)。

### 为什么任务进行中上下文会被截断？如何防止这种情况

会话上下文受模型窗口限制。长时间的聊天、大工具输出或许多文件可能会触发压缩或截断。

以下方法可能有帮助：
- 让代理总结当前状态并将其写入文件。
- 在进行长时间任务之前使用 `/compact` 命令，在切换主题时使用 `/new`。
- 将重要上下文保存在工作空间中，并让代理重新读取它。
- 对于长时间或并行任务，使用子代理，以保持主聊天窗口较小。
- 如果这种情况经常发生，可以选择一个具有更大上下文窗口的模型。```bash
clawdbot reset
```
非交互式完全重置：
bash
clawdbot reset --scope full --yes --non-interactive
``````
然后重新运行引导流程：```bash
clawdbot onboard --install-daemon
```
注意事项：
- 如果启动向导检测到已有的配置，它还会提供 **重置** 选项。详见 [向导](/start/wizard)。
- 如果你使用了配置文件（`--profile` / `CLAWDBOT_PROFILE`），请为每个状态目录重置（默认路径为 `~/.clawdbot-<profile>`）。
- 开发环境重置：`clawdbot gateway --dev --reset`（仅限开发环境；会清除开发配置、凭证、会话和工作区）。

### 我遇到了“上下文太大”的错误，如何重置或压缩？

使用以下方法之一：

- **压缩**（保留对话内容，但对较早的对话进行摘要）：

  /compact
```  ```
或 `/compact <instructions>` 用于指导摘要。

- **重置**（为相同的聊天密钥生成新的会话ID）：  ```
  /new
  /reset
  ```
如果问题持续发生：
- 启用或调整 **会话裁剪** (`agents.defaults.contextPruning`) 以清理旧的工具输出。
- 使用具有更大上下文窗口的模型。

文档：[压缩](/concepts/compaction)，[会话裁剪](/concepts/session-pruning)，[会话管理](/concepts/session)。

### 为什么我会看到 LLM 请求被拒绝的消息：contentXtooluseinput 字段是必填项

这是一个提供方验证错误：模型生成了一个 `tool_use` 块，但缺少必需的 `input` 字段。这通常意味着会话历史已过时或损坏（通常在长时间对话或工具/模型更改后发生）。

修复方法：使用 `/new`（独立消息）开始一个新的会话。
json5
{
  agents: {
    defaults: {
      heartbeat: {
        every: "2h"   // 或 "0m" 以禁用
      }
    }
  }
}
``````
如果 `HEARTBEAT.md` 存在但实际上为空（只有空行和 Markdown 标题如 `# 标题`），Clawdbot 会跳过心跳运行以节省 API 调用次数。
如果该文件缺失，心跳仍然会运行，由模型决定如何处理。

每个代理的覆盖设置使用 `agents.list[].heartbeat`。文档：[心跳](/gateway/heartbeat)。

### 我需要将机器人账户添加到 WhatsApp 群组中吗？

不需要。Clawdbot 在 **你的个人账户** 上运行，所以如果你在该群组中，Clawdbot 也能看到它。
默认情况下，群组回复会被阻止，直到你允许发送者（`groupPolicy: "allowlist"`）。

如果你想只有 **你自己** 能够触发群组回复：```json5
{
  channels: {
    whatsapp: {
      groupPolicy: "allowlist",
      groupAllowFrom: ["+15551234567"]
    }
  }
}
```
### 如何获取 WhatsApp 群组的 JID

选项 1（最快）：查看日志并在群组中发送测试消息：
bash
clawdbot logs --follow --json
``````
查找以 `@g.us` 结尾的 `chatId`（或 `from`），例如：
`1234567890-1234567890@g.us`。

选项 2（如果已配置/已加入白名单）：从配置中列出群组：```bash
clawdbot directory groups list --channel whatsapp
```
文档：[WhatsApp](/channels/whatsapp)，[目录](/cli/directory)，[日志](/cli/logs)。

### 为什么Clawdbot在群组中不回复

两个常见原因：
- 有人@提醒功能已开启（默认开启）。你必须@提及机器人（或匹配 `mentionPatterns`）。
- 你配置了 `channels.whatsapp.groups` 但没有包含 `"*"`，并且该群组未被允许使用。

参见 [群组](/concepts/groups) 和 [群组消息](/concepts/group-messages)。

### 群组/线程是否与私信（DMs）共享上下文

默认情况下，私信会合并到主会话中。群组/频道有自己独立的会话密钥，Telegram 的主题 / Discord 的线程是独立的会话。参见 [群组](/concepts/groups) 和 [群组消息](/concepts/group-messages)。

### 我可以创建多少个工作区和代理

没有硬性限制。数十个甚至上百个都是可以的，但需要注意以下几点：

- **磁盘增长**：会话和对话记录存储在 `~/.clawdbot/agents/<agentId>/sessions/` 下。
- **令牌成本**：更多的代理意味着更多的模型并发使用。
- **运维开销**：每个代理都需要单独的认证配置、工作区和频道路由。

提示：
- 为每个代理保持一个**活跃**的工作区（`agents.defaults.workspace`）。
- 如果磁盘空间增长，可以清理旧的会话（删除 JSONL 或存储条目）。
- 使用 `clawdbot doctor` 来发现多余的 workspace 和配置不匹配问题。

### 我可以同时运行多个机器人或聊天吗？如何设置 Slack

可以。使用 **多代理路由** 来运行多个独立的代理，并根据频道/账号/联系人路由入站消息。Slack 作为频道支持，并且可以绑定到特定的代理。

浏览器访问功能强大，但不是“能做人类能做的事”——反机器人机制、CAPTCHA 和 MFA 仍可能阻止自动化。为了最可靠的浏览器控制，建议在运行浏览器的机器上使用 Chrome 扩展中继（relay），并让 Gateway 部署在任何地方。

最佳实践设置：
- 始终运行的 Gateway 主机（VPS / Mac mini）。
- 每个代理对应一个角色（绑定）。
- 将 Slack 频道绑定到这些代理。
- 需要时通过扩展中继（或节点）使用本地浏览器。

文档：[多代理路由](/concepts/multi-agent)，[Slack](/channels/slack)，[浏览器](/tools/browser)，[Chrome 扩展](/tools/chrome-extension)，[节点](/nodes)。

## 模型：默认设置、选择、别名、切换

### 什么是默认模型

Clawdbot 的默认模型是你设置的：
yaml
model: "gpt-4o"``````
agents.defaults.model.primary
```
模型以 `provider/model` 的形式引用（例如：`anthropic/claude-opus-4-5`）。如果你省略了提供者，Clawdbot 当前会暂时默认使用 `anthropic` 作为回退方案——但你仍然应该**明确地**设置 `provider/model`。

### 我推荐使用哪个模型？

**推荐的默认模型：** `anthropic/claude-opus-4-5`。  
**一个好的替代模型：** `anthropic/claude-sonnet-4-5`。  
**可靠（字符更少）：** `openai/gpt-5.2` - 几乎和 Opus 一样好，只是个性稍弱。  
**预算型：** `zai/glm-4.7`。

MiniMax M2.1 有自己独立的文档：[MiniMax](/providers/minimax) 和 [本地模型](/gateway/local-models)。

一般建议：对于高风险工作，使用你负担得起的**最佳模型**；对于日常聊天或摘要，使用更便宜的模型。你可以为每个代理设置不同的模型，并使用子代理来并行处理长时间任务（每个子代理都会消耗 tokens）。详见 [模型](/concepts/models) 和 [子代理](/tools/subagents)。

强烈警告：较弱或过度量化（over-quantized）的模型更容易受到提示注入（prompt injection）和不安全行为的影响。详见 [安全](/gateway/security)。

更多背景信息：[模型](/concepts/models)。

### 我可以使用自托管的模型（llamacpp、vLLM、Ollama）吗？

可以。如果你的本地服务器提供了 OpenAI 兼容的 API，你可以将其指向一个自定义提供者。Ollama 直接被支持，是使用起来最简单的路径。

安全提示：较小的或经过重度量化（heavily quantized）的模型更容易受到提示注入攻击。我们强烈建议**大型模型**用于任何可以使用工具的机器人。如果你仍然想使用小型模型，请启用沙箱模式和严格的工具允许列表。

文档：[Ollama](/providers/ollama)、[本地模型](/gateway/local-models)、[模型提供者](/concepts/model-providers)、[安全](/gateway/security)、[沙箱](/gateway/sandboxing)。

### 如何在不重置配置的情况下切换模型？

使用**模型命令**，或仅编辑**模型**字段。避免完全替换整个配置。

安全选项包括：
- 在聊天中使用 `/model`（快速，会话级）
- 使用 `clawdbot models set ...`（仅更新模型配置）
- 使用 `clawdbot configure --section models`（交互式操作）
- 编辑 `~/.clawdbot/clawdbot.json` 中的 `agents.defaults.model`

避免使用 `config.apply` 传入部分对象，除非你打算完全替换整个配置。如果你不小心覆盖了配置，请从备份恢复或重新运行 `clawdbot doctor` 来修复。

文档：[模型](/concepts/models)、[配置](/cli/configure)、[配置](/cli/config)、[修复](/gateway/doctor)。

### Clawd、Flawd 和 Krill 使用什么模型？

- **Clawd + Flawd:** 使用 Anthropic Opus (`anthropic/claude-opus-4-5`) - 详见 [Anthropic](/providers/anthropic)。
- **Krill:** 使用 MiniMax M2.1 (`minimax/MiniMax-M2.1`) - 详见 [MiniMax](/providers/minimax)。```
你可以使用 `/model`、`/model list` 或 `/model status` 列出可用的模型。

`/model`（以及 `/model list`）会显示一个简洁的编号选择器。通过编号进行选择：```
/model 3
```
你也可以为提供者（每个会话）强制指定特定的认证配置文件：

/model opus@anthropic:claude-cli  
/model opus@anthropic:default  
``````
提示：`/model status` 显示当前激活的代理、正在使用的 `auth-profiles.json` 文件，以及下一个将尝试的认证配置文件。
当可用时，它还会显示配置的提供者端点（`baseUrl`）和 API 模式（`api`）。

**如何取消固定我之前设置的配置文件**

重新运行 `/model` **不要加上** `@profile` 后缀：```
/model anthropic/claude-opus-4-5
```
如果想要恢复默认模型，请从 `/model` 中选择（或发送 `/model <默认提供者/模型>`）。
使用 `/model status` 来确认当前激活的认证配置文件。

### 我可以日常使用 GPT 5.2，编码时使用 Codex 5.2 吗？

可以。你可以将其中一个设置为默认，需要时再切换：

- **快速切换（每次会话）：** 发送 `/model gpt-5.2` 用于日常任务，发送 `/model gpt-5.2-codex` 用于编码。
- **默认 + 切换：** 将 `agents.defaults.model.primary` 设置为 `openai-codex/gpt-5.2`，然后在编码时切换为 `openai-codex/gpt-5.2-codex`（或反过来）。
- **子代理：** 将编码任务路由到使用不同默认模型的子代理。

详见 [Models](/concepts/models) 和 [Slash 命令](/tools/slash-commands)。
"provider/model" 模型不允许使用。请使用 `/model` 列出可用模型。```
返回此错误 **而非正常回复**。修复方法：将模型添加到 `agents.defaults.models`，移除允许列表，或从 `/model list` 中选择一个模型。

### 为什么我会看到 Unknown model minimaxMiniMaxM21

这意味着 **提供者未正确配置**（未找到 MiniMax 提供者配置或认证配置文件），因此无法解析该模型。此问题的修复将在 **2026.1.12** 版本中推出（撰写时尚未发布）。

修复步骤清单：
1) 升级到 **2026.1.12**（或从源码 `main` 分支运行），然后重启网关。
2) 确保已配置 MiniMax（通过向导或 JSON 文件），或者确保在环境/认证配置文件中存在 MiniMax 的 API 密钥，以便提供者能够被注入。
3) 使用精确的模型 ID（区分大小写）：`minimax/MiniMax-M2.1` 或 `minimax/MiniMax-M2.1-lightning`。
4) 运行：   ```bash
   clawdbot models list
   ```
并从列表中选择（或在聊天中使用 `/model list`）。

查看 [MiniMax](/providers/minimax) 和 [模型](/concepts/models)。

### 我可以将 MiniMax 设置为默认模型，并在复杂任务中使用 OpenAI 吗？

可以。将 **MiniMax 设置为默认模型**，并在需要时 **按会话切换模型**。
回退机制用于处理 **错误**，而不是“复杂任务”，因此请使用 `/model` 或单独的代理进行切换。
json5
{
  env: { MINIMAX_API_KEY: "sk-...", OPENAI_API_KEY: "sk-..." },
  agents: {
    defaults: {
      model: { primary: "minimax/MiniMax-M2.1" },
      models: {
        "minimax/MiniMax-M2.1": { alias: "minimax" },
        "openai/gpt-5.2": { alias: "gpt" }
      }
    }
  }
}
``````
然后：```
/model gpt
```
**选项 B：独立代理**
- 代理 A 默认：MiniMax
- 代理 B 默认：OpenAI
- 按代理路由或使用 `/agent` 切换

文档：[模型](/concepts/models), [多代理路由](/concepts/multi-agent), [MiniMax](/providers/minimax), [OpenAI](/providers/openai)。

### opus、sonnet、gpt 是内置的快捷方式吗？

是的。Clawdbot 预装了一些默认的快捷方式（仅在模型存在于 `agents.defaults.models` 中时生效）：

- `opus` → `anthropic/claude-opus-4-5`
- `sonnet` → `anthropic/claude-sonnet-4-5`
- `gpt` → `openai/gpt-5.2`
- `gpt-mini` → `openai/gpt-5-mini`
- `gemini` → `google/gemini-3-pro-preview`
- `gemini-flash` → `google/gemini-3-flash-preview`

如果你设置了相同名称的自定义别名，你的设置将优先生效。

### 如何定义/覆盖模型快捷方式别名？

别名来源于 `agents.defaults.models.<modelId>.alias`。例如：
json5
{
  agents: {
    defaults: {
      model: { primary: "anthropic/claude-opus-4-5" },
      models: {
        "anthropic/claude-opus-4-5": { alias: "opus" },
        "anthropic/claude-sonnet-4-5": { alias: "sonnet" },
        "anthropic/claude-haiku-4-5": { alias: "haiku" }
      }
    }
  }
}
``````
然后 `/model sonnet`（或在支持时使用 `/<alias>`）将解析为该模型ID。

### 如何添加来自其他提供者（如OpenRouter或ZAI）的模型
OpenRouter（按token计费；包含多个模型）：```json5
{
  agents: {
    defaults: {
      model: { primary: "openrouter/anthropic/claude-sonnet-4-5" },
      models: { "openrouter/anthropic/claude-sonnet-4-5": {} }
    }
  },
  env: { OPENROUTER_API_KEY: "sk-or-..." }
}
```
Z.AI（GLM 模型）：
json5
{
  agents: {
    defaults: {
      model: { primary: "zai/glm-4.7" },
      models: { "zai/glm-4.7": {} }
    }
  },
  env: { ZAI_API_KEY: "..." }
}
``````
如果你引用了一个提供者/模型，但缺少所需的提供者密钥，你会在运行时收到认证错误（例如：`No API key found for provider "zai"`）。

**在添加新代理后找不到提供者 API 密钥**

这通常意味着 **新代理** 的认证信息存储为空。认证信息是按代理存储的，存储路径为：```
~/.clawdbot/agents/<agentId>/agent/auth-profiles.json
```
修复选项：
- 运行 `clawdbot agents add <id>` 并在向导中配置认证信息。
- 或者将主代理的 `agentDir` 中的 `auth-profiles.json` 文件复制到新代理的 `agentDir` 中。

请 **不要** 在多个代理之间重复使用 `agentDir`；这会导致认证/会话冲突。

## 模型故障转移与“所有模型均失败”

### 故障转移是如何工作的

故障转移分为两个阶段：

1) **同一提供者内的认证配置轮换**。
2) **模型回退**到 `agents.defaults.model.fallbacks` 中的下一个模型。

对于失败的认证配置会应用冷却时间（指数退避机制），因此即使某个提供者被限流或暂时失败，Clawdbot 仍可以继续响应。 

### 这个错误意味着什么
No credentials found for profile "anthropic:default"```
这意味着系统尝试使用身份验证配置文件 ID `anthropic:default`，但在预期的身份验证存储中找不到相应的凭据。

### 未找到 anthropicdefault 配置文件凭据的修复检查清单

- **确认身份验证配置文件所在的位置**（新路径与旧路径）
  - 当前路径：`~/.clawdbot/agents/<agentId>/agent/auth-profiles.json`
  - 旧路径：`~/.clawdbot/agent/*`（由 `clawdbot doctor` 迁移）
- **确认你的环境变量已被网关加载**
  - 如果你在 shell 中设置了 `ANTHROPIC_API_KEY`，但通过 systemd/launchd 运行网关，它可能不会继承该变量。请将其放入 `~/.clawdbot/.env` 或启用 `env.shellEnv`。
- **确保你编辑的是正确的代理**
  - 多代理设置意味着可能会有多个 `auth-profiles.json` 文件。
- **检查模型/身份验证状态**
  - 使用 `clawdbot models status` 查看已配置的模型以及提供者是否已通过身份验证。

### 未找到 anthropic claude cli 配置文件凭据的修复检查清单

这意味着该运行被固定使用 **Claude Code CLI** 配置文件，但网关在它的身份验证存储中找不到该配置文件。

- **在网关主机上同步 Claude Code CLI 的令牌**
  - 运行 `clawdbot models status`（它会加载并同步 Claude Code CLI 的凭据）。
  - 如果仍然提示缺失：运行 `claude setup-token`（或 `clawdbot models auth setup-token --provider anthropic`）并重试。
- **如果令牌是在其他机器上创建的**
  - 使用 `clawdbot models auth paste-token --provider anthropic` 将其粘贴到网关主机上。
- **检查配置文件模式**
  - `auth.profiles["anthropic:claude-cli"].mode` 必须为 `"oauth"`（令牌模式会拒绝 OAuth 凭据）。
- **如果你想使用 API 密钥代替**
  - 在 **网关主机** 上的 `~/.clawdbot/.env` 中放入 `ANTHROPIC_API_KEY`。
  - 清除任何强制使用 `anthropic:claude-cli` 的固定订单配置：    ```bash
    clawdbot models auth order clear --provider anthropic
    ```
- **确认你在网关主机上运行命令**
  - 在远程模式下，认证配置文件位于网关机器上，而不是你的笔记本电脑上。

### 为什么也尝试了 Google Gemini 但失败了

如果你的模型配置中包含了 Google Gemini 作为备用模型（或者你切换到了 Gemini 的快捷方式），Clawdbot 在模型回退时会尝试使用它。如果你没有配置 Google 的凭证，你会看到 `No API key found for provider "google"`。

解决方法：要么提供 Google 的认证信息，要么在 `agents.defaults.model.fallbacks` / 别名中移除/避免使用 Google 模型，以防止回退到那里。

**LLM 请求被拒绝的消息：思考签名需要 Google Antigravity**

原因：会话历史中包含 **没有签名的思考块**（通常来自中断/部分流式响应）。Google Antigravity 要求思考块必须带有签名。

解决方法：现在 Clawdbot 会移除没有签名的思考块以适配 Google Antigravity Claude。如果问题仍然存在，请启动一个 **新会话**，或为该代理设置 `/thinking off`。```
### 什么是典型的配置文件 ID

Clawdbot 使用带有提供者前缀的 ID，例如：

- `anthropic:default`（当没有电子邮件身份时常见）
- `anthropic:<email>`（用于 OAuth 身份）
- 你自己选择的自定义 ID（例如 `anthropic:work`）

### 我可以控制哪个认证配置文件优先尝试吗？

可以。配置支持为每个配置文件添加可选的元数据，并为每个提供者设置尝试顺序（`auth.order.<provider>`）。这**不会**存储密钥；它将 ID 映射到提供者/模式，并设置轮换顺序。

如果某个配置文件处于短期的**冷却状态**（速率限制/超时/认证失败）或更长的**禁用状态**（账单问题/信用不足），Clawdbot 可能会暂时跳过该配置文件。要检查这些状态，请运行 `clawdbot models status --json` 并查看 `auth.unusableProfiles`。调整参数：`auth.cooldowns.billingBackoffHours*`。

你也可以通过 CLI 为**每个代理**设置尝试顺序的覆盖（存储在该代理的 `auth-profiles.json` 中）：```bash
# Defaults to the configured default agent (omit --agent)
clawdbot models auth order get --provider anthropic

# Lock rotation to a single profile (only try this one)
clawdbot models auth order set --provider anthropic anthropic:claude-cli

# Or set an explicit order (fallback within provider)
clawdbot models auth order set --provider anthropic anthropic:claude-cli anthropic:default

# Clear override (fall back to config auth.order / round-robin)
clawdbot models auth order clear --provider anthropic
```
要针对特定代理：
bash
clawdbot models auth order set --provider anthropic --agent main anthropic:claude-cli
``````
### OAuth 与 API 密钥的区别

Clawdbot 支持以下两种方式：

- **OAuth** 通常会使用订阅访问（在适用的情况下）。
- **API 密钥** 使用按令牌计费的方式。

向导明确支持 Anthropic 的 OAuth 和 OpenAI Codex 的 OAuth，并可以为您存储 API 密钥。

## 网关：端口、“已运行”以及远程模式

### 网关使用哪个端口

`gateway.port` 控制用于 WebSocket + HTTP 的单一多路复用端口（控制 UI、钩子等）。

优先级：```
--port > CLAWDBOT_GATEWAY_PORT > gateway.port > default 18789
```
### 为什么 clawdbot 网关状态显示 Runtime 运行但 RPC 探针失败？

因为“运行”是 **supervisor（启动守护进程）** 的视角（launchd/systemd/schtasks）。RPC 探针是 CLI 实际连接到网关 WebSocket 并调用 `status` 的过程。

使用 `clawdbot gateway status` 并信任以下几行：
- `Probe target:`（探针实际使用的 URL）
- `Listening:`（实际绑定在端口上的内容）
- `Last gateway error:`（当进程正在运行但端口未监听时的常见原因）

### 为什么 clawdbot 网关状态显示 Config cli 和 Config service 不同？

你正在编辑一个配置文件，而服务运行的是另一个配置（通常是 `--profile` / `CLAWDBOT_STATE_DIR` 不匹配导致的）。

修复方法：
bash
clawdbot gateway install --force
``````
从你希望服务使用的相同 `--profile` / 环境中运行它。

### “另一个网关实例已经在监听”是什么意思

Clawdbot 在启动时会立即绑定 WebSocket 监听器以实施运行时锁定（默认为 `ws://127.0.0.1:18789`）。如果绑定失败并出现 `EADDRINUSE` 错误，它会抛出 `GatewayLockError`，表示另一个实例已经在监听。

解决方法：停止另一个实例，释放端口，或者使用 `clawdbot gateway --port <port>` 运行。

### 如何在远程模式下运行 Clawdbot，客户端连接到其他地方的网关

设置 `gateway.mode: "remote"`，并指向一个远程的 WebSocket URL，可选地加上令牌/密码：```json5
{
  gateway: {
    mode: "remote",
    remote: {
      url: "ws://gateway.tailnet:18789",
      token: "your-token",
      password: "your-password"
    }
  }
}
```
### 注意事项：
- `clawdbot gateway` 仅在 `gateway.mode` 设置为 `local` 时启动（或你传递了覆盖标志）。
- macOS 应用会实时监控配置文件，并在这些值发生变化时切换模式。

### 控制 UI 显示“未授权”或不断重连怎么办

你的网关正在使用认证功能（`gateway.auth.*`），但控制 UI 没有发送对应的令牌/密码。

事实（来自代码）：
- 控制 UI 会将令牌存储在浏览器的 localStorage 中，键为 `clawdbot.control.settings.v1`。
- UI 只能一次性导入 `?token=...`（和/或 `?password=...`），然后会从 URL 中移除该参数。

解决方法：
- 最快的方式：运行 `clawdbot dashboard`（会输出并复制带令牌的链接，尝试打开；如果无头模式会显示 SSH 提示）。
- 如果你还没有令牌：运行 `clawdbot doctor --generate-gateway-token`。
- 如果是远程连接：先建立隧道：`ssh -N -L 18789:127.0.0.1:18789 user@host`，然后打开 `http://127.0.0.1:18789/?token=...`。
- 在网关主机上设置 `gateway.auth.token`（或 `CLAWDBOT_GATEWAY_TOKEN`）。
- 在控制 UI 设置中粘贴相同的令牌（或使用一次性 `?token=...` 链接刷新）。
- 如果仍然无法解决？运行 `clawdbot status --all` 并按照 [故障排查](/gateway/troubleshooting) 进行操作。查看 [仪表盘](/web/dashboard) 获取认证详细信息。

### 我设置了 gatewaybind tailnet，但无法绑定，没有服务监听

`tailnet` 绑定会从你的网络接口中选择一个 Tailscale IP（100.64.0.0/10）。如果该机器没有连接到 Tailscale（或接口处于关闭状态），就没有可用的 IP 可以绑定。

解决方法：
- 在该主机上启动 Tailscale（这样它会获得一个 100.x 地址），或者
- 改为使用 `gateway.bind: "loopback"` / `"lan"`。

注意：`tailnet` 是显式绑定。`auto` 会优先选择 loopback；当你希望仅绑定到 tailnet 时，请使用 `gateway.bind: "tailnet"`。

### 我可以在同一台主机上运行多个网关吗？

通常不可以——一个网关可以运行多个消息通道和代理。只有在需要冗余（例如：救援机器人）或硬隔离时才需要使用多个网关。

可以，但你必须进行隔离：

- `CLAWDBOT_CONFIG_PATH`（每个实例的配置）
- `CLAWDBOT_STATE_DIR`（每个实例的状态）
- `agents.defaults.workspace`（工作区隔离）
- `gateway.port`（唯一端口）

快速设置（推荐）：
- 为每个实例使用 `clawdbot --profile <name> …`（会自动创建 `~/.clawdbot-<name>`）。
- 在每个配置文件中设置唯一的 `gateway.port`（或手动运行时使用 `--port`）。
- 为每个实例安装服务：`clawdbot --profile <name> gateway install`。

配置文件还会在服务名称后添加后缀（`com.clawdbot.<profile>`，`clawdbot-gateway-<profile>.service`，`Clawdbot Gateway (<profile>)`）。
完整指南：[多个网关](/gateway/multiple-gateways)。

### “无效的握手代码 1008” 是什么意思

网关是一个 **WebSocket 服务器**，它期望接收到的第一个消息必须是一个 `connect` 帧。如果它接收到其他内容，就会以 **代码 1008（策略违规）** 关闭连接。

常见原因：
- 你在浏览器中打开了 **HTTP** URL（`http://...`），而不是 WebSocket 客户端。
- 使用了错误的端口或路径。
- 代理或隧道移除了认证头，或发送了非网关请求。

快速解决方法：
1) 使用 WebSocket URL：`ws://<host>:18789`（如果使用 HTTPS，则为 `wss://...`）。
2) 不要在普通浏览器标签中打开 WebSocket 端口。
3) 如果启用了认证，请在 `connect` 帧中包含令牌/密码。

如果你使用的是 CLI 或 TUI，URL 应该如下所示：

clawdbot tui --url ws://<host>:18789 --token <token>
``````
协议详情：[网关协议](/gateway/protocol)。

## 日志和调试

### 日志位置

文件日志（结构化）：```
/tmp/clawdbot/clawdbot-YYYY-MM-DD.log
```
你可以通过 `logging.file` 设置一个稳定的日志路径。文件日志级别由 `logging.level` 控制。控制台的详细程度由 `--verbose` 和 `logging.consoleLevel` 控制。

最快的日志尾随方式：
bash
clawdbot logs --follow
``````
服务/监督日志（当网关通过 launchd/systemd 运行时）：
- macOS: `$CLAWDBOT_STATE_DIR/logs/gateway.log` 和 `gateway.err.log`（默认路径：`~/.clawdbot/logs/...`；配置文件使用 `~/.clawdbot-<profile>/logs/...`）
- Linux: `journalctl --user -u clawdbot-gateway[-<profile>].service -n 200 --no-pager`
- Windows: `schtasks /Query /TN "Clawdbot Gateway (<profile>)" /V /FO LIST`

更多详情请参见 [故障排除](/gateway/troubleshooting#log-locations)。

### 如何启动、停止或重启网关服务

使用网关的辅助工具：```bash
clawdbot gateway status
clawdbot gateway restart
```
如果手动运行网关，`clawdbot gateway --force` 可以释放端口。参见 [网关](/gateway)。

### 我在 Windows 上关闭了终端，如何重新启动 Clawdbot

有两种 **Windows 安装模式**：

**1) WSL2（推荐）：** 网关在 Linux 内运行。

打开 PowerShell，进入 WSL，然后重新启动：
powershell
wsl
clawdbot gateway status
clawdbot gateway restart
``````
如果您从未安装过该服务，请在前台启动它：```bash
clawdbot gateway run
```
**2) 原生 Windows（不推荐）：** 网关直接在 Windows 中运行。

打开 PowerShell 并运行：
powershell
clawdbot gateway status
clawdbot gateway restart
``````
如果你手动运行它（不作为服务运行），请使用：```powershell
clawdbot gateway run
```
文档：[Windows (WSL2)](/platforms/windows)，[网关服务运行手册](/gateway)。

### 网关已启动但未收到响应 应该检查什么

首先进行一次快速健康检查：
bash
clawdbot status
clawdbot models status
clawdbot channels status
clawdbot logs --follow
``````
常见原因：
- 在 **网关主机** 上未加载模型（检查 `models status`）。
- 通道配对/允许列表阻止了回复（检查通道配置 + 日志）。
- WebChat/Dashboard 在没有正确令牌的情况下打开。

如果你是远程连接，请确认隧道/Tailscale 连接是否正常，并且网关的 WebSocket 是否可达。

文档：[通道](/channels)，[故障排除](/gateway/troubleshooting)，[远程访问](/gateway/remote)。

### 与网关断开连接，但没有提示原因

这通常意味着 UI 丢失了 WebSocket 连接。请检查以下内容：

1) 网关是否正在运行？ `clawdbot gateway status`
2) 网关是否健康？ `clawdbot status`
3) UI 是否具有正确的令牌？ `clawdbot dashboard`
4) 如果是远程连接，隧道/Tailscale 是否已连接？

然后查看日志：```bash
clawdbot logs --follow
```
文档：[仪表板](/web/dashboard)，[远程访问](/gateway/remote)，[故障排除](/gateway/troubleshooting)。

### 在使用 setMyCommands 时出现网络错误，应该检查什么

首先查看日志和频道状态：
bash
clawdbot channels status
clawdbot channels logs --channel telegram
``````
如果您在 VPS 或者代理后面，请确认允许出站 HTTPS 并且 DNS 正常工作。
如果网关是远程的，请确保您在网关主机上查看日志。

文档：[Telegram](/channels/telegram)，[频道故障排除](/channels/troubleshooting)。

### TUI 没有输出怎么办？应该检查什么

首先确认网关是否可达，并且代理可以正常运行：```bash
clawdbot status
clawdbot models status
clawdbot logs --follow
```
在 TUI 中，使用 `/status` 查看当前状态。如果你期望在聊天频道中收到回复，请确保已启用消息传递 (`/deliver on`)。

文档：[TUI](/tui)，[斜杠命令](/tools/slash-commands)。

### 如何完全停止然后启动网关

如果你已安装该服务：
bash
clawdbot gateway stop
clawdbot gateway start```
这将停止/启动 **受监督的服务**（在 macOS 上为 launchd，在 Linux 上为 systemd）。
当网关以后台守护进程形式运行时，请使用此命令。

如果您以前台模式运行，请使用 Ctrl-C 停止，然后执行以下操作：```bash
clawdbot gateway run
```
文档：[网关服务运行手册](/gateway)。

### ELI5 clawdbot 网关重启 与 clawdbot 网关 的区别

- `clawdbot gateway restart`：重启 **后台服务**（launchd/systemd）。
- `clawdbot gateway`：在当前终端会话中 **前台运行** 网关。

如果你已经安装了服务，请使用 `clawdbot gateway` 命令。当你需要一次性的前台运行时，请使用 `clawdbot gateway`。

### 当某件事情失败时，最快获取更多细节的方式是什么？

使用 `--verbose` 参数启动网关以获取更多控制台信息。然后检查日志文件，查看通道认证、模型路由和 RPC 错误的相关信息。

## 媒体与附件

### 我的技能生成了图片/PDF，但什么都没发送

代理发出的附件必须包含一行 `MEDIA:<路径或URL>`（单独一行）。参见 [Clawdbot 助手设置](/start/clawd) 和 [代理发送](/tools/agent-send)。

命令行发送：
bash
clawdbot message send --target +15555550123 --message "Here you go" --media /path/to/file.png
``````
另外请检查：
- 目标频道支持出站媒体，并且未被允许列表阻止。
- 文件在提供方的大小限制内（图片最大调整为2048像素）。

查看 [Images](/nodes/images)。

## 安全与访问控制

### 暴露 Clawdbot 给入站私信（DMs）是否安全？

将入站私信视为不受信任的输入。默认设置旨在降低风险：

- 在支持 DM 的频道上，默认行为是 **配对（pairing）**：
  - 未知发送者会收到一个配对码；机器人不会处理他们的消息。
  - 批准配对请使用：`clawdbot pairing approve <channel> <code>`
  - 每个频道的待处理请求最多为 **3 条**；如果未收到码，请检查 `clawdbot pairing list <channel>`。

- 如果要公开开放 DM，请明确选择加入（`dmPolicy: "open"` 和允许列表 `"*"`）。

运行 `clawdbot doctor` 以发现有风险的 DM 策略。

### 提示注入（prompt injection）是否只对公开的机器人有影响？

不是。提示注入关注的是 **不受信任的内容**，而不仅仅是谁能向机器人发送私信。
如果你的助手读取了外部内容（如网络搜索/获取、网页内容、邮件、文档、附件、粘贴的日志），这些内容可能包含试图劫持模型的指令。即使 **你本人是唯一的发送者**，这种情况也有可能发生。

最大的风险出现在启用了工具时：模型可能被欺骗，泄露上下文或代表你调用工具。为了减少影响范围，可以：
- 使用只读或禁用工具的“阅读器”代理来总结不受信任的内容
- 对于启用了工具的代理，关闭 `web_search` / `web_fetch` / `browser`
- 对工具进行沙箱隔离和严格允许列表控制

详情：[Security](/gateway/security)。

### 我的机器人是否应该拥有自己的 GitHub 邮箱账号或手机号？

是的，对于大多数设置来说都是如此。通过使用独立的账号和手机号来隔离机器人，可以降低出现问题时的影响范围。这也便于在需要时轮换凭证或撤销访问权限，而不会影响到你的个人账号。

从小处开始。仅给予机器人你实际需要的工具和账号权限，如有需要再逐步扩展。

文档：[Security](/gateway/security)、[Pairing](/start/pairing)。

### 我可以让机器人自主处理我的短信吗？这样安全吗？

我们 **不推荐** 让机器人拥有对个人短信的完全自主权。最安全的做法是：
- 将 DM 保持在 **配对模式** 或严格允许列表中。
- 如果你希望它代表你发送消息，请使用 **单独的号码或账号**。
- 让它起草内容，然后在发送前进行 **人工审批**。

如果你想进行实验，请在专用账号上进行，并保持隔离。查看 [Security](/gateway/security)。

### 我可以使用更便宜的模型来执行个人助手任务吗？

可以，**如果** 该代理仅用于聊天且输入是可信的。较小的模型层级更容易受到指令劫持的影响，因此不建议用于启用了工具的代理或读取不可信内容的场景。如果必须使用较小的模型，请严格限制工具并运行在沙箱环境中。查看 [Security](/gateway/security)。

当未知发件人向机器人发送消息且启用 `dmPolicy: "pairing"` 时，才会发送配对代码。单独的 `/start` 命令不会生成代码。

检查待处理的请求：```bash
clawdbot pairing list telegram
```
如果你想要立即访问，请将你的发件人ID加入白名单或为该账户设置 `dmPolicy: "open"`。

### WhatsApp 会向我的联系人发送消息吗？配对是如何工作的？

不会。默认的 WhatsApp DM 策略是 **配对**。未知发件人只会收到一个配对码，他们的消息 **不会被处理**。Clawdbot 仅回复它接收到的聊天或你手动触发的发送。

批准配对的方式如下：
bash
clawdbot pairing approve whatsapp <code>
``````
列出待处理的请求：```bash
clawdbot pairing list whatsapp
```
**Wizard 电话号码提示**：用于设置你的 **允许列表/所有者**，以便允许你的私人消息。它不用于自动发送。如果你使用个人 WhatsApp 电话号码，请使用该号码并启用 `channels.whatsapp.selfChatMode`。

## 聊天命令、中止任务以及“它不会停止”

### 如何停止内部系统消息在聊天中显示

大多数内部或工具消息只有在该会话中启用了 **verbose** 或 **reasoning** 时才会出现。

在你看到这些消息的聊天中进行修复：

/verbose off  
/reasoning off  
``````
如果仍然存在噪音，请在 Control UI 中检查会话设置，并将 verbose 设置为 **inherit**。同时确认您没有使用一个在配置中将 `verboseDefault` 设置为 `on` 的机器人配置文件。

文档：[思考与详细输出](/tools/thinking)，[安全](/gateway/security#groups-中的推理--详细输出)。

### 如何停止/取消正在运行的任务

发送以下任意一条 **独立消息**（不带斜杠）：```
stop
abort
esc
wait
exit
interrupt
```
这些是中止触发器（不是斜杠命令）。

对于后台进程（来自 exec 工具），你可以让代理运行：

process action: kill sessionId: XXX
``````
斜杠命令概述：参见 [斜杠命令](/tools/slash-commands)。

大多数命令必须作为以 `/` 开头的**独立**消息发送，但一些快捷方式（如 `/status`）也允许被授权的发送者在消息中直接使用。

### 如何从 Telegram 发送 Discord 消息（跨上下文消息被拒绝）

Clawdbot 默认会阻止**跨平台**的消息发送。如果一个工具调用绑定到了 Telegram，它将不会向 Discord 发送消息，除非你明确允许。

为代理启用跨平台消息发送：```json5
{
  agents: {
    defaults: {
      tools: {
        message: {
          crossContext: {
            allowAcrossProviders: true,
            marker: { enabled: true, prefix: "[from {channel}] " }
          }
        }
      }
    }
  }
}
```
在编辑配置后重启网关。如果你只希望对单个代理生效，请在 `agents.list[].tools.message` 下设置。

### 为什么感觉机器人忽略了快速消息？

队列模式控制新消息与正在进行的运行之间的交互。使用 `/queue` 来更改模式：

- `steer` - 新消息将重新引导当前任务
- `followup` - 逐条运行消息
- `collect` - 批量处理消息并一次性回复（默认）
- `steer-backlog` - 立即重新引导，然后处理积压消息
- `interrupt` - 中断当前运行并重新开始

你可以为 followup 模式添加选项，例如 `debounce:2s cap:25 drop:summarize`。

## 根据截图/聊天记录回答具体问题

**Q: “使用 API 密钥时，Anthropic 的默认模型是什么？”**

**A:** 在 Clawdbot 中，凭证和模型选择是分开的。设置 `ANTHROPIC_API_KEY`（或在认证配置文件中存储 Anthropic API 密钥）仅用于认证，而实际的默认模型是你在 `agents.defaults.model.primary` 中配置的（例如 `anthropic/claude-sonnet-4-5` 或 `anthropic/claude-opus-4-5`）。如果你看到 `No credentials found for profile "anthropic:default"`，这意味着网关在预期的 `auth-profiles.json` 中找不到正在运行的代理所需的 Anthropic 凭证。

---

还在卡住？在 [Discord](https://discord.com/invite/clawd) 上提问，或者打开 [GitHub 讨论](https://github.com/clawdbot/clawdbot/discussions)。