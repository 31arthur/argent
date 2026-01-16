import { useQuery } from '@tanstack/react-query';
import type { Sale } from '@/domain/entities/Sale';
import { GetLatestSales } from '@/domain/usecases/GetLatestSales';
import { SaleRepository } from '@/data/repositories/SaleRepository';
import { MockSaleDataSource } from '@/data/datasources/MockSaleDataSource';

/**
 * Custom Hook: useSales
 */
export function useSales(limit?: number) {
    return useQuery<Sale[], Error>({
        queryKey: ['sales', limit],
        queryFn: async () => {
            const dataSource = new MockSaleDataSource();
            const repository = new SaleRepository(dataSource);
            const useCase = new GetLatestSales(repository);

            return await useCase.execute(limit);
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
}
