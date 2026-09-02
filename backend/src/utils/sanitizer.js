// Input/output sanitization for AI interactions

// Sanitize user input before sending to AI
// Removes prompt injection attempts, HTML tags, and control characters
export const sanitizeAIInput = (input) => {
    if (typeof input !== 'string') return '';

    return input
        // Remove code block delimiters (prompt injection)
        .replace(/```/g, '')
        // Remove horizontal rules
        .replace(/---/g, '')
        // Remove role markers like "system:" or "assistant:"
        .replace(/\b(system|assistant)\s*:/gi, '')
        // Strip HTML tags
        .replace(/<[^>]*>/g, '')
        // Remove control characters (keep newlines and tabs)
        /* eslint-disable-next-line no-control-regex */
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        // Limit to 10K characters
        .substring(0, 10000)
        .trim();
};

// Sanitize AI output before sending to client
// HTML-encodes dangerous characters to prevent XSS
export const sanitizeAIOutput = (output) => {
    if (typeof output !== 'string') return '';

    return output
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .trim();
};

export default { sanitizeAIInput, sanitizeAIOutput };
