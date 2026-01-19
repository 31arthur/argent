import * as admin from 'firebase-admin';
import type { TransactionDraft } from '../../domain/entities/TransactionDraft';
import type { ITransactionDraftRepository } from '../../domain/repositories/ITransactionDraftRepository';
import { DraftStatus } from '../../domain/entities/DraftStatus';
import type { TransactionData } from '../../domain/value-objects/TransactionData';

/**
 * Transaction Draft Repository Implementation
 * Implements ITransactionDraftRepository using Firebase Admin SDK
 * Designed for Cloud Functions deployment
 */
export class TransactionDraftRepository implements ITransactionDraftRepository {
    private readonly collectionName = 'transactionDrafts';

    constructor(private firestore: admin.firestore.Firestore) { }

    async getById(id: string): Promise<TransactionDraft | null> {
        const doc = await this.firestore
            .collection(this.collectionName)
            .doc(id)
            .get();

        if (!doc.exists) {
            return null;
        }

        return this.mapToDraft(doc);
    }

    async getByConversation(conversationId: string): Promise<TransactionDraft | null> {
        const snapshot = await this.firestore
            .collection(this.collectionName)
            .where('conversationId', '==', conversationId)
            .where('isDeleted', '==', false)
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();

        if (snapshot.empty) {
            return null;
        }

        return this.mapToDraft(snapshot.docs[0]);
    }

    async getAllByUser(userId: string): Promise<TransactionDraft[]> {
        const snapshot = await this.firestore
            .collection(this.collectionName)
            .where('userId', '==', userId)
            .where('isDeleted', '==', false)
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map(doc => this.mapToDraft(doc));
    }

    async create(
        draft: Omit<TransactionDraft, ' id' | 'createdAt' | 'updatedAt'>
    ): Promise<TransactionDraft> {
        const now = admin.firestore.Timestamp.now();
        const docData = {
            userId: draft.userId,
            conversationId: draft.conversationId,
            status: draft.status,
            extractedFields: draft.extractedFields || {},
            confidenceMap: draft.confidenceMap || {},
            missingFields: draft.missingFields || [],
            isDeleted: draft.isDeleted || false,
            confirmedAt: draft.confirmedAt
                ? admin.firestore.Timestamp.fromDate(draft.confirmedAt)
                : null,
            cancelledAt: draft.cancelledAt
                ? admin.firestore.Timestamp.fromDate(draft.cancelledAt)
                : null,
            finalizedAt: draft.finalizedAt
                ? admin.firestore.Timestamp.fromDate(draft.finalizedAt)
                : null,
            transactionId: draft.transactionId || null,
            createdAt: now,
            updatedAt: now,
        };

        const docRef = await this.firestore
            .collection(this.collectionName)
            .add(docData);

        return {
            id: docRef.id,
            type: 'TRANSACTION',
            userId: docData.userId,
            conversationId: docData.conversationId,
            status: docData.status,
            extractedFields: docData.extractedFields as Partial<TransactionData>,
            confidenceMap: docData.confidenceMap,
            missingFields: docData.missingFields,
            isDeleted: docData.isDeleted,
            confirmedAt: docData.confirmedAt?.toDate(),
            cancelledAt: docData.cancelledAt?.toDate(),
            finalizedAt: docData.finalizedAt?.toDate(),
            transactionId: docData.transactionId || undefined,
            createdAt: now.toDate(),
            updatedAt: now.toDate(),
        };
    }

    async update(id: string, updates: Partial<TransactionDraft>): Promise<TransactionDraft> {
        const updateData: any = {
            updatedAt: admin.firestore.Timestamp.now(),
        };

        if (updates.status !== undefined) updateData.status = updates.status;
        if (updates.extractedFields !== undefined) updateData.extractedFields = updates.extractedFields;
        if (updates.confidenceMap !== undefined) updateData.confidenceMap = updates.confidenceMap;
        if (updates.missingFields !== undefined) updateData.missingFields = updates.missingFields;
        if (updates.confirmedAt !== undefined) {
            updateData.confirmedAt = updates.confirmedAt
                ? admin.firestore.Timestamp.fromDate(updates.confirmedAt)
                : null;
        }
        if (updates.cancelledAt !== undefined) {
            updateData.cancelledAt = updates.cancelledAt
                ? admin.firestore.Timestamp.fromDate(updates.cancelledAt)
                : null;
        }
        if (updates.finalizedAt !== undefined) {
            updateData.finalizedAt = updates.finalizedAt
                ? admin.firestore.Timestamp.fromDate(updates.finalizedAt)
                : null;
        }
        if (updates.transactionId !== undefined) {
            updateData.transactionId = updates.transactionId || null;
        }

        await this.firestore
            .collection(this.collectionName)
            .doc(id)
            .update(updateData);

        const updated = await this.getById(id);
        if (!updated) {
            throw new Error(`Draft with id ${id} not found after update`);
        }

        return updated;
    }

    async markAsConfirmed(id: string): Promise<TransactionDraft> {
        return this.update(id, {
            status: DraftStatus.CONFIRMED,
            confirmedAt: new Date(),
        });
    }

    async markAsCancelled(id: string): Promise<TransactionDraft> {
        return this.update(id, {
            status: DraftStatus.CANCELLED,
            cancelledAt: new Date(),
        });
    }

    async markAsFinalized(id: string, transactionId: string): Promise<TransactionDraft> {
        return this.update(id, {
            status: DraftStatus.FINALIZED,
            transactionId,
            finalizedAt: new Date(),
        });
    }

    async softDelete(id: string): Promise<void> {
        await this.firestore
            .collection(this.collectionName)
            .doc(id)
            .update({
                isDeleted: true,
                updatedAt: admin.firestore.Timestamp.now(),
            });
    }

    async permanentDelete(id: string): Promise<void> {
        await this.firestore
            .collection(this.collectionName)
            .doc(id)
            .delete();
    }

    private mapToDraft(doc: admin.firestore.DocumentSnapshot): TransactionDraft {
        const data = doc.data()!;
        return {
            id: doc.id,
            type: 'TRANSACTION',
            userId: data.userId,
            conversationId: data.conversationId,
            status: data.status,
            extractedFields: data.extractedFields as Partial<TransactionData>,
            confidenceMap: data.confidenceMap,
            missingFields: data.missingFields,
            isDeleted: data.isDeleted || false,
            confirmedAt: data.confirmedAt?.toDate(),
            cancelledAt: data.cancelledAt?.toDate(),
            finalizedAt: data.finalizedAt?.toDate(),
            transactionId: data.transactionId || undefined,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
        };
    }
}
