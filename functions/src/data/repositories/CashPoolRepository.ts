import * as admin from 'firebase-admin';
import type { CashPool } from '../../domain/entities/CashPool';
import type { ICashPoolRepository } from '../../domain/repositories/ICashPoolRepository';

/**
 * Cash Pool Repository Implementation
 * Implements ICashPoolRepository using injected Firestore instance
 */
export class CashPoolRepository implements ICashPoolRepository {
    constructor(private firestore: admin.firestore.Firestore) { }

    async getAll(userId: string): Promise<CashPool[]> {
        const snapshot = await this.firestore
            .collection('pools')
            .where('userId', '==', userId)
            .where('isActive', '==', true)
            .get();

        return snapshot.docs.map(doc => this.convertFromFirestore(doc));
    }

    async getById(id: string): Promise<CashPool | null> {
        const doc = await this.firestore.collection('pools').doc(id).get();
        if (!doc.exists) return null;
        return this.convertFromFirestore(doc);
    }

    async create(pool: Omit<CashPool, 'id' | 'createdAt' | 'updatedAt'>): Promise<CashPool> {
        const docRef = await this.firestore.collection('pools').add({
            ...pool,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const doc = await docRef.get();
        return this.convertFromFirestore(doc);
    }

    async update(id: string, pool: Partial<CashPool>): Promise<CashPool> {
        await this.firestore.collection('pools').doc(id).update({
            ...pool,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const doc = await this.firestore.collection('pools').doc(id).get();
        return this.convertFromFirestore(doc);
    }

    async delete(id: string): Promise<void> {
        await this.firestore.collection('pools').doc(id).update({
            isActive: false,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }

    async updateBalance(id: string, amount: number): Promise<void> {
        await this.firestore.collection('pools').doc(id).update({
            balance: amount,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }

    private convertFromFirestore(doc: admin.firestore.DocumentSnapshot): CashPool {
        const data = doc.data()!;
        return {
            id: doc.id,
            userId: data.userId,
            name: data.name,
            type: data.type || 'bank',
            balance: data.balance,
            initialBalance: data.initialBalance || 0,
            currency: data.currency,
            isActive: data.isActive !== false,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
        };
    }
}

