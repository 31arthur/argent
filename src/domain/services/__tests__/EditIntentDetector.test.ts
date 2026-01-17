import { describe, it, expect } from 'vitest';
import { EditIntentDetector } from '@/domain/services/EditIntentDetector';

describe('EditIntentDetector', () => {
    const detector = new EditIntentDetector();

    describe('Amount Detection', () => {
        it('should detect amount change with "change amount to"', () => {
            const result = detector.detect('change amount to 150');
            expect(result).toEqual({
                field: 'amount',
                newValue: '150'
            });
        });

        it('should detect amount change with "amount is"', () => {
            const result = detector.detect('amount is 200');
            expect(result).toEqual({
                field: 'amount',
                newValue: '200'
            });
        });

        it('should detect amount change with "it was"', () => {
            const result = detector.detect('it was 500');
            expect(result).toEqual({
                field: 'amount',
                newValue: '500'
            });
        });

        it('should detect decimal amounts', () => {
            const result = detector.detect('change amount to 150.50');
            expect(result).toEqual({
                field: 'amount',
                newValue: '150.50'
            });
        });
    });

    describe('Pool Detection', () => {
        it('should detect pool change with "it was cash"', () => {
            const result = detector.detect('it was cash');
            expect(result).toEqual({
                field: 'poolId',
                newValue: 'cash'
            });
        });

        it('should detect pool change with "from main wallet"', () => {
            const result = detector.detect('from main wallet');
            expect(result).toEqual({
                field: 'poolId',
                newValue: 'main wallet'
            });
        });

        it('should detect pool change with "cash pool SBI"', () => {
            const result = detector.detect('cash pool SBI');
            expect(result).toEqual({
                field: 'poolId',
                newValue: 'SBI'
            });
        });
    });

    describe('Category Detection', () => {
        it('should detect category change with "category should be"', () => {
            const result = detector.detect('category should be snacks');
            expect(result).toEqual({
                field: 'categoryId',
                newValue: 'snacks'
            });
        });

        it('should detect category change with "change to groceries"', () => {
            const result = detector.detect('change to groceries');
            expect(result).toEqual({
                field: 'categoryId',
                newValue: 'groceries'
            });
        });

        it('should detect category change with "for food"', () => {
            const result = detector.detect('for food');
            expect(result).toEqual({
                field: 'categoryId',
                newValue: 'food'
            });
        });
    });

    describe('Date Detection', () => {
        it('should detect date change with "yesterday"', () => {
            const result = detector.detect('that was yesterday');
            expect(result).toEqual({
                field: 'date',
                newValue: 'yesterday'
            });
        });

        it('should detect date change with "today"', () => {
            const result = detector.detect('it was today');
            expect(result).toEqual({
                field: 'date',
                newValue: 'today'
            });
        });

        it('should detect date change with "last week"', () => {
            const result = detector.detect('date was last week');
            expect(result).toEqual({
                field: 'date',
                newValue: 'last week'
            });
        });
    });

    describe('Purpose Detection', () => {
        it('should detect purpose change with "description is"', () => {
            const result = detector.detect('description is weekly shopping');
            expect(result).toEqual({
                field: 'purpose',
                newValue: 'weekly shopping'
            });
        });

        it('should detect purpose change with "for groceries"', () => {
            const result = detector.detect('for groceries');
            expect(result).toEqual({
                field: 'purpose',
                newValue: 'groceries'
            });
        });
    });

    describe('Type Detection', () => {
        it('should detect type change to income', () => {
            const result = detector.detect('it was income');
            expect(result).toEqual({
                field: 'type',
                newValue: 'income'
            });
        });

        it('should detect type change to expense', () => {
            const result = detector.detect('type is expense');
            expect(result).toEqual({
                field: 'type',
                newValue: 'expense'
            });
        });
    });

    describe('Notes Detection', () => {
        it('should detect notes with "add note:"', () => {
            const result = detector.detect('add note: urgent payment');
            expect(result).toEqual({
                field: 'notes',
                newValue: 'urgent payment'
            });
        });

        it('should detect notes with "notes:"', () => {
            const result = detector.detect('notes: important');
            expect(result).toEqual({
                field: 'notes',
                newValue: 'important'
            });
        });
    });

    describe('Unclear Intent', () => {
        it('should return null for unclear messages', () => {
            const result = detector.detect('change it');
            expect(result).toBeNull();
        });

        it('should return null for empty messages', () => {
            const result = detector.detect('');
            expect(result).toBeNull();
        });

        it('should return null for unrelated messages', () => {
            const result = detector.detect('hello there');
            expect(result).toBeNull();
        });
    });

    describe('Case Insensitivity', () => {
        it('should detect intent regardless of case', () => {
            const result1 = detector.detect('CHANGE AMOUNT TO 100');
            const result2 = detector.detect('Change Amount To 100');
            const result3 = detector.detect('change amount to 100');

            expect(result1).toEqual({ field: 'amount', newValue: '100' });
            expect(result2).toEqual({ field: 'amount', newValue: '100' });
            expect(result3).toEqual({ field: 'amount', newValue: '100' });
        });
    });
});
