---
summary: "Apply multi-file patches with the apply_patch tool"
read_when:
  - You need structured file edits across multiple files
  - You want to document or debug patch-based edits
---

# apply_patch 工具

使用结构化的补丁格式来应用文件更改。这适用于多文件或多个补丁块的编辑，因为在这些情况下，单个 `edit` 调用可能会变得不稳定。

该工具接受一个单一的 `input` 字符串，用于包裹一个或多个文件操作：

*** Begin Patch
*** Add File: path/to/file.txt
+line 1
+line 2
*** Update File: src/app.ts
@@
-old line
+new line
*** Delete File: obsolete.txt
*** End Patch
``````
## 参数

- `input` (必填): 包含 `*** Begin Patch` 和 `*** End Patch` 的完整补丁内容。

## 说明

- 路径是相对于工作区根目录解析的。
- 在 `*** Update File:` 的块中使用 `*** Move to:` 来重命名文件。
- `*** End of File` 在需要时标记一个仅EOF的插入。
- 实验性功能，默认情况下已禁用。通过 `tools.exec.applyPatch.enabled` 启用。
- 仅适用于 OpenAI（包括 OpenAI Codex）。可通过 `tools.exec.applyPatch.allowModels` 选择性地根据模型进行限制。
- 配置仅在 `tools.exec` 下。```json
{
  "tool": "apply_patch",
  "input": "*** Begin Patch\n*** Update File: src/index.ts\n@@\n-const foo = 1\n+const foo = 2\n*** End Patch"
}
```
