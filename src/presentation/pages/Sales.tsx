import { PageLayout } from '../layouts/PageLayout';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/ui/Table';
import { useSales } from '../hooks/useSales';

/**
 * Sales Page
 * Detailed table view of all sales transactions
 */
export function Sales() {
    const { data: sales, isLoading } = useSales();

    return (
        <PageLayout>
            <div className="mb-lg">
                <h1 className="text-xl uppercase tracking-wide">Sales</h1>
            </div>

            <div className="bg-background-secondary rounded p-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>THUMB</TableHead>
                            <TableHead>TITLE</TableHead>
                            <TableHead>YEAR</TableHead>
                            <TableHead>DIMENSIONS</TableHead>
                            <TableHead>CLIENT</TableHead>
                            <TableHead>TYPE</TableHead>
                            <TableHead>PRICE</TableHead>
                            <TableHead>DATE</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center text-text-muted">
                                    Loading sales...
                                </TableCell>
                            </TableRow>
                        )}
                        {sales?.map((sale) => (
                            <TableRow key={sale.id}>
                                <TableCell>
                                    <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-500 rounded" />
                                </TableCell>
                                <TableCell className="font-medium">{sale.artworkTitle}</TableCell>
                                <TableCell>{sale.year}</TableCell>
                                <TableCell>{sale.dimensions}</TableCell>
                                <TableCell>{sale.client}</TableCell>
                                <TableCell>{sale.type}</TableCell>
                                <TableCell>
                                    {sale.price} {sale.currency}
                                </TableCell>
                                <TableCell>{sale.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </PageLayout>
    );
}
