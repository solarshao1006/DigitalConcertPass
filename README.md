# 🎸 Digital Concert Pass | 电子票根生成器

[![License: MIT](https://img.shields.io/badge/许可证-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stack: React 19 + Vite](https://img.shields.io/badge/前端-React_19_%7C_Vite-blue)](https://vitejs.dev/)
[![Backend: Node.js](https://img.shields.io/badge/后端-Node.js_%7C_Express-green)](https://expressjs.com/)

**Digital Concert Pass** 是一款专为 **张艺兴 (Lay Zhang)** 粉丝设计的电子票根生成工具。它可以将演唱会回忆数字化，生成适配 Apple Wallet（苹果钱包）风格的 `.pkpass` 文件，让你在 iPhone 上永久收藏这份独特的纪念。

---

## ✨ 核心功能

- 🎫 **Apple Wallet 深度适配**：生成的票根可直接添加至 iOS 钱包 App，完美还原原生视觉体验。
- 🛠️ **动态票务生成**：支持自定义城市、场馆、票价档位及座位信息。
- 🎨 **服务端图像渲染**：利用 `canvas` 库在后端自动处理图片素材，确保票根背景图与图标高清适配。
- 🔐 **证书自动化处理**：内置强大的 PEM 证书规范化引擎，支持从环境变量自动解析 Base64 或多行加密字符串，确保签名安全。

---

## 🚀 技术栈

### 前端
- **框架**: React 19 (Hooks)
- **样式**: Tailwind CSS v4
- **动画**: Motion (原 Framer Motion)
- **构建工具**: Vite

### 后端
- **运行环境**: Node.js + `tsx` (TypeScript 执行器)
- **服务器**: Express
- **票据引擎**: `passkit-generator`
- **图像处理**: `canvas` & `adm-zip`

---

## 📂 项目结构说明 (Project Structure)

本项目采用 **Vite + React** 前端与 **Node.js (Express)** 后端同构的架构，以下是核心文件及其功能描述：

| 路径 | 类型 | 说明 |
| :--- | :--- | :--- |
| **`server.ts`** | 后端入口 | **核心逻辑所在**。负责 Express 路由、证书规范化 (`normalizePEM`) 以及使用 `passkit-generator` 生成 `.pkpass` 文件。 |
| **`src/`** | 前端目录 | 包含 React 19 组件、Tailwind CSS 样式以及与后端 API 交互的 UI 逻辑。 |
| **`index.html`** | 模板文件 | 应用的单页入口，配置了移动端自适应的 Meta 标签。 |
| **`vite.config.ts`** | 配置文件 | 定义了前端构建流程、环境变量注入以及开发环境下的 HMR 策略。 |
| **`package.json`** | 依赖管理 | 记录了 `passkit-generator` (票据生成)、`canvas` (图像处理) 及 `motion` (动画) 等关键依赖。 |
| **`tsconfig.json`** | TS 配置 | 针对 ES2022 语法和 React JSX 进行的 TypeScript 类型检查配置。 |
| **`metadata.json`** | 元数据 | 定义项目名称（Digital Concert Pass）及 Google AI Studio 的运行权限。 |

### 核心模块解析
* **证书预处理**: 在 `server.ts` 中，我们实现了一套宽容度极高的证书加载机制，能够识别并转换多种格式的 Apple 签名证书（Base64, 多行字符串等）。
* **图像合成引擎**: 利用服务端 `canvas` 模块，在生成票根时动态合成背景图，确保票面信息与视觉资源完美对齐。


## ⚠️ 免责声明 (Disclaimer)
> [!IMPORTANT]
> 本项目仅供技术研究与 Xback 粉丝交流使用，请在使用前阅读以下条款：

1. **非官方凭证**：本项目生成的电子票根仅作为**个人数字纪念品**。它不具备、也不代表任何正式的入场许可。**请勿尝试在演唱会现场核验处出示此票根**。
2. **版权说明**：项目中使用的艺人肖像、商标及相关视觉元素，其版权均归属于 **张艺兴 (Lay Zhang)** 及其所属经纪公司所有。本项目不拥有相关素材的版权。
3. **数据隐私**：
   - 所有的票面信息（如座位号、姓名等）仅在本地或您部署的私有服务器中处理。
   - 请妥善保管您的 `.env.local` 配置文件，切勿将包含私钥（SIGNER_KEY）的代码库公开上传，以免造成证书泄露。
4. **法律责任**：开发者不对因误用本项目生成的票根而导致的任何法律纠纷或经济损失负责。

---

<div align="center">
  <p><b>支持正版，请通过官方渠道购买演唱会门票。</b></p>
  <p>🚢 <i>May we meet again in the Grandline.</i> 🚢</p>
</div>
