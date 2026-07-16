# 塔罗牌在线抽牌 — 开发架构文档

> 版本：v1.0 | 日期：2026-07-16 | 配套文档：[PRD.md](./PRD.md)

---

## 1. 技术栈选型

| 层次 | 选型 | 版本 | 理由 |
|------|------|------|------|
| 框架 | React | ^18 | 组件化适合多牌阵布局；生态最成熟，PWA/移动端打包方案最完善 |
| 语言 | TypeScript | ^5 | 78 张牌数据结构复杂，类型检查防错；interface 即文档 |
| 构建工具 | Vite | ^5 | HMR 极快，原生 TS 支持，CSS Modules 零配置 |
| 路由 | React Router | ^6 | 5 个页面步骤清晰，声明式路由 |
| 样式 | CSS Modules | — | Vite 原生支持，类名自动隔离，无全局污染 |
| PWA | vite-plugin-pwa | ^0.19 | Service Worker + Manifest 一站式，和 Vite 深度集成 |
| 测试 | Vitest | ^1 | 与 Vite 共享配置，只测工具函数 |
| 代码规范 | ESLint + Prettier | — | 社区标准，保存自动格式化 |
| 状态管理 | React Context + useReducer | — | 应用状态 < 10 个字段，无需 Redux |
| 部署 | Vercel | — | 零配置、免费、自动 HTTPS、推送即部署 |

---

## 2. 项目目录结构

```
tarot/
├── public/
│   ├── favicon.svg              # 网站图标（星月图案）
│   ├── icon-192.png            # PWA 小图标
│   ├── icon-512.png            # PWA 大图标
│   └── og-image.png            # 社交分享预览图
│
├── src/
│   ├── main.tsx                 # 入口：挂载 React 到 DOM，注册 Service Worker
│   ├── App.tsx                  # 根组件：包裹 Router + ReadingProvider + Layout
│   ├── routes.tsx               # 路由表：定义所有页面路径
│   │
│   ├── styles/
│   │   ├── global.css           # CSS 变量（颜色/字体/间距）+ reset + 羊毛毯背景
│   │   └── animations.css       # 全局关键帧动画（翻转/呼吸/粒子/滑入）
│   │
│   ├── types/
│   │   └── index.ts             # 所有 TypeScript 类型/接口定义
│   │
│   ├── data/
│   │   ├── cards.ts             # 78 张牌完整数据（数组，每项含正逆位含义）
│   │   ├── spreads.ts           # 3 个牌阵定义（位置配置 + 布局模式）
│   │   └── templates.ts         # 综合分析模板（拼接函数 + 连接词库）
│   │
│   ├── context/
│   │   └── ReadingContext.tsx    # 占卜状态 Context：Provider + Reducer + Hook
│   │
│   ├── hooks/
│   │   └── useShuffle.ts        # 洗牌 Hook：Fisher-Yates + 正逆位随机 + 返回抽牌结果
│   │
│   ├── utils/
│   │   ├── shuffle.ts           # 纯函数：Fisher-Yates 洗牌算法
│   │   ├── analysis.ts          # 分析引擎：模板拼接、能量统计、逐位置解读
│   │   └── clipboard.ts         # 剪贴板：复制文本到系统剪贴板
│   │
│   ├── components/
│   │   ├── Layout.tsx            # 全局布局：暗角背景 + 金色边框装饰 + 页面容器
│   │   ├── CardBack.tsx          # 牌背：统一星芒图案（纯 CSS 绘制）
│   │   ├── CardFace.tsx          # 牌面：花色符号 SVG + 牌名 + 正逆位 + 一句话含义
│   │   ├── CardFlip.tsx          # 翻牌容器：3D 翻转逻辑 + 正反面切换
│   │   ├── SpreadLayout.tsx      # 牌阵布局：根据 layoutPattern 渲染 HTML 结构
│   │   ├── GoldParticles.tsx     # 背景粒子：金色光点 CSS 动画循环
│   │   ├── AIHint.tsx            # AI 引导区：提示文字 + 调用 CopyButton
│   │   └── CopyButton.tsx        # 复制按钮：写入剪贴板 + 已复制反馈态
│   │
│   ├── pages/
│   │   ├── HomePage.tsx          # 首页：标题 + 装饰 + CTA 按钮
│   │   ├── SpreadSelect.tsx      # 牌阵选择：3 张选择卡片
│   │   ├── QuestionInput.tsx     # 问题输入：输入框 + 二选一选项输入
│   │   ├── DrawPage.tsx          # 抽牌动画：洗牌效果 + 牌背排列
│   │   └── ReadingResult.tsx     # 翻牌 & 结果：逐张翻开 + 综合解读
│   │
│   └── __tests__/
│       ├── shuffle.test.ts       # 洗牌算法测试：随机性、不重复、正逆位
│       ├── analysis.test.ts      # 分析引擎测试：模板输出正确性
│       └── clipboard.test.ts     # 剪贴板测试
│
├── index.html                    # Vite 入口 HTML
├── package.json
├── tsconfig.json
├── .eslintrc.cjs                 # ESLint 配置
├── .prettierrc                   # Prettier 配置
├── vite.config.ts                # Vite + PWA 插件配置
├── PRD.md                        # 产品需求文档
└── architecture.md               # 本文档
```

