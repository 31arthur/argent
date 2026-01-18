import * as admin from 'firebase-admin';

export interface Transaction {
    id: string;
    userId: string;
    poolId: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    categoryId: string;
    purpose: string;
    date: Date;
    notes?: string;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ITransactionRepository {
    create(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction>;
    getById(id: string): Promise<Transaction | null>;
}

/**
 * Firebase Admin Firestore Implementation for Transactions
 */
export class TransactionRepository implements ITransactionRepository {
    private collectionRef: admin.firestore.CollectionReference;

    constructor(private firestore: admin.firestore.Firestore) {
        this.collectionRef = firestore.collection('transactions');
    }

    async create(data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
        const docRef = this.collectionRef.doc();
        const now = admin.firestore.Timestamp.now();

        const transactionData = {
            ...data,
            date: admin.firestore.Timestamp.fromDate(data.date),
            createdAt: now,
            updatedAt: now,
        };

        await docRef.set(transactionData);

        return {
            id: docRef.id,
            ...data,
            createdAt: now.toDate(),
            updatedAt: now.toDate(),
        };
    }

    async getById(id: string): Promise<Transaction | null> {
        const docRef = this.collectionRef.doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return null;
        }

        const data = docSnap.data()!;
        return {
            id: docSnap.id,
            userId: data.userId,
            poolId: data.poolId,
            amount: data.amount,
            type: data.type,
            categoryId: data.categoryId,
            purpose: data.purpose,
            date: data.date.toDate(),
            notes: data.notes,
            tags: data.tags,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
        };
    }
}
