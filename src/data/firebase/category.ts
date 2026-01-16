import {
    collection,
    getDocs,
    addDoc,
    query,
    where,
    Timestamp,
    type DocumentData,
} from 'firebase/firestore';
import { db } from './config';
import type { Category } from '@/domain/entities/Category';
import type { TransactionType } from '@/domain/entities/Transaction';

/**
 * Firebase Firestore Adapter for Categories
 * Handles all Firestore operations for categories
 */
export class FirebaseCategoryDataSource {
    private collectionName = 'categories';

    /**
     * Get all categories for a user
     */
    async getAll(userId: string): Promise<Category[]> {
        const q = query(collection(db, this.collectionName), where('userId', '==', userId));

        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => this.toDomainModel(doc.id, doc.data()));
    }

    /**
     * Get categories by type
     */
    async getByType(userId: string, type: TransactionType): Promise<Category[]> {
        const q = query(
            collection(db, this.collectionName),
            where('userId', '==', userId),
            where('type', '==', type)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => this.toDomainModel(doc.id, doc.data()));
    }

    /**
     * Create category
     */
    async create(category: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
        const data = {
            ...category,
            createdAt: Timestamp.now(),
        };

        const docRef = await addDoc(collection(db, this.collectionName), data);
        return this.toDomainModel(docRef.id, { ...data, id: docRef.id });
    }

    /**
     * Initialize default categories for a new user
     */
    async initializeDefaultCategories(userId: string): Promise<void> {
        const defaultCategories = [
            // Expense categories
            { key: 'food', icon: '🍔', color: '#ff6b6b', type: 'EXPENSE' as const },
            { key: 'transport', icon: '🚗', color: '#4ecdc4', type: 'EXPENSE' as const },
            { key: 'shopping', icon: '🛍️', color: '#95e1d3', type: 'EXPENSE' as const },
            { key: 'entertainment', icon: '🎬', color: '#f38181', type: 'EXPENSE' as const },
            { key: 'health', icon: '🏥', color: '#aa96da', type: 'EXPENSE' as const },
            { key: 'education', icon: '📚', color: '#fcbad3', type: 'EXPENSE' as const },
            { key: 'utilities', icon: '💡', color: '#ffd93d', type: 'EXPENSE' as const },
            { key: 'rent', icon: '🏠', color: '#6bcf7f', type: 'EXPENSE' as const },
            { key: 'office', icon: '🖊️', color: '#457b9d', type: 'EXPENSE' as const },
            { key: 'travel', icon: '✈️', color: '#1d3557', type: 'EXPENSE' as const },
            { key: 'other', icon: '📦', color: '#a8dadc', type: 'EXPENSE' as const },

            // Income categories
            { key: 'salary', icon: '💼', color: '#10b981', type: 'INCOME' as const },
            { key: 'freelance', icon: '💻', color: '#059669', type: 'INCOME' as const },
            { key: 'refund', icon: '🔄', color: '#34d399', type: 'INCOME' as const },
            { key: 'interest', icon: '📈', color: '#6ee7b7', type: 'INCOME' as const },
            { key: 'gift', icon: '🎁', color: '#a7f3d0', type: 'INCOME' as const },
            { key: 'investment', icon: '💰', color: '#047857', type: 'INCOME' as const },
            { key: 'other', icon: '📱', color: '#86efac', type: 'INCOME' as const },
        ];

        const promises = defaultCategories.map((cat) =>
            this.create({
                userId,
                key: cat.key,
                icon: cat.icon,
                color: cat.color,
                type: cat.type,
                isDefault: true,
            })
        );

        await Promise.all(promises);
    }

    /**
     * Convert Firestore document to domain model
     * Handles migration from old 'name' field to new 'key' field
     */
    private toDomainModel(id: string, data: any): Category {
        // Migration: Extract key from old 'name' field if 'key' doesn't exist
        let key = data.key;
        if (!key && data.name) {
            // Old format: "categories.expense.food" → "food"
            const parts = data.name.split('.');
            key = parts[parts.length - 1];
        }

        return {
            id,
            userId: data.userId,
            key: key || 'other', // Fallback to 'other' if no key found
            icon: data.icon,
            color: data.color,
            type: data.type,
            isDefault: data.isDefault || false,
            createdAt: data.createdAt?.toDate() || new Date(),
        };
    }
}
