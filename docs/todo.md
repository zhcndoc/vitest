# 移除 UnoCSS - 迁移完成

UnoCSS 在 CI 中导致 OOM（内存溢出）。已完全移除并替换为 `@iconify/vue` + 普通 CSS。

## 摘要

- 从 `vite.config.ts` 中移除了 UnoCSS 插件
- 从 `theme/index.ts` 中移除了 `uno.css` 导入
- 添加了 `@iconify/vue` 用于图标
- 将所有 UnoCSS 工具类转换为作用域 CSS

## 已完成

- [x] `vite.config.ts` - 移除了 UnoCSS 插件
- [x] `theme/index.ts` - 移除了 `import 'uno.css'`
- [x] `CRoot.vue` - @iconify/vue + CSS
- [x] `ListItem.vue` - @iconify/vue + CSS（spinner、checkmark、close 图标）
- [x] `CourseLink.vue` - @iconify/vue + CSS
- [x] `FeaturesList.vue` - 普通 CSS
- [x] `Advanced.vue` - 普通 CSS
- [x] `Experimental.vue` - 普通 CSS

## 测试页面

- `/guide/features` - FeaturesList, ListItem, CourseLink
- `/config/projects` - CRoot
- `/api/advanced/vitest` - Experimental

## 未使用（跳过）

- `HomePage.vue` - 在新主题中未使用