---

## 3. 核心模块说明

### 3.1 `src/types/index.ts` — 类型定义

所有数据结构的 type/interface 集中管理，其他文件 import 使用。

```typescript
// ========== 塔罗牌 ==========

/** 花色 */
export type Suit = 'cups' | 'swords' | 'wands' | 'pentacles';

/** 小阿卡纳序号 */
export type MinorRank =
  | 'ace' | 'two' | 'three' | 'four' | 'five'
  | 'six' | 'seven' | 'eight' | 'nine' | 'ten'
  | 'page' | 'knight' | 'queen' | 'king';

/** 单张塔罗牌的完整数据 */
export interface TarotCard {
  id: number;                        // 0-77，唯一标识
  name: string;                      // 中文牌名，如「愚者」「圣杯三」
  nameEn: string;                    // 英文牌名，如 "The Fool"
  type: 'major' | 'minor';          // 大阿卡纳 / 小阿卡纳
  suit?: Suit;                       // 花色（仅小阿卡纳）
  rank?: MinorRank;                  // 序号（仅小阿卡纳）
  uprightKeywords: string[];         // 正位关键词，3-5 个
  reversedKeywords: string[];        // 逆位关键词，3-5 个
  uprightMeaning: string;            // 正位一句话含义（≤30 字）
  reversedMeaning: string;           // 逆位一句话含义（≤30 字）
}

// ========== 牌阵 ==========

/** 布局模式 */
export type LayoutPattern = 'linear' | 'hexagram' | 'two-paths';

/** 牌阵中的一个位置 */
export interface SpreadPosition {
  index: number;         // 位置序号（从 1 开始）
  label: string;         // 位置名称，如「过去」
  description: string;   // 位置含义说明
}

/** 牌阵定义 */
export interface Spread {
  id: string;                         // 唯一标识符
  name: string;                       // 牌阵名称
  description: string;                // 适用场景
  cardCount: number;                  // 牌数
  positions: SpreadPosition[];        // 位置列表
  layoutPattern: LayoutPattern;       // 布局方式
}

// ========== 抽牌 ==========

/** 抽到的一张牌（带正逆位状态） */
export interface DrawnCard {
  card: TarotCard;                    // 牌面数据
  isReversed: boolean;                // 是否逆位
  position: SpreadPosition;           // 在牌阵中的位置
}

// ========== 占卜状态 ==========

/** 占卜流程步骤 */
export type ReadingStep =
  | 'home'            // 首页
  | 'select-spread'   // 选择牌阵
  | 'question'        // 输入问题
  | 'draw'            // 抽牌动画
  | 'reveal'          // 翻牌 & 结果

/** 占卜完整状态 */
export interface ReadingState {
  step: ReadingStep;                  // 当前步骤
  spread: Spread | null;              // 已选牌阵
  question: string;                   // 用户问题（可为空字符串）
  optionA: string;                    // 二选一：选项 A（可为空）
  optionB: string;                    // 二选一：选项 B（可为空）
  drawnCards: DrawnCard[];            // 已抽的牌
  revealedIndices: Set<number>;       // 已翻牌的位置索引
  isComplete: boolean;                // 全部翻完则为 true
}

// ========== 分析 ==========

/** 统计计数 */
export interface CardCounts {
  total: number;
  upright: number;
  reversed: number;
  major: number;
  minor: number;
}
```

