import { ExtractionSchema } from '../entities/ExtractionSchema';
import { TransactionData } from '../value-objects/TransactionData';
import { mapConfidenceToNumeric } from '../entities/ConfidenceLevel';
import { GeminiValidationError } from '../entities/GeminiValidationError';
import { ExtractionResult } from './ExtractionResult';
import { logger } from '../../utils/logger';

/**
 * Gemini Extraction Service
 * Gemini API integration for transaction extraction
 */
export class GeminiExtractionService {
    private readonly GEMINI_API_KEY: string;
    private readonly GEMINI_MODEL: string;
    private readonly GEMINI_TIMEOUT_MS: number;

    constructor() {
        this.GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
        this.GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
        this.GEMINI_TIMEOUT_MS = parseInt(process.env.GEMINI_TIMEOUT_MS || '15000', 10);
    }

    async extract(
        message: string,
        draftContext?: Partial<TransactionData>
    ): Promise<ExtractionResult> {
        const prompt = this.buildExtractionPrompt(message, draftContext);

        logger.debug('GeminiExtraction: Processing input', {
            messageLength: message.length,
            hasContext: !!draftContext
        });

        const rawResponse = await this.callGeminiAPI(prompt);

        logger.debug('GeminiExtraction: Received API response', {
            responseLength: rawResponse.length
        });

        const schema = this.validateAndParseResponse(rawResponse);
        const result = this.normalizeToExtractionResult(schema);

        logger.info('GeminiExtraction: Extraction completed', {
            extractedFields: Object.keys(result.fields),
            fieldCount: Object.keys(result.fields).length,
        });

        return result;
    }

    private buildExtractionPrompt(
        message: string,
        draftContext?: Partial<TransactionData>
    ): string {
        const contextSection = draftContext
            ? `\n\nCURRENT DRAFT CONTEXT:\n${JSON.stringify(draftContext, null, 2)}\n`
            : '';

        return `You are a transaction extraction assistant for a personal finance app.

ROLE:
Extract transaction details from user messages into a strict JSON format.

RULES:
1. Return ONLY valid JSON - NO prose, NO explanations, NO markdown
2. Use null when unsure - NEVER guess or assume
3. Use exact enum values: "INCOME" or "EXPENSE"
4. Return numbers for amount, NOT strings
5. Provide hints for matching, NOT IDs
6. Use confidence levels: "HIGH", "MEDIUM", "LOW"

SCHEMA:
{
  "transactionType": "INCOME" | "EXPENSE" | null,
  "amount": number | null,
  "cashPoolHint": string | null,
  "categoryHint": string | null,
  "description": string | null,
  "dateHint": "ISO date" | "TODAY" | "YESTERDAY" | null,
  "confidence": {
    "transactionType": "HIGH" | "MEDIUM" | "LOW",
    "amount": "HIGH" | "MEDIUM" | "LOW",
    "cashPoolHint": "HIGH" | "MEDIUM" | "LOW",
    "categoryHint": "HIGH" | "MEDIUM" | "LOW",
    "description": "HIGH" | "MEDIUM" | "LOW",
    "dateHint": "HIGH" | "MEDIUM" | "LOW"
  }
}

EXAMPLES:

Input: "Spent 500 on groceries from my main wallet"
Output:
{
  "transactionType": "EXPENSE",
  "amount": 500,
  "cashPoolHint": "main wallet",
  "categoryHint": "groceries",
  "description": "groceries",
  "dateHint": "TODAY",
  "confidence": {
    "transactionType": "HIGH",
    "amount": "HIGH",
    "cashPoolHint": "HIGH",
    "categoryHint": "HIGH",
    "description": "HIGH",
    "dateHint": "MEDIUM"
  }
}

Input: "Received salary yesterday"
Output:
{
  "transactionType": "INCOME",
  "amount": null,
  "cashPoolHint": null,
  "categoryHint": "salary",
  "description": "salary",
  "dateHint": "YESTERDAY",
  "confidence": {
    "transactionType": "HIGH",
    "amount": "LOW",
    "cashPoolHint": "LOW",
    "categoryHint": "HIGH",
    "description": "HIGH",
    "dateHint": "HIGH"
  }
}
${contextSection}
USER MESSAGE:
${message}

Return ONLY the JSON object:`;
    }

