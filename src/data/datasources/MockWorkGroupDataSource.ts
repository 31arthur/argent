import type { WorkGroup } from '@/domain/entities/WorkGroup';

/**
 * Mock Data Source for Work Groups
 */
export class MockWorkGroupDataSource {
    private workGroups: WorkGroup[] = [
        {
            id: '1',
            name: 'Conceptual Drawings',
            artworkCount: 12,
        },
        {
            id: '2',
            name: 'Gradient Photography',
            artworkCount: 8,
        },
        {
            id: '3',
            name: 'Abstract Paintings',
            artworkCount: 15,
        },
    ];

    async getAll(): Promise<WorkGroup[]> {
        await this.delay(250);
        return [...this.workGroups];
    }

    async getById(id: string): Promise<WorkGroup | null> {
        await this.delay(200);
        return this.workGroups.find((group) => group.id === id) || null;
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