### 3.2 `src/data/cards.ts` — 78 张牌数据

暴露一个 `cards: TarotCard[]` 数组，包含全部 78 张牌的完整数据。

```typescript
import type { TarotCard } from '../types';

export const cards: TarotCard[] = [
  // 大阿卡纳（0-21）
  {
    id: 0,
    name: '愚者',
    nameEn: 'The Fool',
    type: 'major',
    uprightKeywords: ['开始', '冒险', '天真', '无限可能'],
    reversedKeywords: ['鲁莽', '轻率', '缺乏方向'],
    uprightMeaning: '新的开始，带着勇气踏上未知的旅程',
    reversedMeaning: '过于冲动，三思而后行更稳妥',
  },
  // ... 其余 77 张牌
];
```

### 3.3 `src/data/spreads.ts` — 牌阵定义

暴露一个 `spreads: Spread[]` 数组。

```typescript
import type { Spread } from '../types';

export const spreads: Spread[] = [
  {
    id: 'three-card',
    name: '三张牌 · 时间之箭',
    description: '看清过去、现在、未来的脉络，适合大多数问题',
    cardCount: 3,
    positions: [
      { index: 1, label: '过去', description: '已发生的事件或根源' },
      { index: 2, label: '现在', description: '当前状况或核心挑战' },
      { index: 3, label: '未来', description: '可能的发展方向' },
    ],
    layoutPattern: 'linear',
  },
  {
    id: 'hexagram',
    name: '六芒星 · 星芒指引',
    description: '深度剖析复杂问题，从七个维度全面解读',
    cardCount: 7,
    positions: [
      { index: 1, label: '核心', description: '问题的本质或核心状态' },
      { index: 2, label: '目标', description: '期望的结果或方向' },
      { index: 3, label: '助力', description: '可利用的资源' },
      { index: 4, label: '阻碍', description: '面临的障碍' },
      { index: 5, label: '根源', description: '深层原因或潜意识' },
      { index: 6, label: '建议', description: '塔罗给出的指引' },
      { index: 7, label: '结果', description: '按当前路径的走向' },
    ],
    layoutPattern: 'hexagram',
  },
  {
    id: 'two-paths',
    name: '二选一 · 抉择之路',
    description: '在两个选项间犹豫不决时的明灯',
    cardCount: 5,
    positions: [
      { index: 1, label: '现状', description: '当前面临选择的核心状态' },
      { index: 2, label: '选项A优势', description: '路径A的积极面' },
      { index: 3, label: '选项A挑战', description: '路径A的风险' },
      { index: 4, label: '选项B优势', description: '路径B的积极面' },
      { index: 5, label: '选项B挑战', description: '路径B的风险' },
    ],
    layoutPattern: 'two-paths',
  },
];
```

### 3.4 `src/data/templates.ts` — 分析模板

分析引擎的模板函数。详见第 8 节。

### 3.5 `src/context/ReadingContext.tsx` — 状态管理

