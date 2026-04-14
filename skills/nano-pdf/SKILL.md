---
name: nano-pdf
description: "Edit PDF files using natural-language instructions via the nano-pdf CLI. Use when the user wants to modify a PDF page, fix a typo in a PDF, change text in a slide deck, or apply any text edit to a specific PDF page."
homepage: https://pypi.org/project/nano-pdf/
metadata: {"clawdbot":{"emoji":"📄","requires":{"bins":["nano-pdf"]},"install":[{"id":"uv","kind":"uv","package":"nano-pdf","bins":["nano-pdf"],"label":"Install nano-pdf (uv)"}]}}
---

# nano-pdf

Use `nano-pdf` to apply natural-language edits to a specific page in a PDF.

## Syntax

```bash
nano-pdf edit <file.pdf> <page> "<instruction>"
```

## Examples

```bash
# Fix text on page 1
nano-pdf edit deck.pdf 1 "Change the title to ‘Q3 Results’ and fix the typo in the subtitle"

# Update a specific page
nano-pdf edit report.pdf 3 "Replace ‘TBD’ with ‘42%’ in the summary section"
```

## Notes

- Page numbers may be 0-based or 1-based depending on version; if the result looks off by one, retry with the other index.
- Always verify the output PDF before sending it out.
- Edits apply to one page at a time; run multiple commands for multi-page changes.
