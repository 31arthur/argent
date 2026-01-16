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
import type { Transaction } from '@/domain/entities/Transaction';

/**
 * Firebase Firestore Adapter for Transactions
 * Handles all Firestore operations for transactions
 */
export class FirebaseTransactionDataSource {
    private collectionName = 'transactions';

    /**
     * Get all transactions for a user (non-deleted only)
     */
    async getAll(userId: string): Promise<Transaction[]> {
        const q = query(
            collection(db, this.collectionName),
            where('userId', '==', userId),
            where('isDeleted', '==', false)
        );

        const snapshot = await getDocs(q);
        const transactions = snapshot.docs.map((doc) => this.toDomainModel(doc.id, doc.data()));

        // Sort by date in descending order (newest first)
        return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    /**
     * Get transaction by ID
     */
    async getById(id: string): Promise<Transaction | null> {
        const docRef = doc(db, this.collectionName, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        return this.toDomainModel(docSnap.id, docSnap.data());
    }

    /**
     * Get transactions by pool
     */
    async getByPool(poolId: string): Promise<Transaction[]> {
        const q = query(
            collection(db, this.collectionName),
            where('poolId', '==', poolId),
            where('isDeleted', '==', false)
        );

        const snapshot = await getDocs(q);
        const transactions = snapshot.docs.map((doc) => this.toDomainModel(doc.id, doc.data()));

        // Sort by date in descending order (newest first)
        return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    /**
     * Get transactions by date range
     */
    async getByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
        const q = query(
            collection(db, this.collectionName),
            where('userId', '==', userId),
            where('isDeleted', '==', false),
            where('date', '>=', Timestamp.fromDate(startDate)),
            where('date', '<=', Timestamp.fromDate(endDate))
        );

        const snapshot = await getDocs(q);
        const transactions = snapshot.docs.map((doc) => this.toDomainModel(doc.id, doc.data()));

        // Sort by date in descending order (newest first)
        return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    /**
     * Get transactions by category
     */
    async getByCategory(userId: string, categoryId: string): Promise<Transaction[]> {
        const q = query(
            collection(db, this.collectionName),
            where('userId', '==', userId),
            where('categoryId', '==', categoryId),
            where('isDeleted', '==', false)
        );

        const snapshot = await getDocs(q);
        const transactions = snapshot.docs.map((doc) => this.toDomainModel(doc.id, doc.data()));

        // Sort by date in descending order (newest first)
        return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    /**
     * Search transactions by purpose
     */
    async search(userId: string, searchQuery: string): Promise<Transaction[]> {
        // Note: Firestore doesn't support full-text search natively
        // This is a simple implementation - for production, consider Algolia or similar
        const q = query(
            collection(db, this.collectionName),
            where('userId', '==', userId),
            where('isDeleted', '==', false)
        );

        const snapshot = await getDocs(q);
        const allTransactions = snapshot.docs.map((doc) => this.toDomainModel(doc.id, doc.data()));

        // Client-side filtering
        const lowerQuery = searchQuery.toLowerCase();
        const filtered = allTransactions.filter(
            (t) =>
                t.purpose.toLowerCase().includes(lowerQuery) ||
                t.notes?.toLowerCase().includes(lowerQuery) ||
                t.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
        );

        // Sort by date in descending order (newest first)
        return filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    /**
     * Create new transaction
     */
    async create(
        transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<Transaction> {
        const now = Timestamp.now();

        // Remove undefined values (Firestore doesn't support them)
        const cleanedTransaction: any = {};
        Object.keys(transaction).forEach((key) => {
            const value = (transaction as any)[key];
            if (value !== undefined) {
                cleanedTransaction[key] = value;
            }
        });

        const data = {
            ...cleanedTransaction,
            date: Timestamp.fromDate(transaction.date),
            createdAt: now,
            updatedAt: now,
        };

        const docRef = await addDoc(collection(db, this.collectionName), data);
        return this.toDomainModel(docRef.id, { ...data, id: docRef.id });
    }

    /**
     * Update transaction
     */
    async update(id: string, updates: Partial<Transaction>): Promise<Transaction> {
        const docRef = doc(db, this.collectionName, id);
        const updateData: any = {
            ...updates,
            updatedAt: Timestamp.now(),
        };

        if (updates.date) {
            updateData.date = Timestamp.fromDate(updates.date);
        }

        await updateDoc(docRef, updateData);

        const updated = await this.getById(id);
        if (!updated) {
            throw new Error('Transaction not found after update');
        }

        return updated;
    }

    /**
     * Soft delete transaction
     */
    async softDelete(id: string): Promise<void> {
        const docRef = doc(db, this.collectionName, id);
        await updateDoc(docRef, {
            isDeleted: true,
            deletedAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });
    }

    /**
     * Convert Firestore document to domain model
     */
    private toDomainModel(id: string, data: DocumentData): Transaction {
        return {
            id,
            userId: data.userId,
            poolId: data.poolId,
            amount: data.amount,
            type: data.type,
            categoryId: data.categoryId,
            purpose: data.purpose,
            notes: data.notes,
            tags: data.tags || [],
            date: data.date?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            isDeleted: data.isDeleted || false,
            deletedAt: data.deletedAt?.toDate(),
        };
    }
}
