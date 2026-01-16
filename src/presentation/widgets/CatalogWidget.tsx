import { Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { ScrollArea } from '@/shared/ui/ScrollArea';
import { useArtworks } from '../hooks/useArtworks';

/**
 * Catalog Widget
 * Displays artwork catalog with thumbnails in scrollable list
 */
export function CatalogWidget() {
    const { data: artworks, isLoading, error } = useArtworks();

    return (
        <Card className="h-full">
            <CardHeader>
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-sm">
                        <CardTitle>CATALOG</CardTitle>
                        <Badge variant="count">all works</Badge>
                    </div>
                    <Button variant="add" size="add">
                        <Plus size={14} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea maxHeight="300px">
                    {isLoading && (
                        <div className="p-md text-text-muted text-sm">Loading artworks...</div>
                    )}
                    {error && (
                        <div className="p-md text-status-latest text-sm">Error loading artworks</div>
                    )}
                    {artworks && artworks.length === 0 && (
                        <div className="p-md text-text-muted text-sm">No artworks found</div>
                    )}
                    {artworks?.map((artwork) => (
                        <div key={artwork.id} className="list-item px-md">
                            <div className="list-item-thumbnail">
                                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm text-text-primary truncate">{artwork.title}</div>
                                <div className="text-xs text-text-secondary">{artwork.year}</div>
                            </div>
                            <div className="text-xs text-text-secondary">{artwork.medium}</div>
                            <div className="text-xs text-text-accent">{artwork.dimensions}</div>
                            <div className="text-xs text-text-muted">{artwork.workId}</div>
                        </div>
                    ))}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
