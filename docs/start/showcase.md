---
title: "Showcase"
description: "Real-world Clawdbot projects from the community"
summary: "Community-built projects and integrations powered by Clawdbot"
---

# 展示区

社区中的真实项目。看看人们是如何用Clawdbot构建的。

<Info>
**想被展示？** 在 [#showcase 专区的 Discord](https://discord.gg/clawd) 分享你的项目，或者在 [X 上标记 @clawdbot](https://x.com/clawdbot)。
</Info>

## 🎥 Clawdbot 实际使用演示

由 VelvetShark 演示的完整设置流程（28 分钟）。

<div
  style={{
    position: "relative",
    paddingBottom: "56.25%",
    height: 0,
    overflow: "hidden",
    borderRadius: 16,
  }}
>
  <iframe
    src="https://www.youtube-nocookie.com/embed/SaWSPZoPX34"
    title="Clawdbot: 一个本应像Siri一样的自托管AI（完整设置）"
    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
    frameBorder="0"
    loading="lazy"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowFullScreen
  />
</div>

[在 YouTube 上观看](https://www.youtube.com/watch?v=SaWSPZoPX34)

<div
  style={{
    position: "relative",
    paddingBottom: "56.25%",
    height: 0,
    overflow: "hidden",
    borderRadius: 16,
  }}
>
  <iframe
    src="https://www.youtube-nocookie.com/embed/mMSKQvlmFuQ"
    title="Clawdbot 展示视频"
    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
    frameBorder="0"
    loading="lazy"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowFullScreen
  />
</div>

[在 YouTube 上观看](https://www.youtube.com/watch?v=mMSKQvlmFuQ)

<div
  style={{
    position: "relative",
    paddingBottom: "56.25%",
    height: 0,
    overflow: "hidden",
    borderRadius: 16,
  }}
>
  <iframe
    src="https://www.youtube-nocookie.com/embed/5kkIJNUGFho"
    title="Clawdbot 社区展示"
    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
    frameBorder="0"
    loading="lazy"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowFullScreen
  />
</div>

[在 YouTube 上观看](https://www.youtube.com/watch?v=5kkIJNUGFho)

## 🆕 最新社区动态

<CardGroup cols={2}>

<Card title="PR 评审 → 通过 Telegram 反馈" icon="code-pull-request" href="https://x.com/i/status/2010878524543131691">
  **@bangnokia** • `review` `github` `telegram`

  OpenCode 完成更改 → 提交 PR → Clawdbot 评审差异，并通过 Telegram 回复“小建议”以及清晰的合并判断（包括需要先应用的关键修复）。

  <img src="/assets/showcase/pr-review-telegram.jpg" alt="Clawdbot 通过 Telegram 提供 PR 评审反馈" />
</Card>

<Card title="几分钟内创建葡萄酒酒窖技能" icon="wine-glass" href="https://x.com/i/status/2010916352454791216">
  **@prades_maxime** • `skills` `local` `csv`

  向“Robby”（@clawdbot）请求一个本地葡萄酒酒窖技能。它要求一个示例 CSV 导出文件 + 存储位置，然后快速构建和测试该技能（示例中有 962 瓶葡萄酒）。

  <img src="/assets/showcase/wine-cellar-skill.jpg" alt="Clawdbot 从 CSV 构建本地酒窖技能" />
</Card>

<Card title="Tesco 商店自动驾驶" icon="cart-shopping" href="https://x.com/i/status/2009724862470689131">
  **@marchattonhere** • `自动化` `浏览器` `购物`

  每周饮食计划 → 常客 → 预订送货时段 → 确认订单。无需 API，仅通过浏览器控制。

  <img src="/assets/showcase/tesco-shop.jpg" alt="通过聊天进行 Tesco 购物自动化" />
</Card>

<Card title="SNAG 屏幕截图转 Markdown" icon="scissors" href="https://github.com/am-will/snag">
  **@am-will** • `开发工具` `截图` `Markdown`

  快捷键选择屏幕区域 → Gemini 视觉 → 即时 Markdown 内容复制到剪贴板。

  <img src="/assets/showcase/snag.png" alt="SNAG 屏幕截图转 Markdown 工具" />
</Card>

<Card title="Agents UI" icon="window-maximize" href="https://releaseflow.net/kitze/agents-ui">
  **@kitze** • `UI` `技能` `同步`

  桌面应用程序，用于在 Agents、Claude、Codex 和 Clawdbot 之间管理技能/命令。

  <img src="/assets/showcase/agents-ui.jpg" alt="Agents UI 应用程序" />
</Card>

<Card title="Telegram 语音备忘录（papla.media）" icon="microphone" href="https://papla.media/docs">
  **社区** • `语音` `TTS` `Telegram`

  将 papla.media 的 TTS 打包并以 Telegram 语音备忘录的形式发送结果（无烦人的自动播放）。

  <img src="/assets/showcase/papla-tts.jpg" alt="TTS 生成的 Telegram 语音备忘录" />
</Card>

<Card title="CodexMonitor" icon="eye" href="https://clawdhub.com/odrobnik/codexmonitor">
  **@odrobnik** • `开发工具` `codex` `brew`

  通过 Homebrew 安装的辅助工具，用于列出、检查和监控本地 OpenAI Codex 会话（CLI + VS Code）。

  <img src="/assets/showcase/codexmonitor.png" alt="CodexMonitor 在 ClawdHub 上" />
</Card>

<Card title="Bambu 3D 打印机控制" icon="print" href="https://clawdhub.com/tobiasbischoff/bambu-cli">
  **@tobiasbischoff** • `硬件` `3D 打印` `技能`

  控制和排查 BambuLab 打印机：状态、任务、摄像头、AMS、校准等功能。

  <img src="/assets/showcase/bambu-cli.png" alt="Bambu CLI 技能在 ClawdHub 上" />
</Card>

<Card title="维也纳交通（Wiener Linien）" icon="train" href="https://clawdhub.com/hjanuschka/wienerlinien">
  **@hjanuschka** • `旅行` `交通` `技能`

  维也纳公共交通的实时发车信息、中断情况、电梯状态和路线规划。

  <img src="/assets/showcase/wienerlinien.png" alt="ClawdHub 上的 Wiener Linien 技能" />
</Card>

<Card title="ParentPay 学校餐食" icon="utensils" href="#">
  **@George5562** • `自动化` `浏览器` `育儿`

  通过 ParentPay 自动化英国学校餐食预订。使用鼠标坐标实现可靠的表格单元点击。
</Card>

<Card title="R2 上传（Send Me My Files）" icon="cloud-arrow-up" href="https://clawdhub.com/skills/r2-upload">
  **@julianengel** • `文件` `r2` `预签名 URL`

  上传至 Cloudflare R2/S3 并生成安全的预签名下载链接。非常适合远程 Clawdbot 实例。
</Card>

<Card title="通过 Telegram 的 iOS 应用" icon="mobile" href="#">
  **@coard** • `ios` `xcode` `testflight`

  通过 Telegram 聊天完全部署到 TestFlight 的完整 iOS 应用。

  <img src="/assets/showcase/ios-testflight.jpg" alt="TestFlight 上的 iOS 应用" />
</Card>

<Card title="Oura Ring 健康助手" icon="heart-pulse" href="#">
  **@AS** • `health` `oura` `calendar`

  一个个人 AI 健康助手，将 Oura Ring 数据与日历、预约和健身房安排整合。

  <img src="/assets/showcase/oura-health.png" alt="Oura Ring 健康助手" />
</Card>
<Card title="Kev 的梦想团队（14+ 个智能体）" icon="robot" href="https://github.com/adam91holt/orchestrated-ai-articles">
  **@adam91holt** • `multi-agent` `orchestration` `architecture` `manifesto`

  通过 Opus 4.5 协调器管理的 14+ 个智能体，统一通过一个网关运行。全面的[技术文档](https://github.com/adam91holt/orchestrated-ai-articles)，涵盖梦想团队成员、模型选择、沙箱环境、Webhook、心跳检测和任务委派流程。[Clawdspace](https://github.com/adam91holt/clawdspace) 用于智能体沙箱环境。[博客文章](https://adams-ai-journey.ghost.io/2026-the-year-of-the-orchestrator/)。
</Card>

<Card title="Linear CLI" icon="terminal" href="https://github.com/Finesssee/linear-cli">
  **@NessZerra** • `devtools` `linear` `cli` `issues`

  与智能体工作流（Claude Code、Clawdbot）集成的 Linear 命令行工具。从终端管理问题、项目和工作流。首个外部 PR 已被合并！
</Card>

<Card title="Beeper CLI" icon="message" href="https://github.com/blqke/beepcli">
  **@jules** • `messaging` `beeper` `cli` `automation`

  通过 Beeper 桌面应用读取、发送和归档消息。使用 Beeper 本地 MCP API，使智能体能够在一处管理所有聊天（iMessage、WhatsApp 等）。
</Card>

</CardGroup>

## 🤖 自动化与工作流

<CardGroup cols={2}>

<Card title="Winix 空气净化器控制" icon="wind" href="https://x.com/antonplex/status/2010518442471006253">
  **@antonplex** • `automation` `hardware` `air-quality`

  Claude Code 发现并验证了空气净化器的控制方式，然后 Clawdbot 接管以管理房间空气质量。

  <img src="/assets/showcase/winix-air-purifier.jpg" alt="通过 Clawdbot 控制 Winix 空气净化器" />
</Card>

<Card title="美丽的天空相机照片" icon="camera" href="https://x.com/signalgaining/status/2010523120604746151">
  **@signalgaining** • `automation` `camera` `skill` `images`

  由屋顶相机触发：让 Clawdbot 在天空看起来美丽时拍摄一张照片——它设计了一个技能并完成了拍摄。

  <img src="/assets/showcase/roof-camera-sky.jpg" alt="由 Clawdbot 拍摄的屋顶相机天空快照" />
</Card>

<Card title="视觉化早间简报场景" icon="robot" href="https://x.com/buddyhadry/status/2010005331925954739">
  **@buddyhadry** • `automation` `briefing` `images` `telegram`

" 一个定时提示每天早上生成一张“场景”图片（天气、任务、日期、喜欢的文章/名言），通过Clawdbot角色实现。
</Card>

<Card title="帕德勒球场预订" icon="calendar-check" href="https://github.com/joshp123/padel-cli">
  **@joshp123** • `自动化` `预订` `命令行`
  
  Playtomic可用性检查器 + 命令行预订工具。再也不错过开放的球场。
  
  <img src="/assets/showcase/padel-screenshot.jpg" alt="padel-cli 截图" />
</Card>

<Card title="会计信息收集" icon="file-invoice-dollar">
  **社区** • `自动化` `邮件` `PDF`
  
  从邮件中收集PDF文件，为税务顾问准备文件。每月会计自动运行。
</Card>

<Card title="沙发土豆开发模式" icon="couch" href="https://davekiss.com">
  **@davekiss** • `Telegram` `网站` `迁移` `Astro`

  通过Telegram重建整个个人网站，同时观看Netflix — Notion → Astro，迁移了18篇文章，DNS迁移到Cloudflare。从未打开过笔记本电脑。
</Card>

<Card title="求职代理" icon="briefcase">
  **@attol8** • `自动化` `API` `技能`
  
  搜索职位信息，与简历关键词匹配，并返回相关机会和链接。使用JSearch API在30分钟内完成构建。
</Card>

<Card title="Jira技能构建器" icon="diagram-project" href="https://x.com/jdrhyne/status/2008336434827002232">
  **@jdrhyne** • `自动化` `Jira` `技能` `开发工具`

  Clawdbot连接到Jira，然后即时生成了一个新技能（在ClawdHub中尚不存在）。
</Card>

<Card title="通过Telegram的Todoist技能" icon="list-check" href="https://x.com/iamsubhrajyoti/status/2009949389884920153">
  **@iamsubhrajyoti** • `自动化` `Todoist` `技能` `Telegram`

  自动化Todoist任务，并让Clawdbot在Telegram聊天中直接生成技能。
</Card>

<Card title="TradingView分析" icon="chart-line">
  **@bheem1798** • `金融` `浏览器` `自动化`
  
  通过浏览器自动化登录TradingView，截图图表，并按需进行技术分析。无需API，只需控制浏览器。
</Card>

<Card title="Slack自动支持" icon="slack">
  **@henrymascot** • `Slack` `自动化` `支持`
  
  监控公司Slack频道，提供帮助性回复，并将通知转发到Telegram。在未被询问的情况下自主修复了已部署应用中的生产错误。
</Card>

</CardGroup>

## 🧠 知识与记忆

<CardGroup cols={2}>

<Card title="xuezh 中文学习" icon="language" href="https://github.com/joshp123/xuezh">
  **@joshp123** • `学习` `语音` `技能`
  
  中文学习引擎，通过Clawdbot提供发音反馈和学习流程。
  
  <img src="/assets/showcase/xuezh-pronunciation.jpeg" alt="xuezh 发音反馈" />
</Card>

<Card title="WhatsApp记忆库" icon="vault">
  **社区** • `记忆` `转录` `索引`
  
  接收完整的WhatsApp导出文件，转录1000+条语音消息，与git日志交叉核对，输出带有链接的markdown报告。
</Card>

<Card title="Karakeep 语义搜索" icon="magnifying-glass" href="https://github.com/jamesbrooksco/karakeep-semantic-search">
  **@jamesbrooksco** • `搜索` `向量` `书签`
  
  使用 Qdrant + OpenAI/Ollama 嵌入技术为 Karakeep 书签添加向量搜索功能。
</Card>

<Card title="Inside-Out-2 内存" icon="brain">
  **社区** • `记忆` `信念` `自我模型`
  
  一个独立的内存管理器，将会话文件转化为记忆 → 信念 → 不断进化的自我模型。
</Card>

</CardGroup>

## 🎙️ 音频与电话

<CardGroup cols={2}>

<Card title="Clawdia 电话桥" icon="phone" href="https://github.com/alejandroOPI/clawdia-bridge">
  **@alejandroOPI** • `音频` `vapi` `桥接`
  
  Vapi 音频助手 ↔ Clawdbot HTTP 桥接。与你的代理进行接近实时的电话通话。
</Card>

<Card title="OpenRouter 语音转录" icon="microphone" href="https://clawdhub.com/obviyus/openrouter-transcribe">
  **@obviyus** • `转录` `多语言` `技能`

  通过 OpenRouter（如 Gemini 等）实现多语言音频转录。可在 ClawdHub 上使用。
</Card>

</CardGroup>

## 🏗️ 基础设施与部署

<CardGroup cols={2}>

<Card title="Home Assistant 插件" icon="home" href="https://github.com/ngutman/clawdbot-ha-addon">
  **@ngutman** • `homeassistant` `docker` `树莓派`
  
  在 Home Assistant OS 上运行的 Clawdbot 网关，支持 SSH 隧道和持久化状态。
</Card>

<Card title="Home Assistant 技能" icon="toggle-on" href="https://clawdhub.com/skills/homeassistant">
  **ClawdHub** • `homeassistant` `技能` `自动化`
  
  通过自然语言控制和自动化 Home Assistant 设备。
</Card>

<Card title="Nix 打包" icon="snowflake" href="https://github.com/clawdbot/nix-clawdbot">
  **@clawdbot** • `nix` `打包` `部署`
  
  用于可重复部署的完整打包的 Clawdbot 配置。
</Card>

<Card title="CalDAV 日历" icon="calendar" href="https://clawdhub.com/skills/caldav-calendar">
  **ClawdHub** • `日历` `caldav` `技能`
  
  使用 khal/vdirsyncer 的日历技能。自托管的日历集成。
</Card>

</CardGroup>

## 🏠 家庭与硬件

<CardGroup cols={2}>

<Card title="GoHome 自动化" icon="house-signal" href="https://github.com/joshp123/gohome">
  **@joshp123** • `家庭` `nix` `grafana`
  
  原生 Nix 家庭自动化，Clawdbot 作为接口，同时提供精美的 Grafana 仪表板。
  
  <img src="/assets/showcase/gohome-grafana.png" alt="GoHome Grafana 仪表板" />
</Card>

<Card title="Roborock 吸尘器" icon="robot" href="https://github.com/joshp123/gohome/tree/main/plugins/roborock">
  **@joshp123** • `吸尘器` `物联网` `插件`
  
  通过自然对话控制你的 Roborock 机器人吸尘器。
  
  <img src="/assets/showcase/roborock-screenshot.jpg" alt="Roborock 状态" />
</Card>

</CardGroup>

## 🌟 社区项目

<CardGroup cols={2}>

<Card title="StarSwap 市场" icon="star" href="https://star-swap.com/">
  **社区** • `市场` `天文学` `网页应用`
  
  完整的天文学装备市场。基于 Clawdbot 生态系统构建。
</Card>

</CardGroup>

---

## 提交你的项目

有东西想分享吗？我们很乐意展示它！

<Steps>
  <Step title="分享它">
    在 [#showcase 话题的 Discord](https://discord.gg/clawd) 上发帖，或 [在 X 上@clawdbot](https://x.com/clawdbot)
  </Step>
  <Step title="包含详细信息">
    告诉我们它有什么功能，附上仓库或演示链接，并分享一张截图（如果有）
  </Step>
  <Step title="获得展示">
    我们会将优秀项目添加到此页面
  </Step>
</Steps>