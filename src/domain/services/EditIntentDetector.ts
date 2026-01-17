import type { TransactionData } from '@/domain/value-objects/TransactionData';

/**
 * Edit Intent
 * Represents user's intention to edit a specific field
 */
export interface EditIntent {
    /**
     * Field to be edited
     */
    field: keyof TransactionData;

    /**
     * Raw value to be extracted
     */
    newValue: string;
}

/**
 * Edit Intent Detector
 * Detects which field(s) user wants to edit based on their message
 * 
 * PURPOSE:
 * - Parse user edit requests
 * - Identify target field
 * - Extract raw value for targeted extraction
 * 
 * RULES:
 * - Returns null if intent is unclear
 * - Prioritizes explicit field mentions
 * - Uses keyword matching for detection
 * 
 * EXAMPLES:
 * - "change amount to 150" → { field: 'amount', newValue: '150' }
 * - "it was cash not SBI" → { field: 'poolId', newValue: 'cash' }
 * - "category should be snacks" → { field: 'categoryId', newValue: 'snacks' }
 * - "that was yesterday" → { field: 'date', newValue: 'yesterday' }
 */
export class EditIntentDetector {
    /**
     * Detect edit intent from user message
     * 
     * @param message - User message
     * @returns Edit intent or null if unclear
     */
    detect(message: string): EditIntent | null {
        const lowerMessage = message.toLowerCase().trim();

        // Amount keywords
        if (this.matchesAmountEdit(lowerMessage)) {
            const newValue = this.extractAmountValue(lowerMessage);
            if (newValue) {
                return { field: 'amount', newValue };
            }
        }

        // Pool keywords
        if (this.matchesPoolEdit(lowerMessage)) {
            const newValue = this.extractPoolValue(lowerMessage);
            if (newValue) {
                return { field: 'poolId', newValue };
            }
        }

        // Category keywords
        if (this.matchesCategoryEdit(lowerMessage)) {
            const newValue = this.extractCategoryValue(lowerMessage);
            if (newValue) {
                return { field: 'categoryId', newValue };
            }
        }

        // Date keywords
        if (this.matchesDateEdit(lowerMessage)) {
            const newValue = this.extractDateValue(lowerMessage);
            if (newValue) {
                return { field: 'date', newValue };
            }
        }

        // Purpose keywords
        if (this.matchesPurposeEdit(lowerMessage)) {
            const newValue = this.extractPurposeValue(lowerMessage);
            if (newValue) {
                return { field: 'purpose', newValue };
            }
        }

        // Type keywords
        if (this.matchesTypeEdit(lowerMessage)) {
            const newValue = this.extractTypeValue(lowerMessage);
            if (newValue) {
                return { field: 'type', newValue };
            }
        }

        // Notes keywords
        if (this.matchesNotesEdit(lowerMessage)) {
            const newValue = this.extractNotesValue(lowerMessage);
            if (newValue) {
                return { field: 'notes', newValue };
            }
        }

        // Could not detect intent
        return null;
    }

    // ==================== Amount Detection ====================

    private matchesAmountEdit(message: string): boolean {
        const keywords = [
            'change amount',
            'amount to',
            'amount is',
            'amount was',
            'it was',
            'actually',
            'correct amount',
            'should be'
        ];
        return keywords.some(keyword => message.includes(keyword));
    }

    private extractAmountValue(message: string): string | null {
        // Match patterns like "150", "₹150", "Rs 150", "150 rupees"
        const patterns = [
            /(?:to|is|was|be)\s+(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)/i,
            /(?:₹|rs\.?|inr)\s*(\d+(?:\.\d+)?)/i,
            /(\d+(?:\.\d+)?)\s*(?:rupees|rs|inr)/i,
            /(\d+(?:\.\d+)?)/
        ];

        for (const pattern of patterns) {
            const match = message.match(pattern);
            if (match) {
                return match[1];
            }
        }

        return null;
    }