    private async callGeminiAPI(prompt: string): Promise<string> {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');

        if (!this.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY environment variable is not set');
        }

        try {
            const genAI = new GoogleGenerativeAI(this.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: this.GEMINI_MODEL });

            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => {
                    reject(new Error(`Gemini API call timed out after ${this.GEMINI_TIMEOUT_MS}ms`));
                }, this.GEMINI_TIMEOUT_MS);
            });

            const resultPromise = model.generateContent(prompt);
            const result = await Promise.race([resultPromise, timeoutPromise]);
            const response = await result.response;
            const text = response.text();

            if (!text) {
                throw new Error('Gemini returned empty response');
            }

            return text;
        } catch (error) {
            logger.error('GeminiExtraction: API call failed', {
                error,
                errorMessage: error instanceof Error ? error.message : String(error)
            });
            if (error instanceof Error) {
                throw new Error(`Gemini API call failed: ${error.message}`);
            }
            throw new Error('Gemini API call failed with unknown error');
        }
    }

    private validateAndParseResponse(response: string): ExtractionSchema {
        // Clean response - remove markdown code blocks if present
        let cleanResponse = response.trim();
        if (cleanResponse.startsWith('```json')) {
            cleanResponse = cleanResponse.slice(7);
        }
        if (cleanResponse.startsWith('```')) {
            cleanResponse = cleanResponse.slice(3);
        }
        if (cleanResponse.endsWith('```')) {
            cleanResponse = cleanResponse.slice(0, -3);
        }
        cleanResponse = cleanResponse.trim();

        let parsed: unknown;
        try {
            parsed = JSON.parse(cleanResponse);
        } catch (error) {
            throw new GeminiValidationError(
                'MALFORMED_JSON',
                'Gemini returned invalid JSON',
                undefined,
                response
            );
        }

        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
            throw new GeminiValidationError('INVALID_SCHEMA', 'Response is not an object');
        }

        const requiredKeys = [
            'transactionType',
            'amount',
            'cashPoolHint',
            'categoryHint',
            'description',
            'dateHint',
            'confidence',
        ];

        for (const key of requiredKeys) {
            if (!(key in parsed)) {
                throw new GeminiValidationError(
                    'INVALID_SCHEMA',
                    `Missing required key: ${key}`,
                    key
                );
            }
        }

        const data = parsed as Record<string, unknown>;

        if (
            data.transactionType !== null &&
            data.transactionType !== 'INCOME' &&
            data.transactionType !== 'EXPENSE'
        ) {
            throw new GeminiValidationError(
                'HALLUCINATED_ENUM',
                'Invalid transactionType. Must be "INCOME", "EXPENSE", or null',
                'transactionType',
                data.transactionType
            );
        }

        if (data.amount !== null && typeof data.amount !== 'number') {
            throw new GeminiValidationError(
                'INVALID_TYPE',
                'Amount must be number or null',
                'amount',
                data.amount
            );
        }

        return data as unknown as ExtractionSchema;
    }

    private normalizeToExtractionResult(schema: ExtractionSchema): ExtractionResult {
        const fields: Partial<TransactionData> & {
            cashPoolHint?: string;
            categoryHint?: string;
            dateHint?: string;
        } = {};
        const confidence: Record<string, number> = {};

        if (schema.transactionType) {
            fields.type = schema.transactionType;
            confidence.type = mapConfidenceToNumeric(schema.confidence.transactionType);
        }

        if (schema.amount !== null) {
            fields.amount = schema.amount;
            confidence.amount = mapConfidenceToNumeric(schema.confidence.amount);
        }

        if (schema.description) {
            fields.purpose = schema.description.trim();
            confidence.purpose = mapConfidenceToNumeric(schema.confidence.description);
        }

        if (schema.dateHint) {
            fields.dateHint = schema.dateHint;
            confidence.date = mapConfidenceToNumeric(schema.confidence.dateHint);
        }

        if (schema.cashPoolHint) {
            fields.cashPoolHint = schema.cashPoolHint;
            confidence.cashPoolHint = mapConfidenceToNumeric(schema.confidence.cashPoolHint);
        }

        if (schema.categoryHint) {
            fields.categoryHint = schema.categoryHint;
            confidence.categoryHint = mapConfidenceToNumeric(schema.confidence.categoryHint);
        }

        return { fields, confidence };
    }
}

