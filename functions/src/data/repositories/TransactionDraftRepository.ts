import * as admin from 'firebase-admin';
import { TransactionDraft } from '../../domain/entities/TransactionDraft';
import { DraftStatus } from '../../domain/entities/DraftStatus';
import { ITransactionDraftRepository } from '../../domain/repositories/ITransactionDraftRepository';

/**
 * Firestore Document Type
 */
interface TransactionDraftDoc {
    userId: string;
    conversationId: string;
    extractedFields: Record<string, unknown>;
    confidenceMap: Record<string, number>;
    missingFields: string[];
    status: DraftStatus;
    createdAt: admin.firestore.Timestamp;
    updatedAt: admin.firestore.Timestamp;
    confirmedAt: admin.firestore.Timestamp | null;
    cancelledAt: admin.firestore.Timestamp | null;
    finalizedAt: admin.firestore.Timestamp | null;
    transactionId: string | null;
    isDeleted: boolean;
}

/**
 * Firebase Admin Firestore Implementation
 */
export class TransactionDraftRepository implements ITransactionDraftRepository {
    private collectionRef: admin.firestore.CollectionReference;

    constructor(private firestore: admin.firestore.Firestore) {
        this.collectionRef = firestore.collection('transactionDrafts');
    }

    async getById(id: string): Promise<TransactionDraft | null> {
        const docRef = this.collectionRef.doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return null;
        }

        return this.convertFromFirestore(id, docSnap.data() as TransactionDraftDoc);
    }

    async getByConversation(conversationId: string): Promise<TransactionDraft | null> {
        const q = this.collectionRef
            .where('conversationId', '==', conversationId)
            .where('isDeleted', '==', false)
            .orderBy('createdAt', 'desc')
            .limit(1);

        const querySnapshot = await q.get();

        if (querySnapshot.empty) {
            return null;
        }

        const docSnap = querySnapshot.docs[0];
        return this.convertFromFirestore(docSnap.id, docSnap.data() as TransactionDraftDoc);
    }

    async getAllByUser(userId: string): Promise<TransactionDraft[]> {
        const q = this.collectionRef
            .where('userId', '==', userId)
            .where('isDeleted', '==', false)
            .orderBy('createdAt', 'desc');

        const querySnapshot = await q.get();

        return querySnapshot.docs.map((docSnap) =>
            this.convertFromFirestore(docSnap.id, docSnap.data() as TransactionDraftDoc)
        );
    }

    async create(
        draft: Omit<TransactionDraft, 'id' | 'createdAt' | 'updatedAt' | 'confirmedAt' | 'cancelledAt' | 'finalizedAt' | 'transactionId' | 'isDeleted'>
    ): Promise<TransactionDraft> {
        const docRef = this.collectionRef.doc();
        const now = admin.firestore.FieldValue.serverTimestamp();

        const firestoreDoc = {
            userId: draft.userId,
            conversationId: draft.conversationId,
            extractedFields: draft.extractedFields || {},
            confidenceMap: draft.confidenceMap || {},
            missingFields: draft.missingFields || [],
            status: draft.status,
            createdAt: now,
            updatedAt: now,
            confirmedAt: null,
            cancelledAt: null,
            finalizedAt: null,
            transactionId: null,
            isDeleted: false,
        };

        await docRef.set(firestoreDoc);

        const createdDoc = await docRef.get();
        if (!createdDoc.exists) {
            throw new Error('Failed to create draft');
        }

        return this.convertFromFirestore(docRef.id, createdDoc.data() as TransactionDraftDoc);
    }

    async update(id: string, updates: Partial<TransactionDraft>): Promise<TransactionDraft> {
        const docRef = this.collectionRef.doc(id);

        // Build update object
        const updateData: Record<string, unknown> = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (updates.extractedFields !== undefined) {
            updateData.extractedFields = updates.extractedFields;
        }
        if (updates.confidenceMap !== undefined) {
            updateData.confidenceMap = updates.confidenceMap;
        }
        if (updates.missingFields !== undefined) {
            updateData.missingFields = updates.missingFields;
        }
        if (updates.status !== undefined) {
            updateData.status = updates.status;
        }

        await docRef.update(updateData);

        const updatedDoc = await docRef.get();
        if (!updatedDoc.exists) {
            throw new Error('Draft not found after update');
        }

        return this.convertFromFirestore(id, updatedDoc.data() as TransactionDraftDoc);
    }

    async markAsConfirmed(id: string): Promise<TransactionDraft> {
        const docRef = this.collectionRef.doc(id);

        await docRef.update({
            status: DraftStatus.CONFIRMED,
            confirmedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const updatedDoc = await docRef.get();
        if (!updatedDoc.exists) {
            throw new Error('Draft not found after update');
        }

        return this.convertFromFirestore(id, updatedDoc.data() as TransactionDraftDoc);
    }

    async markAsCancelled(id: string): Promise<TransactionDraft> {
        const docRef = this.collectionRef.doc(id);

        await docRef.update({
            status: DraftStatus.CANCELLED,
            cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const updatedDoc = await docRef.get();
        if (!updatedDoc.exists) {
            throw new Error('Draft not found after update');
        }

        return this.convertFromFirestore(id, updatedDoc.data() as TransactionDraftDoc);
    }

    async markAsFinalized(id: string, transactionId: string): Promise<TransactionDraft> {
        const docRef = this.collectionRef.doc(id);

        await docRef.update({
            status: DraftStatus.FINALIZED,
            transactionId,
            finalizedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const updatedDoc = await docRef.get();
        if (!updatedDoc.exists) {
            throw new Error('Draft not found after update');
        }

        return this.convertFromFirestore(id, updatedDoc.data() as TransactionDraftDoc);
    }

    async softDelete(id: string): Promise<void> {
        const docRef = this.collectionRef.doc(id);
        await docRef.update({
            isDeleted: true,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }

    private convertFromFirestore(id: string, doc: TransactionDraftDoc): TransactionDraft {
        // Convert date fields in extractedFields
        const extractedFields = { ...doc.extractedFields };
        if (extractedFields.date && (extractedFields.date as any).toDate) {
            extractedFields.date = (extractedFields.date as admin.firestore.Timestamp).toDate();
        }

        return {
            id,
            userId: doc.userId,
            conversationId: doc.conversationId,
            extractedFields,
            confidenceMap: doc.confidenceMap,
            missingFields: doc.missingFields,
            status: doc.status,
            createdAt: doc.createdAt.toDate(),
            updatedAt: doc.updatedAt.toDate(),
            confirmedAt: doc.confirmedAt ? doc.confirmedAt.toDate() : null,
            cancelledAt: doc.cancelledAt ? doc.cancelledAt.toDate() : null,
            finalizedAt: doc.finalizedAt ? doc.finalizedAt.toDate() : null,
            transactionId: doc.transactionId,
            isDeleted: doc.isDeleted,
        };
    }
}