    // ==================== Pool Detection ====================

    private matchesPoolEdit(message: string): boolean {
        const keywords = [
            'cash pool',
            'wallet',
            'account',
            'from',
            'pool',
            'it was',
            'change to',
            'not'
        ];
        return keywords.some(keyword => message.includes(keyword));
    }

    private extractPoolValue(message: string): string | null {
        // Match patterns like "cash", "SBI", "main wallet"
        const patterns = [
            /(?:to|from|was|is)\s+([a-z0-9\s]+?)(?:\s+not|\s+wallet|\s+account|$)/i,
            /(?:cash|wallet|account|pool)\s+([a-z0-9\s]+)/i,
            /not\s+([a-z0-9\s]+)/i
        ];

        for (const pattern of patterns) {
            const match = message.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }

        return null;
    }

    // ==================== Category Detection ====================

    private matchesCategoryEdit(message: string): boolean {
        const keywords = [
            'category',
            'change to',
            'should be',
            'it was',
            'for'
        ];
        return keywords.some(keyword => message.includes(keyword));
    }

    private extractCategoryValue(message: string): string | null {
        // Match patterns like "groceries", "snacks", "food"
        const patterns = [
            /category\s+(?:to|is|was|be)\s+([a-z0-9\s]+)/i,
            /(?:to|is|was|be)\s+([a-z0-9\s]+?)(?:\s+category|$)/i,
            /for\s+([a-z0-9\s]+)/i
        ];

        for (const pattern of patterns) {
            const match = message.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }

        return null;
    }

    // ==================== Date Detection ====================

    private matchesDateEdit(message: string): boolean {
        const keywords = [
            'yesterday',
            'today',
            'date',
            'when',
            'on',
            'was'
        ];
        return keywords.some(keyword => message.includes(keyword));
    }

    private extractDateValue(message: string): string | null {
        // Match patterns like "yesterday", "today", "last week", "Jan 15"
        const patterns = [
            /(yesterday|today|tomorrow)/i,
            /(?:date|on|was)\s+([a-z0-9\s,]+)/i,
            /(last\s+\w+|this\s+\w+|next\s+\w+)/i
        ];

        for (const pattern of patterns) {
            const match = message.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }

        return null;
    }

    // ==================== Purpose Detection ====================

    private matchesPurposeEdit(message: string): boolean {
        const keywords = [
            'description',
            'purpose',
            'for',
            'change description',
            'change purpose'
        ];
        return keywords.some(keyword => message.includes(keyword));
    }

    private extractPurposeValue(message: string): string | null {
        // Match patterns like "for groceries", "description is shopping"
        const patterns = [
            /(?:description|purpose)\s+(?:to|is|was|be)\s+(.+)/i,
            /for\s+(.+)/i
        ];

        for (const pattern of patterns) {
            const match = message.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }

        return null;
    }

    // ==================== Type Detection ====================

    private matchesTypeEdit(message: string): boolean {
        const keywords = [
            'income',
            'expense',
            'type',
            'change to'
        ];
        return keywords.some(keyword => message.includes(keyword));
    }

    private extractTypeValue(message: string): string | null {
        // Match patterns like "income", "expense"
        const patterns = [
            /(income|expense)/i,
            /type\s+(?:to|is|was|be)\s+(income|expense)/i
        ];

        for (const pattern of patterns) {
            const match = message.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }

        return null;
    }

    // ==================== Notes Detection ====================

    private matchesNotesEdit(message: string): boolean {
        const keywords = [
            'notes',
            'note',
            'add note',
            'change note'
        ];
        return keywords.some(keyword => message.includes(keyword));
    }

    private extractNotesValue(message: string): string | null {
        // Match patterns like "add note: something", "notes: something"
        const patterns = [
            /(?:notes?|add note)\s*:?\s*(.+)/i
        ];

        for (const pattern of patterns) {
            const match = message.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }

        return null;
    }
}
