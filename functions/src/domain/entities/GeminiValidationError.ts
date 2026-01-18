/**
 * Gemini Validation Error
 * Thrown when Gemini response fails validation
 */
export class GeminiValidationError extends Error {
    constructor(
        public readonly code: 'MALFORMED_JSON' | 'INVALID_SCHEMA' | 'INVALID_TYPE' | 'HALLUCINATED_ENUM' | 'UNKNOWN_KEY',
        message: string,
        public readonly field?: string,
        public readonly value?: unknown
    ) {
        super(message);
        this.name = 'GeminiValidationError';
    }
}
