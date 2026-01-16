/**
 * Money Value Object
 * Encapsulates amount and currency with validation and operations
 * Ensures monetary values are always valid
 */
export class Money {
    private readonly _amount: number;
    private readonly _currency: string;

    constructor(amount: number, currency: string = 'INR') {
        if (amount < 0) {
            throw new Error('Amount cannot be negative');
        }
        if (!Number.isFinite(amount)) {
            throw new Error('Amount must be a finite number');
        }
        this._amount = Math.round(amount * 100) / 100; // Round to 2 decimal places
        this._currency = currency;
    }

    get amount(): number {
        return this._amount;
    }

    get currency(): string {
        return this._currency;
    }

    /**
     * Add two Money objects
     */
    add(other: Money): Money {
        this.ensureSameCurrency(other);
        return new Money(this._amount + other._amount, this._currency);
    }

    /**
     * Subtract two Money objects
     */
    subtract(other: Money): Money {
        this.ensureSameCurrency(other);
        return new Money(this._amount - other._amount, this._currency);
    }

    /**
     * Check if this amount is greater than another
     */
    isGreaterThan(other: Money): boolean {
        this.ensureSameCurrency(other);
        return this._amount > other._amount;
    }

    /**
     * Check if this amount is less than another
     */
    isLessThan(other: Money): boolean {
        this.ensureSameCurrency(other);
        return this._amount < other._amount;
    }

    /**
     * Check if this amount equals another
     */
    equals(other: Money): boolean {
        return this._amount === other._amount && this._currency === other._currency;
    }

    /**
     * Format money for display
     */
    format(locale: string = 'en-IN'): string {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: this._currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(this._amount);
    }

    /**
     * Ensure two Money objects have the same currency
     */
    private ensureSameCurrency(other: Money): void {
        if (this._currency !== other._currency) {
            throw new Error(
                `Cannot operate on different currencies: ${this._currency} and ${other._currency}`
            );
        }
    }

    /**
     * Create Money from raw number
     */
    static fromNumber(amount: number, currency: string = 'INR'): Money {
        return new Money(amount, currency);
    }

    /**
     * Create zero Money
     */
    static zero(currency: string = 'INR'): Money {
        return new Money(0, currency);
    }
}
