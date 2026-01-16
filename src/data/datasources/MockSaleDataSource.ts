import type { Sale } from '@/domain/entities/Sale';

/**
 * Mock Data Source for Sales
 */
export class MockSaleDataSource {
    private sales: Sale[] = [
        {
            id: '1',
            artworkId: '1',
            artworkTitle: 'Gradient from Corner',
            artworkThumbnail: '/images/gradient-corner.jpg',
            year: 1970,
            dimensions: '240 x 180 mm',
            client: 'Some Art Museum',
            type: 'Museum',
            price: 2250,
            currency: 'USD',
            date: new Date('2020-07-01'),
            status: 'latest',
        },
        {
            id: '2',
            artworkId: '5',
            artworkTitle: 'A Triangle',
            artworkThumbnail: '/images/triangle.jpg',
            year: 1999,
            dimensions: '297 x 210 mm',
            client: 'Some Art Museum',
            type: 'Museum',
            price: 2300,
            currency: 'USD',
            date: new Date('2020-06-01'),
            status: 'completed',
        },
        {
            id: '3',
            artworkId: '6',
            artworkTitle: 'A Circle',
            artworkThumbnail: '/images/circle.jpg',
            year: 1999,
            dimensions: '297 x 210 mm',
            client: 'Some Collection',
            type: 'Private Collector',
            price: 2300,
            currency: 'USD',
            date: new Date('2020-05-01'),
            status: 'completed',
        },
        {
            id: '4',
            artworkId: '7',
            artworkTitle: 'Blurred GBS',
            artworkThumbnail: '/images/blurred-gbs.jpg',
            year: 1985,
            dimensions: '1280 x 854 mm',
            client: 'Another Art Dealer',
            type: 'Art Dealer',
            price: 8500,
            currency: 'USD',
            date: new Date('2019-04-01'),
            status: 'completed',
        },
        {
            id: '5',
            artworkId: '8',
            artworkTitle: 'Blurred YP',
            artworkThumbnail: '/images/blurred-yp.jpg',
            year: 1987,
            dimensions: '1280 x 854 mm',
            client: 'Some Collection',
            type: 'Private Collector',
            price: 8000,
            currency: 'USD',
            date: new Date('2018-07-01'),
            status: 'completed',
        },
    ];

    async getAll(): Promise<Sale[]> {
        await this.delay(300);
        return [...this.sales];
    }

    async getLatest(limit: number = 10): Promise<Sale[]> {
        await this.delay(250);
        return [...this.sales]
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, limit);
    }

    async getById(id: string): Promise<Sale | null> {
        await this.delay(200);
        return this.sales.find((sale) => sale.id === id) || null;
    }

    async create(sale: Sale): Promise<Sale> {
        await this.delay(400);
        this.sales.push(sale);
        return sale;
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
