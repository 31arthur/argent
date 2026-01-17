/**
 * Gemini Validation Error Type
 */
export type GeminiValidationErrorType =
    | 'MALFORMED_JSON'
    | 'INVALID_SCHEMA'
    | 'INVALID_TYPE'
    | 'UNKNOWN_KEY'
    | 'HALLUCINATED_ENUM';

/**
 * Gemini Validation Error
 * Error type for Gemini validation failures
 * 
 * TYPES:
 * - MALFORMED_JSON: Response is not valid JSON
 * - INVALID_SCHEMA: Missing required keys or wrong structure
 * - INVALID_TYPE: Field has wrong type (e.g., string amount)
 * - UNKNOWN_KEY: Response contains unknown keys
 * - HALLUCINATED_ENUM: Enum value not in allowed set
 */
export class GeminiValidationError extends Error {
    public readonly type: GeminiValidationErrorType;
    public readonly field?: string;
    public readonly receivedValue?: unknown;

    constructor(
        type: GeminiValidationErrorType,
        message: string,
        field?: string,
        receivedValue?: unknown
    ) {
        super(message);
        this.name = 'GeminiValidationError';
        this.type = type;
        this.field = field;
        this.receivedValue = receivedValue;
    }
}
