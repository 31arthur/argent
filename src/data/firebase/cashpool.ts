import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    query,
    where,
    Timestamp,
    type DocumentData,
} from 'firebase/firestore';
import { db } from './config';
import type { CashPool } from '@/domain/entities/CashPool';

/**
 * Firebase Firestore Adapter for Cash Pools
 * Handles all Firestore operations for cash pools
 */
export class FirebaseCashPoolDataSource {
    private collectionName = 'pools';

    /**
     * Get all pools for a user
     */
    async getAll(userId: string): Promise<CashPool[]> {
        const q = query(
            collection(db, this.collectionName),
            where('userId', '==', userId),
            where('isActive', '==', true)
        );

        const snapshot = await getDocs(q);
        const pools = snapshot.docs.map((doc) => this.toDomainModel(doc.id, doc.data()));

        // Sort by createdAt in descending order (newest first)
        return pools.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    /**
     * Get pool by ID
     */
    async getById(id: string): Promise<CashPool | null> {
        const docRef = doc(db, this.collectionName, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        return this.toDomainModel(docSnap.id, docSnap.data());
    }

    /**
     * Create new pool
     */
    async create(pool: Omit<CashPool, 'id' | 'createdAt' | 'updatedAt'>): Promise<CashPool> {
        const now = Timestamp.now();
        const data = {
            ...pool,
            balance: pool.initialBalance,
            createdAt: now,
            updatedAt: now,
        };

        const docRef = await addDoc(collection(db, this.collectionName), data);
        return this.toDomainModel(docRef.id, { ...data, id: docRef.id });
    }

    /**
     * Update pool
     */
    async update(id: string, updates: Partial<CashPool>): Promise<CashPool> {
        const docRef = doc(db, this.collectionName, id);
        const updateData = {
            ...updates,
            updatedAt: Timestamp.now(),
        };

        await updateDoc(docRef, updateData);

        const updated = await this.getById(id);
        if (!updated) {
            throw new Error('Pool not found after update');
        }

        return updated;
    }

    /**
     * Delete pool (soft delete)
     */
    async delete(id: string): Promise<void> {
        const docRef = doc(db, this.collectionName, id);
        await updateDoc(docRef, {
            isActive: false,
            updatedAt: Timestamp.now(),
        });
    }

    /**
     * Update pool balance
     */
    async updateBalance(id: string, amount: number): Promise<void> {
        const docRef = doc(db, this.collectionName, id);
        await updateDoc(docRef, {
            balance: amount,
            updatedAt: Timestamp.now(),
            lastTransactionAt: Timestamp.now(),
        });
    }

    /**
     * Convert Firestore document to domain model
     */
    private toDomainModel(id: string, data: DocumentData): CashPool {
        return {
            id,
            userId: data.userId,
            name: data.name,
            type: data.type,
            balance: data.balance,
            initialBalance: data.initialBalance,
            currency: data.currency || 'INR',
            icon: data.icon,
            color: data.color,
            isActive: data.isActive,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            lastTransactionAt: data.lastTransactionAt?.toDate(),
        };
    }
}
