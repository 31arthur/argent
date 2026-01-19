import * as admin from 'firebase-admin';
import type { Transaction } from '../../domain/entities/Transaction';
import type { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';

/**
 * Transaction Repository Implementation
 * Implements ITransactionRepository using Firebase Admin SDK
 * Designed for Cloud Functions deployment
 */
export class TransactionRepository implements ITransactionRepository {
    private readonly collectionName = 'transactions';

    constructor(private firestore: admin.firestore.Firestore) { }

    async getAll(userId: string): Promise<Transaction[]> {
        const snapshot = await this.firestore
            .collection(this.collectionName)
            .where('userId', '==', userId)
            .where('isDeleted', '==', false)
            .orderBy('date', 'desc')
            .get();

        return snapshot.docs.map(doc => this.mapToTransaction(doc));
    }

    async getById(id: string): Promise<Transaction | null> {
        const doc = await this.firestore
            .collection(this.collectionName)
            .doc(id)
            .get();

        if (!doc.exists) {
            return null;
        }

        return this.mapToTransaction(doc);
    }

    async getByPool(poolId: string): Promise<Transaction[]> {
        const snapshot = await this.firestore
            .collection(this.collectionName)
            .where('poolId', '==', poolId)
            .where('isDeleted', '==', false)
            .orderBy('date', 'desc')
            .get();

        return snapshot.docs.map(doc => this.mapToTransaction(doc));
    }

    async getByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
        const snapshot = await this.firestore
            .collection(this.collectionName)
            .where('userId', '==', userId)
            .where('date', '>=', admin.firestore.Timestamp.fromDate(startDate))
            .where('date', '<=', admin.firestore.Timestamp.fromDate(endDate))
            .where('isDeleted', '==', false)
            .orderBy('date', 'desc')
            .get();

        return snapshot.docs.map(doc => this.mapToTransaction(doc));
    }

    async getByCategory(userId: string, categoryId: string): Promise<Transaction[]> {
        const snapshot = await this.firestore
            .collection(this.collectionName)
            .where('userId', '==', userId)
            .where('categoryId', '==', categoryId)
            .where('isDeleted', '==', false)
            .orderBy('date', 'desc')
            .get();

        return snapshot.docs.map(doc => this.mapToTransaction(doc));
    }

    async search(userId: string, query: string): Promise<Transaction[]> {
        // Note: Firestore doesn't support full-text search natively
        // This is a simple implementation that searches in purpose field
        const snapshot = await this.firestore
            .collection(this.collectionName)
            .where('userId', '==', userId)
            .where('isDeleted', '==', false)
            .get();

        const results = snapshot.docs
            .map(doc => this.mapToTransaction(doc))
            .filter(txn =>
                txn.purpose.toLowerCase().includes(query.toLowerCase()) ||
                (txn.notes && txn.notes.toLowerCase().includes(query.toLowerCase()))
            );

        return results;
    }

    async create(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
        const now = admin.firestore.Timestamp.now();
        const docData = {
            userId: transaction.userId,
            poolId: transaction.poolId,
            amount: transaction.amount,
            type: transaction.type,
            categoryId: transaction.categoryId,
            purpose: transaction.purpose,
            notes: transaction.notes || null,
            tags: transaction.tags || [],
            date: admin.firestore.Timestamp.fromDate(transaction.date),
            payeeType: transaction.payeeType || null,
            payeeId: transaction.payeeId || null,
            linkedLoanId: transaction.linkedLoanId || null,
            isLoanRepayment: transaction.isLoanRepayment || false,
            createdAt: now,
            updatedAt: now,
            isDeleted: false,
        };

        const docRef = await this.firestore
            .collection(this.collectionName)
            .add(docData);

        return {
            id: docRef.id,
            ...transaction,
            tags: docData.tags,
            payeeType: docData.payeeType || undefined,
            payeeId: docData.payeeId || undefined,
            linkedLoanId: docData.linkedLoanId || undefined,
            isLoanRepayment: docData.isLoanRepayment,
            createdAt: now.toDate(),
            updatedAt: now.toDate(),
            isDeleted: false,
        };
    }

    async update(id: string, transaction: Partial<Transaction>): Promise<Transaction> {
        const updateData: any = {
            updatedAt: admin.firestore.Timestamp.now(),
        };

        if (transaction.amount !== undefined) updateData.amount = transaction.amount;
        if (transaction.type !== undefined) updateData.type = transaction.type;
        if (transaction.categoryId !== undefined) updateData.categoryId = transaction.categoryId;
        if (transaction.purpose !== undefined) updateData.purpose = transaction.purpose;
        if (transaction.notes !== undefined) updateData.notes = transaction.notes || null;
        if (transaction.tags !== undefined) updateData.tags = transaction.tags;
        if (transaction.date !== undefined) {
            updateData.date = admin.firestore.Timestamp.fromDate(transaction.date);
        }

        await this.firestore
            .collection(this.collectionName)
            .doc(id)
            .update(updateData);

        const updated = await this.getById(id);
        if (!updated) {
            throw new Error(`Transaction with id ${id} not found after update`);
        }

        return updated;
    }

    async softDelete(id: string): Promise<void> {
        await this.firestore
            .collection(this.collectionName)
            .doc(id)
            .update({
                isDeleted: true,
                deletedAt: admin.firestore.Timestamp.now(),
            });
    }

    async permanentDelete(id: string): Promise<void> {
        await this.firestore
            .collection(this.collectionName)
            .doc(id)
            .delete();
    }

    private mapToTransaction(doc: admin.firestore.DocumentSnapshot): Transaction {
        const data = doc.data()!;
        return {
            id: doc.id,
            userId: data.userId,
            poolId: data.poolId,
            amount: data.amount,
            type: data.type,
            categoryId: data.categoryId,
            purpose: data.purpose,
            notes: data.notes || undefined,
            tags: data.tags || [],
            date: data.date?.toDate() || new Date(),
            payeeType: data.payeeType || undefined,
            payeeId: data.payeeId || undefined,
            linkedLoanId: data.linkedLoanId || undefined,
            isLoanRepayment: data.isLoanRepayment || false,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            isDeleted: data.isDeleted || false,
            deletedAt: data.deletedAt?.toDate(),
        };
    }
}
