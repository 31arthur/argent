import type { Budget } from '@/domain/entities/Budget';
import type { IBudgetRepository } from '@/domain/repositories/IBudgetRepository';
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
    orderBy,
    Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Budget Repository Implementation
 * Implements IBudgetRepository using Firestore
 */
export class BudgetRepository implements IBudgetRepository {
    private collectionName = 'budgets';

    async getAll(userId: string): Promise<Budget[]> {
        const q = query(
            collection(db, this.collectionName),
            where('userId', '==', userId),
            orderBy('year', 'desc'),
            orderBy('month', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => this.mapDocToBudget(doc.id, doc.data()));
    }

    async getById(id: string): Promise<Budget | null> {
        const docRef = doc(db, this.collectionName, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        return this.mapDocToBudget(docSnap.id, docSnap.data());
    }

    async getByMonthYear(userId: string, year: number, month: number): Promise<Budget | null> {
        const q = query(
            collection(db, this.collectionName),
            where('userId', '==', userId),
            where('year', '==', year),
            where('month', '==', month)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return null;
        }

        const firstDoc = snapshot.docs[0];
        return this.mapDocToBudget(firstDoc.id, firstDoc.data());
    }

    async getByYear(userId: string, year: number): Promise<Budget[]> {
        const q = query(
            collection(db, this.collectionName),
            where('userId', '==', userId),
            where('year', '==', year),
            orderBy('month', 'asc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => this.mapDocToBudget(doc.id, doc.data()));
    }

    async create(budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Promise<Budget> {
        const now = Timestamp.now();
        const docData = {
            ...budget,
            createdAt: now,
            updatedAt: now,
        };

        const docRef = await addDoc(collection(db, this.collectionName), docData);

        return {
            id: docRef.id,
            ...budget,
            createdAt: now.toDate(),
            updatedAt: now.toDate(),
        };
    }

    async update(id: string, budget: Partial<Budget>): Promise<Budget> {
        const docRef = doc(db, this.collectionName, id);
        const now = Timestamp.now();

        const updateData = {
            ...budget,
            updatedAt: now,
        };

        await updateDoc(docRef, updateData);

        const updated = await this.getById(id);
        if (!updated) {
            throw new Error(`Budget with id ${id} not found after update`);
        }

        return updated;
    }

    async delete(id: string): Promise<void> {
        const docRef = doc(db, this.collectionName, id);
        await deleteDoc(docRef);
    }

    private mapDocToBudget(id: string, data: any): Budget {
        return {
            id,
            userId: data.userId,
            month: data.month,
            year: data.year,
            name: data.name,
            notes: data.notes,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
        };
    }
}
