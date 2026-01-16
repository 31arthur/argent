import { PageLayout } from '../layouts/PageLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/Tabs';
import { useArtworks } from '../hooks/useArtworks';

/**
 * Catalog Page
 * LIST and RASTER view modes for browsing artworks
 */
export function Catalog() {
    const { data: artworks, isLoading } = useArtworks();

    return (
        <PageLayout>
            <div className="mb-lg">
                <h1 className="text-xl uppercase tracking-wide">Catalog</h1>
            </div>

            <Tabs defaultValue="raster">
                <TabsList>
                    <TabsTrigger value="list">LIST</TabsTrigger>
                    <TabsTrigger value="raster">RASTER</TabsTrigger>
                </TabsList>

                <TabsContent value="list">
                    <div className="space-y-sm">
                        {isLoading && <div className="text-text-muted">Loading...</div>}
                        {artworks?.map((artwork) => (
                            <div key={artwork.id} className="list-item bg-background-secondary p-md rounded">
                                <div className="list-item-thumbnail">
                                    <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-500" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium">{artwork.title}</div>
                                    <div className="text-xs text-text-secondary">
                                        {artwork.year} • {artwork.dimensions}
                                    </div>
                                </div>
                                <div className="text-xs text-text-muted">{artwork.workId}</div>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="raster">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
                        {isLoading && <div className="text-text-muted">Loading...</div>}
                        {artworks?.map((artwork) => (
                            <div key={artwork.id} className="bg-background-secondary rounded overflow-hidden">
                                <div className="aspect-square bg-gradient-to-br from-gray-300 to-gray-500" />
                                <div className="p-md">
                                    <div className="text-sm uppercase font-medium mb-xs">{artwork.title}</div>
                                    {artwork.edition && (
                                        <div className="text-xs text-text-secondary mb-xs">({artwork.edition})</div>
                                    )}
                                    <div className="text-xs text-text-secondary">{artwork.year}</div>
                                    <div className="text-xs text-text-accent mt-sm">{artwork.workId}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </PageLayout>
    );
}
