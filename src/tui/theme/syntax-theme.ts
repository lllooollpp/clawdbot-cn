import { baseChalk } from "./chalk.js";

type HighlightTheme = Record<string, (text: string) => string>;

/**
 * Syntax highlighting theme for code blocks.
 * Uses chalk functions to style different token types.
 */
export function createSyntaxTheme(fallback: (text: string) => string): HighlightTheme {
  return {
    keyword: baseChalk.hex("#C586C0"), // purple - if, const, function, etc.
    built_in: baseChalk.hex("#4EC9B0"), // teal - console, Math, etc.
    type: baseChalk.hex("#4EC9B0"), // teal - types
    literal: baseChalk.hex("#569CD6"), // blue - true, false, null
    number: baseChalk.hex("#B5CEA8"), // green - numbers
    string: baseChalk.hex("#CE9178"), // orange - strings
    regexp: baseChalk.hex("#D16969"), // red - regex
    symbol: baseChalk.hex("#B5CEA8"), // green - symbols
    class: baseChalk.hex("#4EC9B0"), // teal - class names
    function: baseChalk.hex("#DCDCAA"), // yellow - function names
    title: baseChalk.hex("#DCDCAA"), // yellow - titles/names
    params: baseChalk.hex("#9CDCFE"), // light blue - parameters
    comment: baseChalk.hex("#6A9955"), // green - comments
    doctag: baseChalk.hex("#608B4E"), // darker green - jsdoc tags
    meta: baseChalk.hex("#9CDCFE"), // light blue - meta/preprocessor
    "meta-keyword": baseChalk.hex("#C586C0"), // purple
    "meta-string": baseChalk.hex("#CE9178"), // orange
    section: baseChalk.hex("#DCDCAA"), // yellow - sections
    tag: baseChalk.hex("#569CD6"), // blue - HTML/XML tags
    name: baseChalk.hex("#9CDCFE"), // light blue - tag names
    attr: baseChalk.hex("#9CDCFE"), // light blue - attributes
    attribute: baseChalk.hex("#9CDCFE"), // light blue - attributes
    variable: baseChalk.hex("#9CDCFE"), // light blue - variables
    bullet: baseChalk.hex("#D7BA7D"), // gold - list bullets in markdown
    code: baseChalk.hex("#CE9178"), // orange - inline code
    emphasis: baseChalk.italic, // italic
    strong: baseChalk.bold, // bold
    formula: baseChalk.hex("#C586C0"), // purple - math
    link: baseChalk.hex("#4EC9B0"), // teal - links
    quote: baseChalk.hex("#6A9955"), // green - quotes
    addition: baseChalk.hex("#B5CEA8"), // green - diff additions
    deletion: baseChalk.hex("#F44747"), // red - diff deletions
    "selector-tag": baseChalk.hex("#D7BA7D"), // gold - CSS selectors
    "selector-id": baseChalk.hex("#D7BA7D"), // gold
    "selector-class": baseChalk.hex("#D7BA7D"), // gold
    "selector-attr": baseChalk.hex("#D7BA7D"), // gold
    "selector-pseudo": baseChalk.hex("#D7BA7D"), // gold
    "template-tag": baseChalk.hex("#C586C0"), // purple
    "template-variable": baseChalk.hex("#9CDCFE"), // light blue
    default: fallback, // fallback to code color
  };
}
