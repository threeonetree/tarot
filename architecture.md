# 塔罗指引 — 开发架构文档

> 版本：v1.1 | 日期：2026-07-22 | 基于 GPT 项目迁移适配
> 配套文档：[PRD.md](./PRD.md) · [todo.md](./todo.md)

---

## 1. 架构原则

- 纯前端：不依赖后端和大模型 API
- 本地优先：问题、抽牌结果和会话恢复均留在浏览器
- 单一事实来源：翻牌状态只由全局 reading state 管理
- 规则可解释：综合解读来自明确、可测试的规则
- 输出稳定：同一占卜不会因重新渲染而改变文案
- 移动端优先：复杂牌阵保持位置关系，同时保证文字可读
- 内容与逻辑分离：牌义数据、位置模板和关系规则分别维护

---

## 2. 技术栈

| 层次 | 选型 | 说明 |
|------|------|------|
| UI | React 19 + TypeScript | 组件化页面和严格的数据类型 |
| 构建 | Vite 6 | 开发构建一体化 |
| 路由 | React Router v7 | 5 条路由 + 准入守卫 |
| 状态 | Context + useReducer | 状态规模较小，无需额外状态库 |
| 样式 | Tailwind CSS 4 + 全局 CSS 变量 | 几何黑金设计系统 |
| PWA | Web App Manifest + Service Worker | 手写 SW，离线可用 |
| 单元/组件测试 | Vitest + Testing Library | 55 个测试全部通过 |
| 规范 | ESLint + Prettier | |
| 部署 | 静态站点托管（Vercel） | |

---

## 3. 项目结构

```
tarot/
├── index.html                  # Vite 入口 HTML，含 meta 标签和 PWA manifest
├── public/
│   ├── favicon.svg
│   ├── manifest.webmanifest    # PWA manifest
│   ├── sw.js                   # Service Worker（离线缓存）
│   ├── icons/                  # PWA 图标 (192, 512, apple-touch)
│   └── cards/
│       ├── major/              # 22 张大阿卡纳 SVG
│       ├── minor/              # 56 张小阿卡纳 SVG
│       └── samples/            # 首页展示用的 WebP 样图
├── src/
│   ├── main.tsx                # React 入口
│   ├── App.tsx                 # 根组件：ReadingProvider + BrowserRouter + PwaStatus
│   ├── routes.tsx              # React Router 路由表
│   ├── vite-env.d.ts
│   ├── styles/
│   │   └── global.css          # Tailwind CSS + 设计 tokens + 全局样式
│   ├── types/                  # (已合并到 lib/types.ts)
│   ├── lib/
│   │   ├── types.ts            # 所有 TypeScript 类型定义
│   │   ├── data/
│   │   │   ├── cards.ts        # 78 张牌完整数据
│   │   │   ├── categories.ts   # 6 类问题领域
│   │   │   ├── spreads.ts      # 3 个牌阵定义
│   │   │   └── minorNarratives.ts  # 小阿卡纳叙述数据
│   │   ├── engine/
│   │   │   ├── draw.ts         # Fisher-Yates 洗牌 + 抽牌
│   │   │   ├── analysis.ts     # 解读引擎（结构化分析）
│   │   │   ├── formatReading.ts    # 格式化解读为复制文本
│   │   │   └── validation.ts   # 牌组和牌阵数据校验
│   │   ├── state/
│   │   │   └── readingReducer.ts   # Reducer + State 定义
│   │   └── storage/
│   │       └── sessionReading.ts   # sessionStorage 会话管理
│   ├── context/
│   │   └── ReadingContext.tsx  # React Context 封装
│   ├── hooks/
│   ├── components/
│   │   ├── CardBack.tsx        # 牌背图案
│   │   ├── CardFace.tsx        # 牌面（插画层）
│   │   ├── CardDetail.tsx      # 牌名、正逆位、关键词
│   │   ├── CardFlip.tsx        # (已合并到 TarotCardButton)
│   │   ├── TarotCardButton.tsx # 翻牌按钮（受控组件）
│   │   ├── SpreadLayout.tsx    # (已合并到 ReadingExperience)
│   │   ├── QuestionForm.tsx    # 问题表单（领域选择 + 输入）
│   │   ├── ReadingExperience.tsx  # 核心阅读流程
│   │   ├── CopyButton.tsx      # 剪贴板复制按钮
│   │   ├── PwaStatus.tsx       # 离线/更新状态提示
│   │   └── AIHint.tsx          # (待添加)
│   ├── pages/
│   │   ├── HomePage.tsx        # 首页（产品介绍）
│   │   ├── SpreadSelect.tsx    # 牌阵选择
│   │   ├── QuestionInput.tsx   # 问题输入（含领域选择）
│   │   └── ReadingPage.tsx     # 阅读结果页
│   └── __tests__/              # 11 个测试文件，55 个测试
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── .prettierrc
├── .gitignore
├── PRD.md
├── architecture.md
└── todo.md
```

---

## 4. 领域类型

### 4.1 牌组

