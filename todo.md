# 塔罗指引 — 开发任务清单

> 版本：v1.1 | 日期：2026-07-22 | 状态：代码迁移完成，待端到端验证
> 需求基线：[PRD.md](./PRD.md) · 架构基线：[architecture.md](./architecture.md)

状态：🔴 未开始 / 🟡 进行中 / 🟢 已完成

---

## 🟢 Phase 1：项目脚手架 + 依赖配置

**Commit**: `feat: Phase 1 - project scaffold with Vite + React + TypeScript`

- [x] Vite + React 19 + TypeScript 项目创建
- [x] Tailwind CSS 4 + PostCSS 配置
- [x] React Router v7 安装
- [x] ESLint + Prettier 配置
- [x] Vitest + Testing Library 配置
- [x] 目录结构建立
- [x] `npm run dev` 启动成功
- [x] `npm run build` 构建成功
- [x] `npm run lint` 通过
- [x] `npm run typecheck` 零错误

---

## 🟢 Phase 2：类型定义 + 78 张牌数据

**Commit**: (随迁移一起提交)

- [x] `lib/types.ts` — 完整类型定义（Suit, TarotCard, Spread, DrawnCard, ReadingState 等）
- [x] `lib/data/cards.ts` — 78 张牌完整数据（22 大阿卡纳 + 56 小阿卡纳）
- [x] `lib/data/categories.ts` — 6 类问题领域
- [x] `lib/data/spreads.ts` — 3 个牌阵定义
- [x] `lib/data/minorNarratives.ts` — 小阿卡纳叙述数据
- [x] 数据校验器 `validateDeck()` 和 `validateSpreads()`
- [x] 数据校验测试通过（9 个）

---

## 🟢 Phase 3：抽牌算法 + 解读引擎

- [x] `lib/engine/draw.ts` — Fisher-Yates 洗牌 + 正逆位随机
- [x] `lib/engine/analysis.ts` — 结构化解读引擎（8 种关系规则）
- [x] `lib/engine/formatReading.ts` — 复制文本格式化
- [x] `lib/engine/validation.ts` — 数据门禁校验
- [x] 抽牌测试通过（4 个）
- [x] 分析引擎测试通过（13 个）
- [x] 内容审核测试通过（2 个）

---

## 🟢 Phase 4：状态管理 + 会话恢复

- [x] `lib/state/readingReducer.ts` — Reducer + State 定义
- [x] `lib/storage/sessionReading.ts` — sessionStorage 管理
- [x] `context/ReadingContext.tsx` — React Context 封装
- [x] Reducer 测试通过（5 个）
- [x] Session 存储测试通过（3 个）

---

## 🟢 Phase 5：组件

- [x] `CardBack.tsx` — 牌背图案
- [x] `CardFace.tsx` — 牌面插画层
- [x] `CardDetail.tsx` — 牌名/正逆位/关键词
- [x] `TarotCardButton.tsx` — 翻牌按钮（受控组件）
- [x] `QuestionForm.tsx` — 问题表单（领域选择 + 输入 + 校验）
- [x] `ReadingExperience.tsx` — 核心阅读流程（洗牌→翻牌→结果）
- [x] `CopyButton.tsx` — 剪贴板复制
- [x] `PwaStatus.tsx` — 离线/更新状态提示
- [x] 组件测试通过（pwaAndCopy: 8, tarotCardButton: 2, readingExperience: 6）

---

## 🟢 Phase 6：页面 + 路由

- [x] `HomePage.tsx` — 首页（产品介绍 + 牌组展示）
- [x] `SpreadSelect.tsx` — 牌阵选择
- [x] `QuestionInput.tsx` — 问题输入（useParams 获取 spreadId）
- [x] `ReadingPage.tsx` — 阅读结果页
- [x] `routes.tsx` — React Router 路由表
- [x] `App.tsx` — ReadingProvider + BrowserRouter + PwaStatus
- [x] 从 Next.js App Router 成功适配为 React Router
- [x] `npm run build` 零错误

---

## 🟢 Phase 7：插画 + 视觉 + PWA

- [x] 78 张几何黑金 SVG 插画（public/cards/）
- [x] `global.css` — Tailwind CSS 4 + 设计 tokens + 响应式布局
- [x] PWA manifest + Service Worker + 图标
- [x] apple-touch-icon、主题色配置
- [x] 深黑/金色/奶油白色配色系统
- [x] 字体：衬线 Palatino/Noto Serif SC
- [x] 产品文案测试通过
- [x] 无障碍样式测试通过

---

## 🟡 Phase 8：最终验证与发布

- [x] `npm run build` 构建成功（JS gzip 98KB, CSS gzip 8KB）
- [x] `npm run test` 全部 55 个测试通过
- [x] `npm run typecheck` 零 TypeScript 错误
- [x] 代码已提交 GitHub
- [ ] 浏览器手动验证 3 个牌阵完整流程
- [ ] 移动端验证（六芒星缩略布局、触控翻牌）
- [ ] PWA 安装测试
- [ ] 离线流程验证
- [ ] Lighthouse 性能审计
- [ ] Vercel 部署

---

## ⚪ 后续迭代

- [ ] 分享卡片生成
- [ ] 每日单张反思牌
- [ ] 本地历史记录
- [ ] 更多牌阵
- [ ] 多语言支持
