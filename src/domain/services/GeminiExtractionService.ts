import type { ExtractionSchema } from '@/domain/entities/ExtractionSchema';
import type { TransactionData } from '@/domain/value-objects/TransactionData';
import { mapConfidenceToNumeric } from '@/domain/entities/ConfidenceLevel';
import { GeminiValidationError } from '@/domain/entities/GeminiValidationError';
import type { ExtractionResult } from './StubExtractionService';

/**
 * Gemini Extraction Service
 * Gemini API integration for transaction extraction
 * 
 * CRITICAL BOUNDARIES:
 * - Gemini is a PURE EXTRACTION TOOL
 * - Gemini NEVER controls application flow
 * - Gemini NEVER decides state transitions
 * - Gemini NEVER persists data
 * - Gemini NEVER creates transactions
 * 
 * RESPONSIBILITIES:
 * - Accept raw user text
 * - Accept current draft context (optional)
 * - Call Gemini API with extraction prompt
 * - Validate JSON response strictly
 * - Normalize values
 * - Return structured extraction result
 * - Log all inputs/outputs
 * 
 * VALIDATION:
 * - Reject malformed JSON
 * - Reject invalid schema
 * - Reject wrong types (e.g., string amounts)
 * - Reject hallucinated enums
 * - Reject unknown keys
 */
export class GeminiExtractionService {
    private readonly GEMINI_API_KEY: string;
    private readonly GEMINI_MODEL: string;
    private readonly GEMINI_TIMEOUT_MS: number;

    constructor() {
        // TODO: Load from environment variables
        this.GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
        this.GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-pro';
        this.GEMINI_TIMEOUT_MS = parseInt(import.meta.env.VITE_GEMINI_TIMEOUT_MS || '10000', 10);
    }

    /**
     * Extract transaction data from user message
     * 
     * @param message - User message
     * @param draftContext - Optional current draft context
     * @returns Extraction result with fields and confidence
     */
    async extract(
        message: string,
        draftContext?: Partial<TransactionData>
    ): Promise<ExtractionResult> {
        // Build Gemini prompt
        const prompt = this.buildExtractionPrompt(message, draftContext);

        // Log input
        this.logInput(message, draftContext);

        // Call Gemini API
        const rawResponse = await this.callGeminiAPI(prompt);

        // Log raw output
        this.logRawOutput(rawResponse);

        // Validate and parse response
        const schema = this.validateAndParseResponse(rawResponse);

        // Log parsed schema
        this.logParsedSchema(schema);

        // Normalize to ExtractionResult
        const result = this.normalizeToExtractionResult(schema);

        // Log final result
        this.logResult(result);

        return result;
    }