```ts
export type Suit = 'cups' | 'swords' | 'wands' | 'pentacles';
export type MinorRank = 'ace' | 'two' | ... | 'king';
export type QuestionCategory = 'general' | 'relationship' | 'career' | 'study' | 'finance' | 'family';
export type ContentStatus = 'draft' | 'reviewed';

export interface TarotCard {
  id: number; name: string; nameEn: string;
  type: 'major' | 'minor'; suit?: Suit; rank?: MinorRank;
  illustrationPath: string; contentStatus: ContentStatus;
  upright: OrientationMeaning; reversed: OrientationMeaning;
}
```

### 4.2 牌阵

```ts
export interface Spread {
  id: 'three-card' | 'hexagram' | 'two-paths';
  name: string; shortName: string; description: string;
  cardCount: number; positions: SpreadPosition[];
  layoutPattern: 'linear' | 'hexagram' | 'two-paths';
}
```

### 4.3 分析结果

```ts
export interface GeneratedReading {
  signature: string; theme: string;
  positions: PositionReading[]; relationships: RelationshipInsight[];
  nextStep: string; disclaimer: string;
}
```

---

## 5. 状态与路由

### 5.1 状态定义

```ts
export type ReadingPhase = 'idle' | 'shuffling' | 'revealing';

export interface ReadingState {
  spread: Spread | null; category: QuestionCategory | null;
  question: string; optionA: string; optionB: string;
  phase: ReadingPhase; drawnCards: DrawnCard[];
  revealedIndices: Set<number>; activePositionIndex: number | null;
}
```

`isComplete` 是派生值，不存入 state。

### 5.2 Actions

```ts
export type ReadingAction =
  | { type: 'SELECT_SPREAD'; spread: Spread }
  | { type: 'SET_QUESTION'; category: QuestionCategory; question: string; optionA?: string; optionB?: string }
  | { type: 'START_READING'; cards: DrawnCard[] }
  | { type: 'FINISH_SHUFFLE' }
  | { type: 'REVEAL_CARD'; positionIndex: number }
  | { type: 'SET_ACTIVE_CARD'; positionIndex: number }
  | { type: 'RESTORE_SESSION'; state: ReadingState }
  | { type: 'RESET' };
```

### 5.3 路由

| 路径 | 页面 | 准入条件 |
|------|------|----------|
| `/` | HomePage | 无 |
| `/select` | SpreadSelect | 无 |
| `/question/:spreadId` | QuestionInput | spreadId 有效 |
| `/reading` | ReadingPage | 已有抽牌结果 |

### 5.4 状态流转

```
选择牌阵 → 设置领域与问题 → START_READING (shuffling)
→ FINISH_SHUFFLE (revealing) → REVEAL_CARD × N → 派生 isComplete
```

---

## 6. 抽牌算法

Fisher-Yates 洗牌，支持注入 `RandomSource`（测试时可固定）。每张牌独立 50% 概率逆位。不修改原数组。

```ts
export function shuffle<T>(input: readonly T[], random?: RandomSource): T[];
export function drawCards(deck: readonly TarotCard[], positions: readonly SpreadPosition[], random?: RandomSource): DrawnCard[];
```

---

## 7. 解读引擎

处理管线：
```
校验输入 → 解析各位置牌义 → 应用问题领域回退
→ 应用位置角色模板 → 检测牌间关系 → 生成整体主题 → 返回 GeneratedReading
```

v1 关系规则（8 条）：
1. 大阿卡纳集中 2. 主导花色 3. 正逆位模式 4. 三张牌时间线变化
5. 六芒星核心—阻碍 6. 六芒星助力—阻碍 7. 六芒星建议—结果
8. 二选一 A/B 路径比较

---

## 8. 会话存储

使用 `sessionStorage`。问题请求与抽牌结果分两个键保存。120ms 合并写入。`RESET` 同步删除。

---

## 9. 组件与响应式

- 所有卡牌交互使用真实 `<button>`
- 六芒星移动端使用缩略牌阵 + 详情面板
- 触控目标 ≥ 44px
- 动画仅使用 `transform` 和 `opacity`
- 支持 `prefers-reduced-motion`

---

## 10. PWA 与部署

- Manifest + Service Worker + 图标三件套
- 离线缓存：首页、选择页、阅读页、全部牌面
- 新版本提示"稍后/刷新更新"，不打断正在进行的占卜
- 部署：`npm run build` → 静态文件 → Vercel / 任意静态托管
- 需配置 SPA fallback（所有路由返回 index.html）

---

## 11. 测试策略

| 类型 | 覆盖范围 | 状态 |
|------|----------|------|
| 单元测试 | 牌组校验、洗牌、解读引擎、reducer、session 存储 | ✅ 55 个测试通过 |
| 组件测试 | 表单验证、翻牌交互、PWA 状态、复制按钮 | ✅ 已通过 |
| 构建验证 | TypeScript 编译 + Vite 构建 | ✅ 零错误 |
| 端到端 | 手动浏览器验证 3 个牌阵 | ⏳ 待用户验证 |

---

## 12. 性能

| 指标 | 目标 | 当前 |
|------|------|------|
| JS gzip | < 200KB | 98KB |
| CSS gzip | < 20KB | 8KB |
| 构建产物 | 不含 source map | ✅ |