```typescript
// State
const initialState: ReadingState = {
  step: 'home',
  spread: null,
  question: '',
  optionA: '',
  optionB: '',
  drawnCards: [],
  revealedIndices: new Set(),
  isComplete: false,
};

// Actions
type ReadingAction =
  | { type: 'SELECT_SPREAD'; spread: Spread }
  | { type: 'SET_QUESTION'; question: string; optionA?: string; optionB?: string }
  | { type: 'DRAW_CARDS'; cards: DrawnCard[] }
  | { type: 'REVEAL_CARD'; index: number }
  | { type: 'RESET' };

// Export
export const ReadingProvider: React.FC<{children: ReactNode}>;
export function useReading(): ReadingState & ReadingDispatch;
```

Reducer 逻辑：
- `SELECT_SPREAD` → 更新 spread，step 前进到 question
- `SET_QUESTION` → 更新 question/optionA/optionB，step 前进到 draw
- `DRAW_CARDS` → 存储抽牌结果，step 前进到 reveal
- `REVEAL_CARD` → 添加 index 到 revealedIndices，全部翻完设 isComplete=true
- `RESET` → 回到 initialState

### 3.6 `src/utils/shuffle.ts` — 洗牌算法

```typescript
import type { TarotCard, DrawnCard } from '../types';

/** Fisher-Yates 洗牌，返回新数组（不改变原数组） */
export function shuffle<T>(array: T[]): T[];

/** 从牌库中随机抽 N 张，每张随机正/逆位 */
export function drawCards(
  deck: TarotCard[],
  count: number,
  positions: SpreadPosition[]
): DrawnCard[];
```

`drawCards` 流程：
1. `shuffle(deck)` → 取前 `count` 张
2. 每张 `Math.random() > 0.5` 决定正/逆位
3. 按顺序绑定 `SpreadPosition`

### 3.7 `src/utils/analysis.ts` — 分析引擎

```typescript
import type { DrawnCard, Spread, CardCounts } from '../types';

/** 统计牌面能量 */
export function countCards(cards: DrawnCard[]): CardCounts;

/** 生成综合分析文本 */
export function generateReading(
  cards: DrawnCard[],
  spread: Spread,
  question?: string,
  optionA?: string,
  optionB?: string
): string;
```

拼接逻辑：
1. `countCards()` → 选择能量概述模板句
2. 遍历 `cards` × `spread.positions` → 填充位置解读模板
3. 若有 question，插入问题回顾句
4. 二选一时对比选项 AB 的牌面能量
5. 追加建议收尾句

### 3.8 `src/utils/clipboard.ts` — 剪贴板

```typescript
/** 将文本写入系统剪贴板，返回是否成功 */
export async function copyToClipboard(text: string): Promise<boolean>;
```

### 3.9 Components — 组件

| 组件 | 职责 | Props |
|------|------|-------|
| `Layout` | 全局框架：暗角遮罩 + 金色边框 + `<main>` 容器 | `children` |
| `CardBack` | 牌背图案（纯 CSS），独立渲染 | 无（纯展示） |
| `CardFace` | 牌面内容：SVG 符号 + 牌名 + 正逆位 + 含义文字 | `card: DrawnCard` |
| `CardFlip` | 翻牌逻辑容器：管理 isFlipped 状态 + 3D CSS | `card: DrawnCard`, `onFlip: () => void` |
| `SpreadLayout` | 根据 `layoutPattern` 渲染不同 HTML 结构的卡牌网格 | `spread: Spread`, `cards: DrawnCard[]`, `revealed: Set<number>` |
| `GoldParticles` | 背景金色粒子飘浮（纯 CSS 动画） | 无 |
| `AIHint` | AI 提示文字 + 拼接复制内容 + 调用 CopyButton | `cards`, `spread`, `question` |
| `CopyButton` | 按钮 → 复制中态 → 已复制 ✓ 反馈态 | `text: string` |

### 3.10 Pages — 页面

