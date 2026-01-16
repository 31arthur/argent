import type { Commission } from '@/domain/entities/Commission';

/**
 * Mock Data Source for Commissions
 */
export class MockCommissionDataSource {
    private commissions: Commission[] = [
        {
            id: '1',
            title: 'A Square',
            client: 'The Other Gallery',
            gallery: 'The Other Gallery',
            price: 2800,
            currency: 'USD',
            status: 'ongoing',
            startDate: new Date('2020-01-15'),
            expectedCompletionDate: new Date('2020-12-31'),
        },
        {
            id: '2',
            title: 'Gradient from Sphere',
            client: 'Another Art Dealer',
            gallery: 'Another Art Dealer',
            price: 2500,
            currency: 'USD',
            status: 'ongoing',
            startDate: new Date('2020-02-01'),
            expectedCompletionDate: new Date('2020-11-30'),
        },
    ];

    async getAll(): Promise<Commission[]> {
        await this.delay(300);
        return [...this.commissions];
    }

    async getOngoing(): Promise<Commission[]> {
        await this.delay(250);
        return this.commissions.filter((commission) => commission.status === 'ongoing');
    }

    async getById(id: string): Promise<Commission | null> {
        await this.delay(200);
        return this.commissions.find((commission) => commission.id === id) || null;
    }

    async create(commission: Commission): Promise<Commission> {
        await this.delay(400);
        this.commissions.push(commission);
        return commission;
    }

    async update(id: string, updates: Partial<Commission>): Promise<Commission | null> {
        await this.delay(350);
        const index = this.commissions.findIndex((commission) => commission.id === id);
        if (index === -1) return null;
        this.commissions[index] = { ...this.commissions[index], ...updates };
        return this.commissions[index];
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
