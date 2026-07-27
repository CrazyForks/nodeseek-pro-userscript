# Nodeseek Max-iSen

用于增强 NodeSeek/DeepFlood 论坛浏览体验的 Tampermonkey 用户脚本，重点提供抽奖参与状态、抽奖提醒与开奖结果通知，以及站内 PM/TG 快捷联系。

- [GreasyFork 安装页面](https://greasyfork.org/zh-CN/scripts/588182-nodeseek-max-isen)
- [GreasyFork 代码页面](https://greasyfork.org/zh-CN/scripts/588182-nodeseek-max-isen/code)
- [直接安装脚本](https://update.greasyfork.org/scripts/588182/Nodeseek%20Max-iSen.user.js)
- [问题反馈](https://github.com/EISEN0516/nodeseek-pro-userscript/issues)

## 核心功能

### 抽奖参与状态

- 自动识别抽奖相关帖子。
- 在帖子列表和详情页标题旁显示“抽奖已参加”或“抽奖未参加”。
- 按用户保存参与历史，刷新页面或暂时退出登录后不会丢失。
- 登录后通过本人公开的评论历史逐步补全以前参加过的抽奖帖。
- 只有检测到真实评论、点赞、加鸡腿或收藏等证据时才标记为已参加，打开提醒管理器不会造成误判。

![抽奖参与状态](docs/images/lottery-participation-status.png)

### 抽奖提醒与开奖结果通知

- 管理抽奖帖和开奖时间，支持临近开奖提醒。
- 抽奖链接没有时间戳时，可从正文识别 `7.30 晚8点`、`7月30日20:00`、完整年月日、`今晚/明天/后天` 和 `8点半` 等常见写法，并按北京时间计算。
- 开奖后自动检查结果，中奖和未中奖均可通知。
- 外部通知失败时不会误标为已发送，会保存失败状态并自动退避重试；“测试通知”会显示真实发送结果。
- 通知中的“查看抽奖”直接指向对应帖子。
- 支持 Telegram Bot、邮件、微信推送、Bark、钉钉、飞书、企业微信和 Discord 等通知渠道。

所有外部通知渠道默认关闭，需要用户自行配置对应平台的 Token、Chat ID、Webhook 或 API Key。

![抽奖通知配置](docs/images/lottery-notification-settings.png)

### PM/TG 快捷联系

- 在帖子作者或回复者的等级、注册天数后显示快捷按钮。
- PM 按钮直接进入该用户的 NodeSeek 站内私信。
- TG 按钮从用户公开的个性签名中识别 Telegram 链接。
- 对方没有公开 Telegram 信息时，不会生成无效 TG 链接。

![PM 和 TG 快捷联系](docs/images/quick-contact-pm-tg.png)

## 其他功能

- 自动签到
- 楼中楼回复
- 移动端响应式适配
- 帖子和评论下拉加载
- 快速回复与 AI 文本美化入口
- 关键字和用户内容过滤
- 用户等级、注册天数和关系标记
- 浏览历史和图片预览
- 响应式设置面板

## 安装教程

### 1. 安装用户脚本管理器

桌面浏览器可安装 [Tampermonkey](https://www.tampermonkey.net/) 或 Violentmonkey。移动端需要使用支持用户脚本扩展的浏览器。

### 2. 安装脚本

推荐打开 [GreasyFork 安装页面](https://greasyfork.org/zh-CN/scripts/588182-nodeseek-max-isen)，点击“安装此脚本”并在用户脚本管理器中确认。

也可以使用以下地址直接安装：

<https://update.greasyfork.org/scripts/588182/Nodeseek%20Max-iSen.user.js>

安装或更新完成后刷新 NodeSeek 页面。

### 3. 配置抽奖提醒

1. 点击页面顶部的“打开抽奖提醒”，或在抽奖帖中点击“抽奖提醒管理器”。
2. 按需要添加和管理抽奖提醒。
3. 打开“抽奖通知配置”，填写自己的 NodeSeek 用户名。
4. 选择并配置需要的通知渠道。
5. 先点击“测试通知”，确认成功后保存。

不需要外部通知时，也可以只使用标题旁的参与状态和站内提醒。

## 使用说明

- 浏览帖子列表或进入帖子后，直接查看标题旁的参与状态。
- 实际完成评论、点赞、加鸡腿或收藏后，脚本会保存参与证据。
- 需要开奖提醒时，通过“抽奖提醒管理器”添加对应帖子。
- 需要联系用户时，点击其等级和注册天数后的 PM 或 TG 按钮。

脚本不会自动参与抽奖，也不会自动评论、点赞、加鸡腿或收藏。

## 隐私与安全

- 抽奖参与历史和脚本设置保存在用户脚本管理器的本地存储中。
- 项目不保存论坛账号、密码、Telegram Bot Token 或其他通知服务密钥。
- 只有启用第三方通知后，通知内容才会发送到用户自己配置的服务。
- 源码未压缩、未混淆，可在 GitHub 或 GreasyFork 代码页面直接查看。

## 更新方式

脚本元数据已配置 GitHub Raw 更新地址。Tampermonkey 检查更新时会读取 `main` 分支中的脚本版本号，也可以重新打开 GreasyFork 安装页面手动更新。

## 开发约定

每次修改脚本功能后递增 `@version`，运行语法检查和 GreasyFork 用户脚本校验，再提交到 `main` 分支。

## 许可证

GPL-3.0