| 页面 | 路由 | 核心逻辑 |
|------|------|----------|
| `HomePage` | `/` | 点击「开始占卜」→ `dispatch({type:'RESET'})` → navigate |
| `SpreadSelect` | `/select` | 点击牌阵卡片 → `SELECT_SPREAD` |
| `QuestionInput` | `/question` | 输入完成 → `SET_QUESTION` → 调用 `drawCards()` → `DRAW_CARDS` |
| `DrawPage` | `/draw` | 播放洗牌动画 → 1.5s 后展示牌背 |
| `ReadingResult` | `/reveal` | 点击牌 → `REVEAL_CARD` → 全部翻开后自动显示分析 |

---

## 4. 组件树与路由

### 4.1 组件树

```
<App>
  <ReadingProvider>           // Context 包裹
    <Layout>                  // 全局框架（每个页面都在 Layout 内）
      <Router>
        <Route "/"          → <HomePage />
        <Route "/select"    → <SpreadSelect />
        <Route "/question"  → <QuestionInput />
        <Route "/draw"      → <DrawPage />
        <Route "/reveal"    → <ReadingResult />
      </Router>
    </Layout>
  </ReadingProvider>
</App>
```

### 4.2 路由表

| 路径 | 页面组件 | 准入条件 | 不符合时重定向 |
|------|----------|----------|----------------|
| `/` | `HomePage` | 无 | — |
| `/select` | `SpreadSelect` | 无（首次进入或重新占卜） | — |
| `/question` | `QuestionInput` | `state.spread !== null` | `/select` |
| `/draw` | `DrawPage` | `state.spread !== null` | `/select` |
| `/reveal` | `ReadingResult` | `state.drawnCards.length > 0` | `/select` |

路由守卫在 `routes.tsx` 中通过检查 `useReading()` 的状态实现。

---

## 5. 状态管理

### 5.1 State 设计图

```
ReadingState
├── step: ReadingStep          // 当前页面
├── spread: Spread | null      // 选的牌阵
├── question: string           // 用户问题
├── optionA: string            // 二选一 A
├── optionB: string            // 二选一 B
├── drawnCards: DrawnCard[]    // 抽的牌
├── revealedIndices: Set<number>  // 已翻开的位置
└── isComplete: boolean        // 全部翻开？
```

### 5.2 状态流转

```
home ──(点击开始)──→ select-spread ──(选牌阵)──→ question
                                                      │
                                                   (输入完成)
                                                      │
                                                      ↓
reveal ←──(动画结束)── draw ←──(调用drawCards)──┘
  │
  │ (全部翻开)
  ↓
isComplete = true → 显示综合分析
```

### 5.3 为什么不持久化

v1 不做 localStorage 持久化。每次刷新页面 = 重新占卜。简化实现，避免序列化 `Set<number>` 等复杂类型的额外处理。v2 再加历史记录功能。

---

## 6. 数据流

### 6.1 完整链路：以"用户做完一次占卜"为例

```
1. 用户在 HomePage 点击 [开始占卜]
   → dispatch({ type: 'RESET' })
   → navigate('/select')

2. 用户在 SpreadSelect 点击「三张牌」卡片
   → dispatch({ type: 'SELECT_SPREAD', spread: spreads[0] })
   → navigate('/question')

3. 用户在 QuestionInput 输入问题，点击 [开始抽牌]
   → dispatch({ type: 'SET_QUESTION', question: 'xxx' })
   → 调用 const drawn = drawCards(cards, spread.cardCount, spread.positions)
   → dispatch({ type: 'DRAW_CARDS', cards: drawn })
   → navigate('/draw')

4. DrawPage 播放洗牌动画 1.5s
   → 动画结束后 navigate('/reveal')

5. 用户在 ReadingResult 逐个点击牌背
   → 每次点击 dispatch({ type: 'REVEAL_CARD', index: N })
   → CardFlip 组件检测到 revealedIndices 包含自己，播放翻转动画
   → 翻转后 CardFace 展示牌面数据

6. 全部翻开后 isComplete = true
   → 页面底部滑入综合解读卡片
   → generateReading() 被调用，传入 drawnCards + spread + question
   → AIHint 组件展示复制引导
```

