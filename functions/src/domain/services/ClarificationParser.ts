/**
 * Clarification Parser
 * Parses user responses for clarification questions
 */
export class ClarificationParser {
    static parse(message: string, field: string): unknown {
        const lowerMessage = message.toLowerCase().trim();

        switch (field) {
            case 'amount':
                const amountMatch = message.match(/\d+(\.\d{2})?/);
                return amountMatch ? parseFloat(amountMatch[0]) : null;

            case 'type':
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
                return message.trim();

            case 'date':
                if (lowerMessage === 'today') {
                    return new Date();
                } else if (lowerMessage === 'yesterday') {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    return yesterday;
                }
                const parsedDate = new Date(message);
                return isNaN(parsedDate.getTime()) ? null : parsedDate;

            default:
                return message.trim();
        }
    }
}
