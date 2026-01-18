import * as admin from 'firebase-admin';
import { CashPool, ICashPoolRepository } from '../../domain/repositories/ICashPoolRepository';

/**
 * Firebase Admin Firestore Implementation
 */
export class CashPoolRepository implements ICashPoolRepository {
    private collectionRef: admin.firestore.CollectionReference;

    constructor(private firestore: admin.firestore.Firestore) {
        this.collectionRef = firestore.collection('cashPools');
    }

    async getById(id: string): Promise<CashPool | null> {
        const docRef = this.collectionRef.doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return null;
        }

        const data = docSnap.data()!;
        return {
            id: docSnap.id,
            userId: data.userId,
            name: data.name,
            balance: data.balance || 0,
            currency: data.currency || 'INR',
            isActive: data.isActive !== false,
        };
    }

    async getAll(userId: string): Promise<CashPool[]> {
        const q = this.collectionRef.where('userId', '==', userId);
        const querySnapshot = await q.get();

        return querySnapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                userId: data.userId,
                name: data.name,
                balance: data.balance || 0,
                currency: data.currency || 'INR',
                isActive: data.isActive !== false,
            };
        });
    }
}