### 6.2 数据流向规则

```
用户交互 → dispatch(action) → reducer 更新 state → 组件重新渲染
                ↑                                       │
                └──── useReading() hook 读取 ──────────┘
```

- **单向数据流**：state 只在 reducer 中修改
- **无副作用**：dispatch 驱动的流程中不调用 API（纯前端项目）
- **派生数据不存 state**：`isComplete` 通过计算 `revealedIndices.size === drawnCards.length` 得出，但仍存在 state 中避免重复计算

---

## 7. TypeScript 类型定义

见第 3.1 节。所有类型集中在 `src/types/index.ts`，其他文件通过 `import type` 引用。

---

## 8. 核心算法

### 8.1 Fisher-Yates 洗牌

```typescript
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];                    // 不修改原数组
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
```

时间复杂度 O(n)，真正随机（每个排列等概率）。

### 8.2 抽牌 + 正逆位

```typescript
export function drawCards(
  deck: TarotCard[],
  count: number,
  positions: SpreadPosition[]
): DrawnCard[] {
  const shuffled = shuffle(deck);
  return shuffled.slice(0, count).map((card, i) => ({
    card,
    isReversed: Math.random() > 0.5,     // 50% 概率逆位
    position: positions[i],
  }));
}
```

### 8.3 分析模板拼接

```typescript
export function generateReading(
  cards: DrawnCard[],
  spread: Spread,
  question?: string,
  optionA?: string,
  optionB?: string
): string {
  const counts = countCards(cards);
  const parts: string[] = [];

  // 1. 问题回顾（如有）
  if (question) {
    parts.push(`你询问的是：「${question}」。`);
  }

  // 2. 能量概述
  const energyText = getEnergyOverview(counts);
  parts.push(energyText);

  // 3. 逐位置解读
  for (const dc of cards) {
    const meaning = dc.isReversed
      ? dc.card.reversedMeaning
      : dc.card.uprightMeaning;
    const direction = dc.isReversed ? '逆位' : '正位';
    parts.push(
      `「${dc.position.label}」位置抽到了${direction}的「${dc.card.name}」——${meaning}。`
    );
  }

  // 4. 二选一特殊处理
  if (spread.id === 'two-paths' && optionA && optionB) {
    parts.push(getTwoPathsComparison(cards, optionA, optionB));
  }

  // 5. 建议收尾
  parts.push(getAdvice(counts));

  return parts.join('\n\n');
}
```

模板句来源于 `templates.ts` 中的词库：
- 能量概述模板：根据正位比例选不同句式
- 连接词：随机抽取避免重复
- 建议词库：根据正/逆位比例选不同风格的建议

---

## 9. 卡牌视觉方案

### 9.1 牌背（CardBack）

CSS 纯绘制，无图片资源：
- 深红底色 `#4a1525`
- 金色几何边框（`border: 2px solid #c9a050`）
- 居中星芒图案（`::before` `::after` 伪元素旋转十字 + `box-shadow` 做六芒星）
- 四角小装饰点
- 轻微圆角 `border-radius: 8px`

### 9.2 牌面（CardFace）

CSS + 内联 SVG：
- 羊皮纸色底 `#f5eedc`（模拟古典纸牌质感）
- 黑色细边框 + 金色外框
- **大阿卡纳**：顶部罗马数字 + 中央核心符号 SVG + 底部牌名
- **小阿卡纳**：
  - 顶部数字/宫廷牌标识
  - 中央按数量排列花色符号 SVG（小型，如圣杯三 = 3 个杯子图案）
  - 底部牌名
- **逆位标识**：牌名旁 ↻ 符号（`color: #c9a050`）

### 9.3 花色符号 SVG

