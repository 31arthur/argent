/**
 * Confidence Level Enum
 * Represents the confidence level of extracted fields
 * 
 * MAPPING TO NUMERIC:
 * - HIGH: 0.9 - Explicitly stated in user message
 * - MEDIUM: 0.6 - Inferred with context
 * - LOW: 0.3 - Weak inference or default
 */
export enum ConfidenceLevel {
    /**
     * High confidence - Explicitly stated
     */
    HIGH = 'HIGH',

    /**
     * Medium confidence - Inferred with context
     */
    MEDIUM = 'MEDIUM',

    /**
     * Low confidence - Weak inference
     */
    LOW = 'LOW',
}

/**
 * Map confidence level to numeric value
 * 
 * @param level - Confidence level
 * @returns Numeric confidence (0-1)
 */
export function mapConfidenceToNumeric(level: ConfidenceLevel): number {
    switch (level) {
        case ConfidenceLevel.HIGH:
            return 0.9;
        case ConfidenceLevel.MEDIUM:
            return 0.6;
        case ConfidenceLevel.LOW:
            return 0.3;
    }
}
