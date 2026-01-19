import type { BudgetCategory } from '@/domain/entities/BudgetCategory';
import type { IBudgetCategoryRepository } from '@/domain/repositories/IBudgetCategoryRepository';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    writeBatch,
    Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * BudgetCategory Repository Implementation
 * Implements IBudgetCategoryRepository using Firestore
 */
export class BudgetCategoryRepository implements IBudgetCategoryRepository {
    private collectionName = 'budgetCategories';

    async getByBudgetId(budgetId: string): Promise<BudgetCategory[]> {
        const q = query(
            collection(db, this.collectionName),
            where('budgetId', '==', budgetId)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => this.mapDocToBudgetCategory(doc.id, doc.data()));
    }

    async getById(id: string): Promise<BudgetCategory | null> {
        const docRef = doc(db, this.collectionName, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        return this.mapDocToBudgetCategory(docSnap.id, docSnap.data());
    }

    async create(budgetCategory: Omit<BudgetCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<BudgetCategory> {
        const now = Timestamp.now();
        const docData = {
            ...budgetCategory,
            createdAt: now,
            updatedAt: now,
        };

        const docRef = await addDoc(collection(db, this.collectionName), docData);

        return {
            id: docRef.id,
            ...budgetCategory,
            createdAt: now.toDate(),
            updatedAt: now.toDate(),
        };
    }

    async update(id: string, budgetCategory: Partial<BudgetCategory>): Promise<BudgetCategory> {
        const docRef = doc(db, this.collectionName, id);
        const now = Timestamp.now();

        const updateData = {
            ...budgetCategory,
            updatedAt: now,
        };

        await updateDoc(docRef, updateData);

        const updated = await this.getById(id);
        if (!updated) {
            throw new Error(`BudgetCategory with id ${id} not found after update`);
        }

        return updated;
    }

    async delete(id: string): Promise<void> {
        const docRef = doc(db, this.collectionName, id);
        await deleteDoc(docRef);
    }

    async deleteByBudgetId(budgetId: string): Promise<void> {
        const q = query(
            collection(db, this.collectionName),
            where('budgetId', '==', budgetId)
        );

        const snapshot = await getDocs(q);
        const batch = writeBatch(db);

        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
    }

    async createMany(budgetCategories: Omit<BudgetCategory, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<BudgetCategory[]> {
        const batch = writeBatch(db);
        const now = Timestamp.now();
        const results: BudgetCategory[] = [];

        for (const budgetCategory of budgetCategories) {
            const docRef = doc(collection(db, this.collectionName));
            const docData = {
                ...budgetCategory,
                createdAt: now,
                updatedAt: now,
            };

            batch.set(docRef, docData);

            results.push({
                id: docRef.id,
                ...budgetCategory,
                createdAt: now.toDate(),
                updatedAt: now.toDate(),
            });
        }

        await batch.commit();
        return results;
    }

    private mapDocToBudgetCategory(id: string, data: any): BudgetCategory {
        return {
            id,
            budgetId: data.budgetId,
            categoryId: data.categoryId,
            plannedAmount: data.plannedAmount,
            notes: data.notes,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
        };
    }
}