    /**
     * Build extraction prompt for Gemini
     */
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

NEGATIVE EXAMPLE (WRONG):
Input: "Bought something"
WRONG Output: {"transactionType": "EXPENSE", "amount": 100, "categoryHint": "shopping"}
CORRECT Output: {"transactionType": "EXPENSE", "amount": null, "cashPoolHint": null, "categoryHint": null, "description": "bought something", "dateHint": "TODAY", "confidence": {...}}
Reason: Do NOT guess amount or category when not stated.
${contextSection}
USER MESSAGE:
${message}

Return ONLY the JSON object:`;
    }

    /**
     * Call Gemini API
     */
    private async callGeminiAPI(prompt: string): Promise<string> {
        // Dynamic import to avoid issues if package not installed
        const { GoogleGenerativeAI } = await import('@google/generative-ai');

        if (!this.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY environment variable is not set');
        }

        try {
            // Initialize Gemini AI
            const genAI = new GoogleGenerativeAI(this.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: this.GEMINI_MODEL });

            // Create timeout promise
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => {
                    reject(new Error(`Gemini API call timed out after ${this.GEMINI_TIMEOUT_MS}ms`));
                }, this.GEMINI_TIMEOUT_MS);
            });

            // Race between API call and timeout
            const resultPromise = model.generateContent(prompt);

            const result = await Promise.race([resultPromise, timeoutPromise]);
            const response = await result.response;
            const text = response.text();

            if (!text) {
                throw new Error('Gemini returned empty response');
            }

            return text;
        } catch (error) {
            // Log error for debugging
            console.error('[GeminiExtraction] API call failed:', error);

            // Re-throw with more context
            if (error instanceof Error) {
                throw new Error(`Gemini API call failed: ${error.message}`);
            }
            throw new Error('Gemini API call failed with unknown error');
        }
    }

    /**
     * Validate and parse Gemini response
     */
    private validateAndParseResponse(response: string): ExtractionSchema {
        // Step 1: Parse JSON
        let parsed: unknown;
        try {
            parsed = JSON.parse(response);
        } catch (error) {
            throw new GeminiValidationError(
                'MALFORMED_JSON',
                'Gemini returned invalid JSON',
                undefined,
                response
            );
        }

        // Step 2: Validate is object
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
            throw new GeminiValidationError('INVALID_SCHEMA', 'Response is not an object');
        }

        // Step 3: Check required keys
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

        // Step 4: Reject unknown keys
        const allowedKeys = new Set(requiredKeys);
        for (const key of Object.keys(parsed)) {
            if (!allowedKeys.has(key)) {
                throw new GeminiValidationError('UNKNOWN_KEY', `Unknown key: ${key}`, key);
            }
        }

        const data = parsed as Record<string, unknown>;

        // Step 5: Validate transactionType
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

        // Step 6: Validate amount
        if (data.amount !== null && typeof data.amount !== 'number') {
            throw new GeminiValidationError(
                'INVALID_TYPE',
                'Amount must be number or null',
                'amount',
                data.amount
            );
        }

        // Step 7: Validate string fields
        const stringFields = ['cashPoolHint', 'categoryHint', 'description', 'dateHint'];
        for (const field of stringFields) {
            if (data[field] !== null && typeof data[field] !== 'string') {
                throw new GeminiValidationError(
                    'INVALID_TYPE',
                    `${field} must be string or null`,
                    field,
                    data[field]
                );
            }
        }

        // Step 8: Validate confidence object
        if (typeof data.confidence !== 'object' || data.confidence === null) {
            throw new GeminiValidationError(
                'INVALID_SCHEMA',
                'confidence must be an object',
                'confidence'
            );
        }

        const confidence = data.confidence as Record<string, unknown>;
        const confidenceKeys = [
            'transactionType',
            'amount',
            'cashPoolHint',
            'categoryHint',
            'description',
            'dateHint',
        ];

        for (const key of confidenceKeys) {
            if (!(key in confidence)) {
                throw new GeminiValidationError(
                    'INVALID_SCHEMA',
                    `Missing confidence key: ${key}`,
                    `confidence.${key}`
                );
            }

            const value = confidence[key];
            if (value !== 'HIGH' && value !== 'MEDIUM' && value !== 'LOW') {
                throw new GeminiValidationError(
                    'HALLUCINATED_ENUM',
                    `Invalid confidence level for ${key}. Must be "HIGH", "MEDIUM", or "LOW"`,
                    `confidence.${key}`,
                    value
                );
            }
        }

        return data as unknown as ExtractionSchema;
    }

    /**
     * Normalize ExtractionSchema to ExtractionResult
     */
    private normalizeToExtractionResult(schema: ExtractionSchema): ExtractionResult {
        const fields: Partial<TransactionData> = {};
        const confidence: Record<string, number> = {};

        // Transaction type
        if (schema.transactionType) {
            fields.type = schema.transactionType;
            confidence.type = mapConfidenceToNumeric(schema.confidence.transactionType);
        }

        // Amount
        if (schema.amount !== null) {
            fields.amount = schema.amount;
            confidence.amount = mapConfidenceToNumeric(schema.confidence.amount);
        }

        // Description (maps to purpose)
        if (schema.description) {
            fields.purpose = schema.description.trim();
            confidence.purpose = mapConfidenceToNumeric(schema.confidence.description);
        }

        // Date hint (will be resolved by orchestrator)
        // For now, store as-is in a temporary field
        // Orchestrator will resolve "TODAY", "YESTERDAY", or parse ISO date
        if (schema.dateHint) {
            // Store hint for orchestrator to resolve
            (fields as any).dateHint = schema.dateHint;
            confidence.date = mapConfidenceToNumeric(schema.confidence.dateHint);
        }

        // Cash pool hint and category hint are NOT stored in fields
        // They will be resolved by orchestrator and stored separately
        // Store them in a temporary structure for orchestrator
        (fields as any).cashPoolHint = schema.cashPoolHint;
        (fields as any).categoryHint = schema.categoryHint;

        // Store hint confidences
        if (schema.cashPoolHint) {
            confidence.cashPoolHint = mapConfidenceToNumeric(schema.confidence.cashPoolHint);
        }
        if (schema.categoryHint) {
            confidence.categoryHint = mapConfidenceToNumeric(schema.confidence.categoryHint);
        }

        return {
            fields,
            confidence,
        };
    }

    /**
     * Logging methods
     */

    private logInput(message: string, draftContext?: Partial<TransactionData>): void {
        console.log('[GeminiExtraction] Input:', {
            message: message.substring(0, 100), // Truncate for PII
            hasDraftContext: !!draftContext,
        });
    }

    private logRawOutput(response: string): void {
        console.log('[GeminiExtraction] Raw output:', response.substring(0, 200));
    }

    private logParsedSchema(schema: ExtractionSchema): void {
        console.log('[GeminiExtraction] Parsed schema:', {
            transactionType: schema.transactionType,
            hasAmount: schema.amount !== null,
            hasCashPoolHint: schema.cashPoolHint !== null,
            hasCategoryHint: schema.categoryHint !== null,
            hasDescription: schema.description !== null,
            hasDateHint: schema.dateHint !== null,
        });
    }

    private logResult(result: ExtractionResult): void {
        console.log('[GeminiExtraction] Result:', {
            extractedFields: Object.keys(result.fields),
            confidenceScores: Object.keys(result.confidence),
        });
    }
}
