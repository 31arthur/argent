import * as admin from 'firebase-admin';
import type { Category } from '../../domain/entities/Category';
import type { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import type { TransactionType } from '../../domain/entities/Transaction';

/**
 * Category Repository Implementation
 * Implements ICategoryRepository using Firestore via injected instance
 */
export class CategoryRepository implements ICategoryRepository {
    constructor(private firestore: admin.firestore.Firestore) { }

    async getAll(userId: string): Promise<Category[]> {
        const snapshot = await this.firestore
            .collection('categories')
            .where('userId', '==', userId)
            .where('isDeleted', '==', false)
            .get();

        return snapshot.docs.map(doc => this.mapToCategory(doc));
    }

    async getById(id: string): Promise<Category | null> {
        const doc = await this.firestore.collection('categories').doc(id).get();
        if (!doc.exists) return null;
        return this.mapToCategory(doc);
    }

    async getByType(userId: string, type: TransactionType): Promise<Category[]> {
        const snapshot = await this.firestore
            .collection('categories')
            .where('userId', '==', userId)
            .where('type', '==', type)
            .where('isDeleted', '==', false)
            .get();

        return snapshot.docs.map(doc => this.mapToCategory(doc));
    }

    async create(category: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
        const docRef = await this.firestore.collection('categories').add({
            ...category,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            isDeleted: false,
        });

        const doc = await docRef.get();
        return this.mapToCategory(doc);
    }

    async update(id: string, category: Partial<Category>): Promise<Category> {
        await this.firestore.collection('categories').doc(id).update(category);
        const doc = await this.firestore.collection('categories').doc(id).get();
        return this.mapToCategory(doc);
    }

    async delete(id: string): Promise<void> {
        await this.firestore.collection('categories').doc(id).update({
            isDeleted: true,
        });
    }

    async initializeDefaultCategories(userId: string): Promise<void> {
        // Implementation for initializing default categories
        // This can be implemented as needed
    }

    private mapToCategory(doc: admin.firestore.DocumentSnapshot): Category {
        const data = doc.data()!;
        return {
            id: doc.id,
            userId: data.userId,
            key: data.key || data.name,
            type: data.type,
            icon: data.icon,
            color: data.color,
            createdAt: data.createdAt?.toDate() || new Date(),
        };
    }
}
