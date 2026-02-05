/**
 * System prompt safety guardrails.
 * Sanitizes user-provided system prompt content to prevent injection attacks
 * and harmful instructions.
 */

/**
 * Patterns that indicate potentially harmful or malicious system prompt content.
 */
const HARMFUL_PATTERNS = [
  // Jailbreak attempts
  /ignore\s+(previous|all|above|prior)\s+(instructions|prompts?|rules?|directives?)/gi,
  /forget\s+(everything|all|previous|above|prior)/gi,
  /disregard\s+(previous|all|above|prior)/gi,
  /you\s+are\s+now\s+(in\s+)?(developer|debug|admin|god|root)\s+mode/gi,
  /enable\s+(developer|debug|admin|god|root)\s+mode/gi,

  // Role confusion
  /you\s+are\s+(no\s+longer|not)\s+(an?\s+)?(assistant|ai|bot|clawdbot)/gi,
  /pretend\s+you\s+are\s+(a\s+)?(human|person|user)/gi,

  // Harmful instructions
  /write\s+(malicious|harmful|dangerous)\s+(code|script)/gi,
  /create\s+(malware|virus|exploit)/gi,
  /hack\s+(into|the|a)/gi,

  // Prompt leaking attempts
  /print\s+(your|the)\s+(system\s+)?(prompt|instructions)/gi,
  /show\s+(your|the)\s+(system\s+)?(prompt|instructions)/gi,
  /reveal\s+(your|the)\s+(system\s+)?(prompt|instructions)/gi,
  /what\s+(are|is)\s+your\s+(system\s+)?(prompt|instructions)/gi,
];

/**
 * Maximum length for user-provided system prompt additions.
 * Prevents excessively long prompts that could cause issues.
 */
const MAX_USER_PROMPT_LENGTH = 10000;

/**
 * Sanitize user-provided system prompt content.
 * Returns sanitized content and a flag indicating if modifications were made.
 */
export function sanitizeSystemPrompt(content: string): {
  sanitized: string;
  modified: boolean;
  warnings: string[];
} {
  if (!content) {
    return { sanitized: content, modified: false, warnings: [] };
  }

  let sanitized = content;
  const warnings: string[] = [];
  let modified = false;

  // Check length
  if (sanitized.length > MAX_USER_PROMPT_LENGTH) {
    sanitized = sanitized.slice(0, MAX_USER_PROMPT_LENGTH);
    warnings.push(`System prompt truncated to ${MAX_USER_PROMPT_LENGTH} characters`);
    modified = true;
  }

  // Check for harmful patterns
  for (const pattern of HARMFUL_PATTERNS) {
    if (pattern.test(sanitized)) {
      // Replace harmful content with placeholder
      const before = sanitized;
      sanitized = sanitized.replace(pattern, "[FILTERED]");
      if (sanitized !== before) {
        warnings.push("Potentially harmful content filtered from system prompt");
        modified = true;
      }
    }
  }

  // Remove control characters (except newlines, tabs, carriage returns)
  const beforeControl = sanitized;
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  if (sanitized !== beforeControl) {
    warnings.push("Control characters removed from system prompt");
    modified = true;
  }

  // Normalize excessive whitespace
  const beforeWhitespace = sanitized;
  sanitized = sanitized.replace(/\n{4,}/g, "\n\n\n"); // Max 3 consecutive newlines
  if (sanitized !== beforeWhitespace) {
    warnings.push("Excessive whitespace normalized");
    modified = true;
  }

  return { sanitized, modified, warnings };
}

/**
 * Validate that a system prompt is safe to use.
 * Returns validation result with any issues found.
 */
export function validateSystemPromptSafety(content: string): {
  safe: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  if (!content) {
    return { safe: true, issues: [] };
  }

  // Check for harmful patterns
  for (const pattern of HARMFUL_PATTERNS) {
    if (pattern.test(content)) {
      issues.push("System prompt contains potentially harmful patterns");
      break; // Only report once
    }
  }

  // Check for excessive length
  if (content.length > MAX_USER_PROMPT_LENGTH) {
    issues.push(`System prompt exceeds maximum length (${MAX_USER_PROMPT_LENGTH} characters)`);
  }

  // Check for control characters
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(content)) {
    issues.push("System prompt contains control characters");
  }

  return {
    safe: issues.length === 0,
    issues,
  };
}

/**
 * Apply safety guardrails to user-provided system prompt.
 * This is the main entry point for sanitizing system prompts before use.
 */
export function applySystemPromptGuardrails(content: string | undefined): {
  content: string;
  applied: boolean;
  warnings: string[];
} {
  if (!content) {
    return { content: "", applied: false, warnings: [] };
  }

  const { sanitized, modified, warnings } = sanitizeSystemPrompt(content);

  return {
    content: sanitized,
    applied: modified,
    warnings,
  };
}
