```ts
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    // "test.workspace" 现在是 "test.projects"
    workspace: [ // [!code --]
    projects: [ // [!code ++]
      { test: { name: "Unit" } },
      { test: { name: "Integration" } },
    ],
  },
});
```
