# 塔罗牌在线抽牌 — 开发任务清单

> 每个 Phase 完成后 git commit。状态：🔴 未开始 / 🟡 进行中 / 🟢 已完成

---

## 🟡 Phase 1：项目脚手架

**Commit**: `feat: Phase 1 - project scaffold with Vite + React + TypeScript`

- [ ] `npm run dev` 启动成功，浏览器访问 `localhost:5173` 看到页面
- [ ] `npm run lint` 无报错
- [ ] `npm run format` 无格式变更
- [ ] 目录结构与 architecture.md 第 2 节一致

---

## 🔴 Phase 2：类型定义 + 78 张牌数据

**Commit**: `feat: Phase 2 - type definitions and 78 tarot card data`

- [ ] TypeScript 编译无错误（`npx tsc --noEmit`）
- [ ] `cards` 数组长度为 78
- [ ] 前 22 张 `type === 'major'`，后 56 张 `type === 'minor'`
- [ ] 所有 `uprightMeaning` 和 `reversedMeaning` ≤ 30 字
- [ ] 所有牌 ID 不重复

---

## 🔴 Phase 3：牌阵数据 + 工具函数 + 单元测试

**Commit**: `feat: Phase 3 - spread definitions and utility functions with tests`

- [ ] `npm run test` 全部通过
- [ ] `shuffle.test.ts`：洗牌不改变长度、不丢失元素、不修改原数组、随机性验证
- [ ] `shuffle.test.ts`：`drawCards` 返回指定数量、每张牌绑定 position、isReversed 有 true 和 false
- [ ] `analysis.test.ts`：`countCards` 统计准确、`generateReading` 输出包含牌名和位置名
- [ ] `analysis.test.ts`：有 question 时输出包含问题文本、无 question 时不包含
- [ ] `clipboard.test.ts`：模拟 `navigator.clipboard.writeText` 正确调用

---

## 🔴 Phase 4：状态管理

**Commit**: `feat: Phase 4 - reading state management with Context + Reducer`

- [ ] `SELECT_SPREAD` → spread 更新，step 变为 `'question'`
- [ ] `SET_QUESTION` → question/optionA/optionB 更新，step 变为 `'draw'`
- [ ] `DRAW_CARDS` → drawnCards 更新，step 变为 `'reveal'`
- [ ] `REVEAL_CARD` → revealedIndices 增加该 index，全部翻开后 isComplete 为 true
- [ ] `RESET` → 回到 initialState
- [ ] `useReading` hook 在 Provider 外调用时抛出明确错误

---

## 🔴 Phase 5：核心组件

**Commit**: `feat: Phase 5 - core components (cards, layout, particles)`

- [ ] `Layout` 在浏览器中显示深黑背景 + 金色边框，内容区居中 max-width 800px
- [ ] `CardBack` 显示星芒几何图案，纯 CSS 无图片
- [ ] `CardFace` 正位时无 ↻ 标记，逆位时牌名旁显示 ↻
- [ ] `CardFlip` 点击后 3D 翻转 0.5s，牌背→牌面，再次点击不回翻
- [ ] `SpreadLayout` linear 模式 3 张横排、hexagram 模式 7 张六芒星排列、two-paths 模式分叉两路
- [ ] `GoldParticles` 粒子循环飘浮不卡顿（60fps）
- [ ] `CopyButton` 点击后文案变为「已复制 ✓」，1.5s 后恢复
- [ ] `AIHint` 拼接文本包含牌阵名、每张牌的牌名和正逆位

---

## 🔴 Phase 6：页面 + 路由

**Commit**: `feat: Phase 6 - pages and routing with full reading flow`

- [ ] 完整流程可走通：首页 → 选三张牌 → 输入问题 → 抽牌 → 逐张翻牌 → 看到综合分析
- [ ] 二选一牌阵时，QuestionInput 额外显示选项 A/B 输入框（必填校验）
- [ ] 直接访问 `/reveal` 但无 drawnCards 时，自动重定向到 `/select`
- [ ] 直接访问 `/question` 但无 spread 时，自动重定向到 `/select`
- [ ] 「重新占卜」按钮 → dispatch RESET + navigate `/select`
- [ ] 3 个牌阵各自走通一遍

---

## 🔴 Phase 7：样式系统 + SVG 花色

**Commit**: `style: Phase 7 - golden-black theme, wool texture, suit SVGs`

- [ ] 页面整体呈现深黑底色 + 金色元素 + 羊毛毯背景纹理（视觉走查）
- [ ] 标题使用衬线字体 Playfair Display，正文使用系统无衬线字体
- [ ] 4 个花色 SVG 图形清晰可辨，颜色统一金色 `#c9a050`
- [ ] 移动端（375px 宽）布局正常，牌阵不溢出
- [ ] 桌面端（>1024px）居中容器 max-width 800px
- [ ] 翻牌动画流畅（60fps），无卡顿
- [ ] 呼吸脉冲动画在未翻牌背面可见

---

## 🔴 Phase 8：PWA + 最终集成测试

**Commit**: `feat: Phase 8 - PWA setup and final integration`

- [ ] `npm run build` 成功，`dist/` 产物完整无报错
- [ ] `npm run preview` 可正常访问，功能完整
- [ ] `npm run test` 全部通过（回归 Phase 3 的单元测试）
- [ ] Chrome DevTools → Application → Manifest 显示完整信息
- [ ] Chrome DevTools → Lighthouse → PWA 评分 ≥ 90
- [ ] Lighthouse Performance ≥ 90
- [ ] 手机浏览器打开，可「添加到主屏幕」
- [ ] PWA 离线模式可打开首页（Service Worker 缓存生效）
