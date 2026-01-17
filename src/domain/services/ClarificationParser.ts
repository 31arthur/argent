/**
 * Simple Clarification Parser
 * Parses user responses for clarification questions
 * 
 * NOTE: This is a simple parser for handling clarification responses.
 * For initial extraction, use GeminiExtractionService.
 */
export class ClarificationParser {
    /**
     * Parse user response for clarification
     * 
     * @param message - User response
     * @param field - Field being clarified
     * @returns Parsed value
     */
    static parse(message: string, field: string): unknown {
        const lowerMessage = message.toLowerCase().trim();

        switch (field) {
            case 'amount':
                // Extract number
                const amountMatch = message.match(/\d+(\.\d{2})?/);
                return amountMatch ? parseFloat(amountMatch[0]) : null;

            case 'type':
                // Parse type
                if (
                    lowerMessage.includes('income') ||
                    lowerMessage.includes('received') ||
                    lowerMessage.includes('earned')
                ) {
                    return 'INCOME';
                } else if (
                    lowerMessage.includes('expense') ||
                    lowerMessage.includes('spent') ||
                    lowerMessage.includes('paid')
                ) {
                    return 'EXPENSE';
                }
                return null;

            case 'purpose':
                // Use message as purpose
                return message.trim();

            case 'date':
                // Parse date
                if (lowerMessage === 'today') {
                    return new Date();
                } else if (lowerMessage === 'yesterday') {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    return yesterday;
                }
                // Try to parse as date
                const parsedDate = new Date(message);
                return isNaN(parsedDate.getTime()) ? null : parsedDate;

            default:
                // For poolId, categoryId - return as-is (will be validated)
                return message.trim();
        }
    }
}
