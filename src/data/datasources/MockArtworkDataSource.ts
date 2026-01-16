import type { Artwork } from '@/domain/entities/Artwork';

/**
 * Mock Data Source for Artworks
 * Simulates API responses with sample data
 * Will be replaced with real API calls in production
 */
export class MockArtworkDataSource {
    private artworks: Artwork[] = [
        {
            id: '1',
            title: 'Gradient from Corner',
            year: 1970,
            dimensions: '240 x 180 mm',
            medium: 'silver print, photo paper matt',
            workId: 'W0001',
            thumbnailUrl: '/images/gradient-corner.jpg',
            imageUrl: '/images/gradient-corner-full.jpg',
            edition: '1-3',
            category: 'Gradient Photography',
        },
        {
            id: '2',
            title: 'Gradient from Bottom',
            year: 1970,
            dimensions: '240 x 180 mm',
            medium: 'silver print, photo paper matt',
            workId: 'W0002',
            thumbnailUrl: '/images/gradient-bottom.jpg',
            imageUrl: '/images/gradient-bottom-full.jpg',
            edition: '1-3',
            category: 'Gradient Photography',
        },
        {
            id: '3',
            title: 'Gradient from Sphere',
            year: 1970,
            dimensions: '240 x 180 mm',
            medium: 'silver print, photo paper matt',
            workId: 'W0003',
            thumbnailUrl: '/images/gradient-sphere.jpg',
            imageUrl: '/images/gradient-sphere-full.jpg',
            edition: '1-3',
            category: 'Gradient Photography',
        },
        {
            id: '4',
            title: 'Blurred GY',
            year: 1985,
            dimensions: '1280 x 854 mm',
            medium: 'digital print',
            workId: 'W0004',
            thumbnailUrl: '/images/blurred-gy.jpg',
            imageUrl: '/images/blurred-gy-full.jpg',
            category: 'Abstract Paintings',
        },
        {
            id: '5',
            title: 'A Triangle',
            year: 1999,
            dimensions: '297 x 210 mm',
            medium: 'ink on paper',
            workId: 'W0005',
            thumbnailUrl: '/images/triangle.jpg',
            imageUrl: '/images/triangle-full.jpg',
            category: 'Conceptual Drawings',
        },
        {
            id: '6',
            title: 'A Circle',
            year: 1999,
            dimensions: '297 x 210 mm',
            medium: 'ink on paper',
            workId: 'W0006',
            thumbnailUrl: '/images/circle.jpg',
            imageUrl: '/images/circle-full.jpg',
            category: 'Conceptual Drawings',
        },
        {
            id: '7',
            title: 'Blurred GBS',
            year: 1985,
            dimensions: '1280 x 854 mm',
            medium: 'digital print',
            workId: 'W0007',
            thumbnailUrl: '/images/blurred-gbs.jpg',
            imageUrl: '/images/blurred-gbs-full.jpg',
            category: 'Abstract Paintings',
        },
        {
            id: '8',
            title: 'Blurred YP',
            year: 1987,
            dimensions: '1280 x 854 mm',
            medium: 'digital print',
            workId: 'W0008',
            thumbnailUrl: '/images/blurred-yp.jpg',
            imageUrl: '/images/blurred-yp-full.jpg',
            category: 'Abstract Paintings',
        },
    ];

    async getAll(): Promise<Artwork[]> {
        // Simulate API delay
        await this.delay(300);
        return [...this.artworks];
    }

    async getById(id: string): Promise<Artwork | null> {
        await this.delay(200);
        return this.artworks.find((artwork) => artwork.id === id) || null;
    }

    async getByCategory(category: string): Promise<Artwork[]> {
        await this.delay(250);
        return this.artworks.filter((artwork) => artwork.category === category);
    }

    async create(artwork: Artwork): Promise<Artwork> {
        await this.delay(400);
        this.artworks.push(artwork);
        return artwork;
    }

    async update(id: string, updates: Partial<Artwork>): Promise<Artwork | null> {
        await this.delay(350);
        const index = this.artworks.findIndex((artwork) => artwork.id === id);
        if (index === -1) return null;
        this.artworks[index] = { ...this.artworks[index], ...updates };
        return this.artworks[index];
    }

    async delete(id: string): Promise<boolean> {
        await this.delay(300);
        const index = this.artworks.findIndex((artwork) => artwork.id === id);
        if (index === -1) return false;
        this.artworks.splice(index, 1);
        return true;
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
