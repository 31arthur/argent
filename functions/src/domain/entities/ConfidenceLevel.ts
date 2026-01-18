/**
 * Confidence Level Enum
 * Represents extraction confidence from Gemini
 */
export enum ConfidenceLevel {
    HIGH = 'HIGH',
    MEDIUM = 'MEDIUM',
    LOW = 'LOW',
}

/**
 * Map confidence level to numeric value
 */
export function mapConfidenceToNumeric(level: ConfidenceLevel | string): number {
    switch (level) {
        case ConfidenceLevel.HIGH:
        case 'HIGH':
            return 0.9;
        case ConfidenceLevel.MEDIUM:
        case 'MEDIUM':
            return 0.6;
        case ConfidenceLevel.LOW:
        case 'LOW':
            return 0.3;
        default:
            return 0.5;
    }
}