四种花色各自一个可复用的 React 组件：
- `SuitCups` — 圣杯形状（宽口杯 + 水滴）
- `SuitSwords` — 宝剑形状（竖剑 + 护手）
- `SuitWands` — 权杖形状（长杖 + 枝叶）
- `SuitPentacles` — 星币形状（五角星内含圆）

每个 SVG 组件接受 `size` prop 控制大小，颜色统一用金色 `#c9a050`。

---

## 10. 代码规范

### 10.1 命名规范

| 项目 | 规则 | 示例 |
|------|------|------|
| 文件名 | kebab-case | `card-face.tsx`, `use-shuffle.ts` |
| 组件名 | PascalCase | `CardFace`, `SpreadLayout` |
| 函数/变量 | camelCase | `drawCards`, `revealedIndices` |
| 常量 | UPPER_SNAKE_CASE | `ALL_CARDS`, `MAX_CARD_COUNT` |
| 类型/接口 | PascalCase | `TarotCard`, `DrawnCard` |
| CSS Module class | camelCase | `.cardBack`, `.spreadGrid` |

### 10.2 文件组织

- 每个文件只导出一个主要函数/组件
- 类型定义集中在 `types/index.ts`，不在组件文件中定义
- 数据文件（`data/`）纯数据，不包含逻辑
- 工具函数（`utils/`）纯函数，不依赖 React
- Hooks（`hooks/`）只封装 React 逻辑
- 页面组件（`pages/`）组合 components 和 data，不写复杂逻辑

### 10.3 CSS Modules 规范

- 每个组件一个 `.module.css` 文件，与组件同目录
- 全局样式（颜色变量、reset、背景纹理）放 `styles/global.css`
- 全局动画关键帧放 `styles/animations.css`
- 组件样式不写全局选择器（`:global()` 仅用于第三方库覆盖）

```css
/* 示例：CardBack.module.css */
.back {
  background: var(--color-card-back);
  border: 2px solid var(--color-gold);
  border-radius: 8px;
  /* ... */
}
```

### 10.4 CSS 变量定义

```css
/* styles/global.css */
:root {
  --color-bg: #0d0d0d;
  --color-gold: #c9a050;
  --color-gold-light: #e0c878;
  --color-wine: #5c1a2a;
  --color-purple: #2a1a3c;
  --color-cream: #f5eedc;
  --color-text: #f5eedc;
  --color-text-dim: #a09080;
  --font-display: 'Playfair Display', 'Cormorant Garamond', serif;
  --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --shadow-gold: 0 0 20px rgba(201, 160, 80, 0.3);
}
```

### 10.5 ESLint + Prettier 配置

