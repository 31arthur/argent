import React from 'react';
import { Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { ScrollArea } from '@/shared/ui/ScrollArea';
import { useSales } from '../hooks/useSales';

/**
 * Sales Widget
 * Displays latest sales in scrollable list
 */
export function SalesWidget() {
    const { data: sales, isLoading } = useSales(5);

    return (
        <Card className="h-full">
            <CardHeader>
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-sm">
                        <CardTitle>SALES</CardTitle>
                        <Badge variant="latest">latest</Badge>
                        <Badge variant="count">{sales?.length || 0}</Badge>
                    </div>
                    <Button variant="add" size="add">
                        <Plus size={14} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea maxHeight="250px">
                    {isLoading && (
                        <div className="p-md text-text-muted text-sm">Loading sales...</div>
                    )}
                    {sales?.map((sale) => (
                        <div key={sale.id} className="list-item px-md">
                            <div className="flex-1 min-w-0">
                                <div className="text-sm text-text-primary truncate">{sale.artworkTitle}</div>
                                <div className="text-xs text-text-secondary">{sale.client}</div>
                            </div>
                            <div className="text-sm text-text-accent">
                                {sale.price} {sale.currency}
                            </div>
                        </div>
                    ))}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
