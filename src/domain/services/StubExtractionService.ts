import type { TransactionData } from '@/domain/value-objects/TransactionData';

/**
 * Extraction Result
 * Result of stub extraction from user message
 */
export interface ExtractionResult {
    /**
     * Extracted fields (partial)
     */
    fields: Partial<TransactionData>;

    /**
     * Confidence scores for each extracted field
     */
    confidence: Record<string, number>;
}

/**
 * Stub Extraction Service
 * Placeholder for Gemini-based extraction
 * 
 * PURPOSE:
 * - Provide deterministic extraction for testing
 * - Define extraction contract for Gemini integration
 * - Enable orchestrator development without AI dependency
 * 
 * CURRENT IMPLEMENTATION:
 * - Rule-based keyword matching
 * - Low confidence scores (0.3)
 * - Will be replaced with Gemini integration
 * 
 * EXTRACTION RULES:
 * - Amount: Regex for numbers (/\d+(\.\d{2})?/)
 * - Type: "spent", "paid" → EXPENSE; "received", "earned" → INCOME
 * - Category hints: "groceries", "food" → Food category
 * - Purpose: Use original message if no specific purpose found
 * - Date: Default to today
 */
export class StubExtractionService {
    /**
     * Extract transaction data from user message
     * 
     * @param message - User message
     * @returns Extraction result with fields and confidence
     */
    extract(message: string): ExtractionResult {
        const fields: Partial<TransactionData> = {};
        const confidence: Record<string, number> = {};

        const lowerMessage = message.toLowerCase();

        // Extract amount
        const amountMatch = message.match(/\d+(\.\d{2})?/);
        if (amountMatch) {
            fields.amount = parseFloat(amountMatch[0]);
            confidence.amount = 0.3; // Low confidence for stub extraction
        }

        // Extract type
        if (
            lowerMessage.includes('spent') ||
            lowerMessage.includes('paid') ||
            lowerMessage.includes('expense')
        ) {
            fields.type = 'EXPENSE';
            confidence.type = 0.3;
        } else if (
            lowerMessage.includes('received') ||
            lowerMessage.includes('earned') ||
            lowerMessage.includes('income')
        ) {
            fields.type = 'INCOME';
            confidence.type = 0.3;
        }

        // Extract purpose (use original message as fallback)
        // In real implementation, Gemini would extract meaningful purpose
        fields.purpose = message;
        confidence.purpose = 0.2; // Very low confidence for raw message

        // Default date to today
        fields.date = new Date();
        confidence.date = 0.5; // Medium confidence for default

        return {
            fields,
            confidence,
        };
    }

    /**
     * Parse user response for clarification
     * 
     * @param message - User response
     * @param field - Field being clarified
     * @returns Parsed value
     */
    parseClarificationResponse(message: string, field: string): unknown {
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
