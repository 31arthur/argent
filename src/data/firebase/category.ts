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
            // Personal categories
            { name: 'categories.personal.food', icon: '🍽️', color: '#ff6b6b', type: 'personal' as const },
            { name: 'categories.personal.transport', icon: '🚗', color: '#4ecdc4', type: 'personal' as const },
            { name: 'categories.personal.shopping', icon: '🛍️', color: '#95e1d3', type: 'personal' as const },
            { name: 'categories.personal.entertainment', icon: '🎬', color: '#f38181', type: 'personal' as const },
            { name: 'categories.personal.health', icon: '💊', color: '#aa96da', type: 'personal' as const },
            { name: 'categories.personal.education', icon: '📚', color: '#fcbad3', type: 'personal' as const },
            { name: 'categories.personal.utilities', icon: '⚡', color: '#ffffd2', type: 'personal' as const },
            { name: 'categories.personal.other', icon: '📦', color: '#a8dadc', type: 'personal' as const },

            // Office categories
            { name: 'categories.office.supplies', icon: '📎', color: '#457b9d', type: 'office' as const },
            { name: 'categories.office.travel', icon: '✈️', color: '#1d3557', type: 'office' as const },
            { name: 'categories.office.meals', icon: '☕', color: '#e63946', type: 'office' as const },
            { name: 'categories.office.software', icon: '💻', color: '#f1faee', type: 'office' as const },
            { name: 'categories.office.equipment', icon: '🖨️', color: '#a8dadc', type: 'office' as const },
            { name: 'categories.office.other', icon: '📋', color: '#457b9d', type: 'office' as const },
        ];

        const promises = defaultCategories.map((cat) =>
            this.create({
                userId,
                name: cat.name,
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
     */
    private toDomainModel(id: string, data: DocumentData): Category {
        return {
            id,
            userId: data.userId,
            name: data.name,
            icon: data.icon,
            color: data.color,
            type: data.type,
            isDefault: data.isDefault || false,
            createdAt: data.createdAt?.toDate() || new Date(),
        };
    }
}
