import * as admin from 'firebase-admin';
import { Category, ICategoryRepository } from '../../domain/repositories/ICategoryRepository';

/**
 * Firebase Admin Firestore Implementation
 */
export class CategoryRepository implements ICategoryRepository {
    private collectionRef: admin.firestore.CollectionReference;

    constructor(private firestore: admin.firestore.Firestore) {
        this.collectionRef = firestore.collection('categories');
    }

    async getById(id: string): Promise<Category | null> {
        const docRef = this.collectionRef.doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return null;
        }

        const data = docSnap.data()!;
        return {
            id: docSnap.id,
            userId: data.userId,
            key: data.key || data.name || 'Unknown',
            type: data.type || 'EXPENSE',
            icon: data.icon || '📦',
            color: data.color || '#808080',
        };
    }

    async getAll(userId: string): Promise<Category[]> {
        const q = this.collectionRef.where('userId', '==', userId);
        const querySnapshot = await q.get();

        return querySnapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                userId: data.userId,
                key: data.key || data.name || 'Unknown',
                type: data.type || 'EXPENSE',
                icon: data.icon || '📦',
                color: data.color || '#808080',
            };
        });
    }
}