```json
// .eslintrc.cjs
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"                    // 关闭与 Prettier 冲突的规则
  ],
  "rules": {
    "react/react-in-jsx-scope": "off"  // Vite 不需要 import React
  }
}
```

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100
}
```

配置 `package.json` scripts：
```json
{
  "scripts": {
    "lint": "eslint src --ext .ts,.tsx",
    "format": "prettier --write src/**/*.{ts,tsx,css}",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

### 10.6 Git 规范

- **分支**：`master` 主分支，功能直接在 master 开发（单人项目）
- **Commit message**：英文，格式 `<type>: <description>`
  - `feat:` 新功能
  - `fix:` 修复
  - `style:` 样式调整
  - `refactor:` 重构
  - `docs:` 文档
  - `chore:` 配置/工具
  - 示例：`feat: add Fisher-Yates shuffle algorithm`

---

## 11. 非功能需求

### 11.1 性能目标

| 指标 | 目标值 | 策略 |
|------|--------|------|
| FCP（首次内容绘制） | < 1.5s | 无外部依赖，首屏只加载首页必要资源 |
| LCP（最大内容绘制） | < 2.5s | 字体用 `font-display: swap`，大 SVG 内联 |
| TBT（总阻塞时间） | < 200ms | 无重量级 JS，洗牌在主线程瞬时完成 |
| 翻牌动画 | 60fps | 仅用 CSS `transform`，不触发 layout |
| 总资源大小 | < 500KB（gzip < 200KB） | 无图片资源，纯 CSS/SVG，字体用系统备选 |

### 11.2 兼容性

| 平台 | 最低版本 |
|------|----------|
| iOS Safari | 15+ |
| Android Chrome | 90+ |
| Chrome (桌面) | 最新两个版本 |
| Firefox (桌面) | 最新两个版本 |
| Edge (桌面) | 最新两个版本 |

不兼容 IE。关键 CSS 属性（`backface-visibility`、`CSS Variables`、`grid`）在目标浏览器均支持。

### 11.3 可访问性

- 按钮和链接支持 `Tab` 键聚焦
- 翻牌支持 `Enter`/`Space` 键触发（`role="button"` + `tabIndex={0}` + `onKeyDown`）
- 颜色对比度 ≥ WCAG AA（金色 `#c9a050` 在黑底上对比度 3.2:1，仅用于装饰元素；正文用奶油白 `#f5eedc` 对比度 15:1）
- 装饰性 SVG 添加 `aria-hidden="true"`

### 11.4 隐私

- 100% 纯前端，用户问题不发送到任何服务器
- 无第三方分析工具、无 Cookie、无追踪
- AI 引导功能由用户**主动复制**信息到外部平台，非自动发送
- Service Worker 仅缓存静态资源，不收集任何数据

---

## 12. 构建与部署

### 12.1 Vite 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '塔罗指引',
        short_name: '塔罗指引',
        description: '在线塔罗牌抽牌 - 用心提问，牌面会给你答案',
        theme_color: '#0d0d0d',
        background_color: '#0d0d0d',
        display: 'standalone',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png}'],
        runtimeCaching: [
          {
            // 缓存 Google Fonts（如果使用）
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
          },
        ],
      },
    }),
  ],
});
```

### 12.2 构建命令

```bash
npm run dev       # 本地开发服务器（http://localhost:5173）
npm run build     # 生产构建（输出到 dist/）
npm run preview   # 本地预览生产构建
npm run test      # 运行单元测试
npm run lint      # ESLint 检查
npm run format    # Prettier 格式化
```

### 12.3 Vercel 部署流程（通俗说明）

**你需要做的**（一次性，约 2 分钟）：

1. 打开 [vercel.com](https://vercel.com)，点击「Sign Up」
2. 选择「Continue with GitHub」，用你的 GitHub 账号登录
3. 授权 Vercel 访问你的 GitHub 仓库
4. 在 Vercel 后台点击「Add New Project」→ 选择 `tarot` 仓库
5. 直接点「Deploy」，不需要修改任何配置
6. 等 30 秒构建完成，你会得到一个链接，比如 `tarot-guide.vercel.app`

**之后每次更新**：我修改代码 → `git push` → Vercel 自动重新部署（无需你做任何事）。

**分享给朋友**：把链接发给他们就行。他们用手机浏览器打开后。
- 点击浏览器的「添加到主屏幕」（iOS Safari 的分享按钮 → 添加到主屏幕）
- 就会像 App 一样出现在手机桌面，可以离线使用。

### 12.4 PWA 图标生成

图标文件需要手动准备：
- `public/icon-192.png` — 192×192px
- `public/icon-512.png` — 512×512px

内容为金色星月符号在深黑背景上，可以用 Figma 或在线工具生成。

---

## 附录：开发环境搭建

```bash
# 1. 创建项目
npm create vite@latest tarot -- --template react-ts
cd tarot

# 2. 安装依赖
npm install react-router-dom vite-plugin-pwa

# 3. 安装开发依赖
npm install -D vitest @testing-library/react eslint prettier \
  eslint-config-prettier @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser eslint-plugin-react eslint-plugin-react-hooks

# 4. 启动开发
npm run dev
```
